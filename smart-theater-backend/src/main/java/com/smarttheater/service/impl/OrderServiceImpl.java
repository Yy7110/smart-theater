package com.smarttheater.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smarttheater.common.constant.RedisKeyConstants;
import com.smarttheater.common.exception.BusinessException;
import com.smarttheater.common.util.QrCodeUtil;
import com.smarttheater.entity.*;
import com.smarttheater.mapper.*;
import com.smarttheater.service.OrderService;
import com.smarttheater.vo.order.OrderVO;
import com.smarttheater.vo.order.TicketVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final ShowScheduleMapper scheduleMapper;
    private final ShowMapper showMapper;
    private final VenueMapper venueMapper;
    private final SeatMapper seatMapper;
    private final ScheduleSeatPriceMapper priceMapper;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    @Transactional
    public OrderVO createOrder(Long userId, Long scheduleId, List<Long> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) throw new BusinessException("请选择座位");

        ShowSchedule schedule = scheduleMapper.selectById(scheduleId);
        if (schedule == null) throw new BusinessException("场次不存在");
        if (!"ON_SALE".equals(schedule.getStatus())) throw new BusinessException("该场次不可购票");

        // Verify seats are locked by this user
        for (Long seatId : seatIds) {
            String lockKey = RedisKeyConstants.seatLockKey(scheduleId, seatId);
            String lockOwner = stringRedisTemplate.opsForValue().get(lockKey);
            if (lockOwner == null || !lockOwner.equals(String.valueOf(userId))) {
                throw new BusinessException("座位锁定已过期，请重新选座");
            }
        }

        // Check seats not already sold
        Long soldCount = orderItemMapper.selectCount(
                new LambdaQueryWrapper<OrderItem>()
                        .eq(OrderItem::getScheduleId, scheduleId)
                        .in(OrderItem::getSeatId, seatIds)
                        .in(OrderItem::getTicketStatus, "VALID", "VERIFIED"));
        if (soldCount > 0) throw new BusinessException("部分座位已售出");

        // Get price map
        List<ScheduleSeatPrice> prices = priceMapper.selectList(
                new LambdaQueryWrapper<ScheduleSeatPrice>()
                        .eq(ScheduleSeatPrice::getScheduleId, scheduleId));
        Map<String, BigDecimal> priceMap = prices.stream()
                .collect(Collectors.toMap(ScheduleSeatPrice::getSeatType, ScheduleSeatPrice::getPrice));

        // Get seats
        List<Seat> seats = seatMapper.selectBatchIds(seatIds);

        // Calculate total
        BigDecimal total = BigDecimal.ZERO;
        for (Seat seat : seats) {
            BigDecimal price = priceMap.getOrDefault(seat.getSeatType(), BigDecimal.ZERO);
            total = total.add(price);
        }

        // Create order
        Order order = new Order();
        String orderNo = generateOrderNo();
        order.setOrderNo(orderNo);
        order.setUserId(userId);
        order.setScheduleId(scheduleId);
        order.setTotalAmount(total);
        order.setStatus("PENDING_PAYMENT");
        order.setExpireTime(LocalDateTime.now().plusMinutes(15));
        order.setDeleted(0);
        orderMapper.insert(order);

        // Create order items (tickets)
        for (Seat seat : seats) {
            OrderItem item = new OrderItem();
            item.setOrderId(order.getId());
            item.setSeatId(seat.getId());
            item.setScheduleId(scheduleId);
            item.setTicketNo(generateTicketNo());
            item.setSeatLabel(seat.getSeatLabel());
            item.setSeatType(seat.getSeatType());
            item.setPrice(priceMap.getOrDefault(seat.getSeatType(), BigDecimal.ZERO));
            item.setTicketStatus("VALID");
            item.setDeleted(0);
            orderItemMapper.insert(item);
        }

        return getOrderDetail(userId, order.getId());
    }

    @Override
    @Transactional
    public OrderVO createOrderByPrice(Long userId, Long scheduleId, String seatType, int quantity) {
        if (quantity < 1 || quantity > 6) throw new BusinessException("每笔订单限购1-6张");

        ShowSchedule schedule = scheduleMapper.selectById(scheduleId);
        if (schedule == null) throw new BusinessException("场次不存在");
        if (!"ON_SALE".equals(schedule.getStatus())) throw new BusinessException("该场次不可购票");

        ScheduleSeatPrice seatPrice = priceMapper.selectOne(
                new LambdaQueryWrapper<ScheduleSeatPrice>()
                        .eq(ScheduleSeatPrice::getScheduleId, scheduleId)
                        .eq(ScheduleSeatPrice::getSeatType, seatType));
        if (seatPrice == null) throw new BusinessException("票档不存在");

        BigDecimal total = seatPrice.getPrice().multiply(BigDecimal.valueOf(quantity));

        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setScheduleId(scheduleId);
        order.setTotalAmount(total);
        order.setStatus("PENDING_PAYMENT");
        order.setExpireTime(LocalDateTime.now().plusMinutes(15));
        order.setDeleted(0);
        orderMapper.insert(order);

        for (int i = 0; i < quantity; i++) {
            OrderItem item = new OrderItem();
            item.setOrderId(order.getId());
            item.setScheduleId(scheduleId);
            item.setTicketNo(generateTicketNo());
            item.setSeatLabel(seatType);
            item.setSeatType(seatType);
            item.setPrice(seatPrice.getPrice());
            item.setTicketStatus("VALID");
            item.setDeleted(0);
            orderItemMapper.insert(item);
        }

        return getOrderDetail(userId, order.getId());
    }

    @Override
    @Transactional
    public OrderVO payOrder(Long userId, Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) throw new BusinessException("订单不存在");
        if (!"PENDING_PAYMENT".equals(order.getStatus())) throw new BusinessException("订单状态不允许支付");
        if (order.getExpireTime().isBefore(LocalDateTime.now())) throw new BusinessException("订单已过期");

        // Simulate payment success
        order.setStatus("PAID");
        order.setPaymentTime(LocalDateTime.now());
        orderMapper.updateById(order);

        // Update schedule sold tickets
        List<OrderItem> items = orderItemMapper.selectList(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, orderId));

        ShowSchedule schedule = scheduleMapper.selectById(order.getScheduleId());
        schedule.setSoldTickets(schedule.getSoldTickets() + items.size());
        if (schedule.getSoldTickets() >= schedule.getTotalTickets()) {
            schedule.setStatus("SOLD_OUT");
        }
        scheduleMapper.updateById(schedule);

        // Release Redis locks (seats are now sold, no need for lock)
        for (OrderItem item : items) {
            if (item.getSeatId() != null) {
                try {
                    String lockKey = RedisKeyConstants.seatLockKey(order.getScheduleId(), item.getSeatId());
                    stringRedisTemplate.delete(lockKey);
                } catch (Exception ignored) {}
            }
        }

        return getOrderDetail(userId, orderId);
    }

    @Override
    @Transactional
    public OrderVO cancelOrder(Long userId, Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) throw new BusinessException("订单不存在");
        if (!"PENDING_PAYMENT".equals(order.getStatus()) && !"PAID".equals(order.getStatus())) {
            throw new BusinessException("订单状态不允许取消");
        }

        boolean wasPaid = "PAID".equals(order.getStatus());
        order.setStatus(wasPaid ? "REFUNDED" : "CANCELLED");
        order.setCancelTime(LocalDateTime.now());
        orderMapper.updateById(order);

        List<OrderItem> items = orderItemMapper.selectList(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, orderId));

        // Release seats
        for (OrderItem item : items) {
            item.setTicketStatus(wasPaid ? "REFUNDED" : "EXPIRED");
            orderItemMapper.updateById(item);
            // Release Redis lock
            if (item.getSeatId() != null) {
                try {
                    String lockKey = RedisKeyConstants.seatLockKey(order.getScheduleId(), item.getSeatId());
                    stringRedisTemplate.delete(lockKey);
                } catch (Exception ignored) {}
            }
        }

        // If was paid, reduce sold count
        if (wasPaid) {
            ShowSchedule schedule = scheduleMapper.selectById(order.getScheduleId());
            schedule.setSoldTickets(Math.max(0, schedule.getSoldTickets() - items.size()));
            if ("SOLD_OUT".equals(schedule.getStatus())) {
                schedule.setStatus("ON_SALE");
            }
            scheduleMapper.updateById(schedule);
        }

        return getOrderDetail(userId, orderId);
    }

    @Override
    public Page<OrderVO> getUserOrders(Long userId, Integer page, Integer size) {
        Page<Order> orderPage = orderMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<Order>()
                        .eq(Order::getUserId, userId)
                        .orderByDesc(Order::getCreateTime));

        Page<OrderVO> result = new Page<>(orderPage.getCurrent(), orderPage.getSize(), orderPage.getTotal());
        result.setRecords(orderPage.getRecords().stream()
                .map(o -> buildOrderVO(o)).collect(Collectors.toList()));
        return result;
    }

    @Override
    public OrderVO getOrderDetail(Long userId, Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) throw new BusinessException("订单不存在");
        return buildOrderVO(order);
    }

    @Override
    public List<TicketVO> getUserTickets(Long userId) {
        // Get all orders for user
        List<Order> orders = orderMapper.selectList(
                new LambdaQueryWrapper<Order>()
                        .eq(Order::getUserId, userId)
                        .eq(Order::getStatus, "PAID")
                        .orderByDesc(Order::getCreateTime));

        List<TicketVO> tickets = new ArrayList<>();
        for (Order order : orders) {
            List<OrderItem> items = orderItemMapper.selectList(
                    new LambdaQueryWrapper<OrderItem>()
                            .eq(OrderItem::getOrderId, order.getId())
                            .in(OrderItem::getTicketStatus, "VALID", "VERIFIED"));
            for (OrderItem item : items) {
                tickets.add(buildTicketVO(item, order));
            }
        }
        return tickets;
    }

    @Override
    public TicketVO getTicketDetail(Long userId, String ticketNo) {
        OrderItem item = orderItemMapper.selectOne(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getTicketNo, ticketNo));
        if (item == null) throw new BusinessException("票据不存在");

        Order order = orderMapper.selectById(item.getOrderId());
        if (order == null || !order.getUserId().equals(userId)) throw new BusinessException("票据不存在");

        TicketVO vo = buildTicketVO(item, order);
        vo.setQrCodeBase64(QrCodeUtil.generateQrCodeBase64(ticketNo));
        return vo;
    }

    @Override
    public byte[] getTicketQrCode(Long userId, String ticketNo) {
        OrderItem item = orderItemMapper.selectOne(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getTicketNo, ticketNo));
        if (item == null) throw new BusinessException("票据不存在");

        Order order = orderMapper.selectById(item.getOrderId());
        if (order == null || !order.getUserId().equals(userId)) throw new BusinessException("票据不存在");

        return QrCodeUtil.generateQrCodeBytes(ticketNo, 300, 300);
    }

    @Override
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelExpiredOrders() {
        List<Order> expiredOrders = orderMapper.selectList(
                new LambdaQueryWrapper<Order>()
                        .eq(Order::getStatus, "PENDING_PAYMENT")
                        .lt(Order::getExpireTime, LocalDateTime.now()));

        for (Order order : expiredOrders) {
            order.setStatus("EXPIRED");
            order.setCancelTime(LocalDateTime.now());
            orderMapper.updateById(order);

            List<OrderItem> items = orderItemMapper.selectList(
                    new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, order.getId()));
            for (OrderItem item : items) {
                item.setTicketStatus("EXPIRED");
                orderItemMapper.updateById(item);
                if (item.getSeatId() != null) {
                    try {
                        String lockKey = RedisKeyConstants.seatLockKey(order.getScheduleId(), item.getSeatId());
                        stringRedisTemplate.delete(lockKey);
                    } catch (Exception ignored) {}
                }
            }
            log.info("Expired order: {}", order.getOrderNo());
        }
    }

    private OrderVO buildOrderVO(Order order) {
        OrderVO vo = new OrderVO();
        vo.setId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setTotalAmount(order.getTotalAmount());
        vo.setStatus(order.getStatus());
        vo.setPaymentTime(order.getPaymentTime());
        vo.setExpireTime(order.getExpireTime());
        vo.setCreateTime(order.getCreateTime());

        // Show & venue info
        ShowSchedule schedule = scheduleMapper.selectById(order.getScheduleId());
        if (schedule != null) {
            vo.setScheduleDate(schedule.getShowDate().toString());
            vo.setScheduleTime(schedule.getShowTime().toString());
            Show show = showMapper.selectById(schedule.getShowId());
            if (show != null) {
                vo.setShowTitle(show.getTitle());
                vo.setShowImage(show.getPosterUrl());
                Venue venue = venueMapper.selectById(show.getVenueId());
                if (venue != null) vo.setVenue(venue.getName());
            }
        }

        // Tickets
        List<OrderItem> items = orderItemMapper.selectList(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, order.getId()));
        vo.setTickets(items.stream().map(item -> {
            TicketVO tv = new TicketVO();
            tv.setId(item.getId());
            tv.setTicketNo(item.getTicketNo());
            tv.setSeatLabel(item.getSeatLabel());
            tv.setSeatType(item.getSeatType());
            tv.setPrice(item.getPrice());
            tv.setTicketStatus(item.getTicketStatus());
            tv.setVerifyTime(item.getVerifyTime());
            return tv;
        }).collect(Collectors.toList()));

        return vo;
    }

    private TicketVO buildTicketVO(OrderItem item, Order order) {
        TicketVO vo = new TicketVO();
        vo.setId(item.getId());
        vo.setTicketNo(item.getTicketNo());
        vo.setSeatLabel(item.getSeatLabel());
        vo.setSeatType(item.getSeatType());
        vo.setPrice(item.getPrice());
        vo.setTicketStatus(item.getTicketStatus());
        vo.setVerifyTime(item.getVerifyTime());

        ShowSchedule schedule = scheduleMapper.selectById(order.getScheduleId());
        if (schedule != null) {
            vo.setScheduleDate(schedule.getShowDate().toString());
            vo.setScheduleTime(schedule.getShowTime().toString());
            Show show = showMapper.selectById(schedule.getShowId());
            if (show != null) {
                vo.setShowTitle(show.getTitle());
                Venue venue = venueMapper.selectById(show.getVenueId());
                if (venue != null) vo.setVenue(venue.getName());
            }
        }
        return vo;
    }

    private String generateOrderNo() {
        return "ORD" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now())
                + String.format("%04d", new Random().nextInt(10000));
    }

    private String generateTicketNo() {
        return DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now())
                + String.format("%06d", new Random().nextInt(1000000));
    }
}
