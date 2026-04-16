package com.smarttheater.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smarttheater.common.exception.BusinessException;
import com.smarttheater.entity.*;
import com.smarttheater.mapper.*;
import com.smarttheater.service.VerificationService;
import com.smarttheater.vo.inspector.VerifyResultVO;
import com.smarttheater.vo.order.TicketVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VerificationServiceImpl implements VerificationService {

    private final OrderItemMapper orderItemMapper;
    private final OrderMapper orderMapper;
    private final ShowScheduleMapper scheduleMapper;
    private final ShowMapper showMapper;
    private final VenueMapper venueMapper;
    private final TicketVerificationMapper verificationMapper;

    @Override
    @Transactional
    public VerifyResultVO verifyTicket(String ticketNo, Long inspectorId) {
        OrderItem item = orderItemMapper.selectOne(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getTicketNo, ticketNo));

        if (item == null) {
            saveVerification(null, ticketNo, inspectorId, "INVALID", "票据不存在");
            return VerifyResultVO.builder()
                    .result("INVALID").message("票据不存在").ticketNo(ticketNo).build();
        }

        Order order = orderMapper.selectById(item.getOrderId());
        ShowSchedule schedule = order != null ? scheduleMapper.selectById(order.getScheduleId()) : null;
        Show show = schedule != null ? showMapper.selectById(schedule.getShowId()) : null;

        String showTitle = show != null ? show.getTitle() : "";
        String scheduleInfo = schedule != null
                ? schedule.getShowDate() + " " + schedule.getShowTime()
                : "";

        // Check if order is paid
        if (order == null || !"PAID".equals(order.getStatus())) {
            saveVerification(item.getId(), ticketNo, inspectorId, "INVALID", "订单未支付");
            return VerifyResultVO.builder()
                    .result("INVALID").message("订单未支付或已取消")
                    .ticketNo(ticketNo).showTitle(showTitle)
                    .seatLabel(item.getSeatLabel()).scheduleInfo(scheduleInfo).build();
        }

        // Check ticket status
        if ("VERIFIED".equals(item.getTicketStatus())) {
            saveVerification(item.getId(), ticketNo, inspectorId, "ALREADY_VERIFIED",
                    "已于 " + item.getVerifyTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) + " 核销");
            return VerifyResultVO.builder()
                    .result("ALREADY_VERIFIED")
                    .message("该票已核销")
                    .ticketNo(ticketNo).showTitle(showTitle)
                    .seatLabel(item.getSeatLabel()).scheduleInfo(scheduleInfo)
                    .verifyTime(item.getVerifyTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                    .build();
        }

        if ("EXPIRED".equals(item.getTicketStatus()) || "REFUNDED".equals(item.getTicketStatus())) {
            saveVerification(item.getId(), ticketNo, inspectorId, "EXPIRED", "票据已过期或已退款");
            return VerifyResultVO.builder()
                    .result("EXPIRED").message("票据已过期或已退款")
                    .ticketNo(ticketNo).showTitle(showTitle)
                    .seatLabel(item.getSeatLabel()).scheduleInfo(scheduleInfo).build();
        }

        // Success - update ticket
        item.setTicketStatus("VERIFIED");
        item.setVerifyTime(LocalDateTime.now());
        item.setVerifyUserId(inspectorId);
        orderItemMapper.updateById(item);

        saveVerification(item.getId(), ticketNo, inspectorId, "SUCCESS", "核销成功");

        return VerifyResultVO.builder()
                .result("SUCCESS").message("核销成功")
                .ticketNo(ticketNo).showTitle(showTitle)
                .seatLabel(item.getSeatLabel()).scheduleInfo(scheduleInfo)
                .verifyTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
    }

    @Override
    public Page<Map<String, Object>> getVerificationHistory(Long inspectorId, Integer page, Integer size) {
        Page<TicketVerification> tvPage = verificationMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<TicketVerification>()
                        .eq(TicketVerification::getInspectorId, inspectorId)
                        .orderByDesc(TicketVerification::getCreateTime));

        Page<Map<String, Object>> result = new Page<>(tvPage.getCurrent(), tvPage.getSize(), tvPage.getTotal());
        result.setRecords(tvPage.getRecords().stream().map(tv -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", tv.getId());
            map.put("ticketNo", tv.getTicketNo());
            map.put("verifyResult", tv.getVerifyResult());
            map.put("remark", tv.getRemark());
            map.put("createTime", tv.getCreateTime());

            if (tv.getOrderItemId() != null) {
                OrderItem item = orderItemMapper.selectById(tv.getOrderItemId());
                if (item != null) {
                    map.put("seatLabel", item.getSeatLabel());
                    Order order = orderMapper.selectById(item.getOrderId());
                    if (order != null) {
                        ShowSchedule schedule = scheduleMapper.selectById(order.getScheduleId());
                        if (schedule != null) {
                            Show show = showMapper.selectById(schedule.getShowId());
                            if (show != null) map.put("showTitle", show.getTitle());
                        }
                    }
                }
            }
            return map;
        }).toList());
        return result;
    }

    @Override
    public Map<String, Object> getTodaySummary(Long inspectorId) {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);

        List<TicketVerification> todayRecords = verificationMapper.selectList(
                new LambdaQueryWrapper<TicketVerification>()
                        .eq(TicketVerification::getInspectorId, inspectorId)
                        .ge(TicketVerification::getCreateTime, todayStart)
                        .lt(TicketVerification::getCreateTime, todayEnd));

        long total = todayRecords.size();
        long success = todayRecords.stream().filter(r -> "SUCCESS".equals(r.getVerifyResult())).count();
        long alreadyVerified = todayRecords.stream().filter(r -> "ALREADY_VERIFIED".equals(r.getVerifyResult())).count();
        long invalid = todayRecords.stream().filter(r -> "INVALID".equals(r.getVerifyResult())).count();
        long expired = todayRecords.stream().filter(r -> "EXPIRED".equals(r.getVerifyResult())).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("total", total);
        summary.put("success", success);
        summary.put("alreadyVerified", alreadyVerified);
        summary.put("invalid", invalid);
        summary.put("expired", expired);
        summary.put("date", LocalDate.now().toString());
        return summary;
    }

    @Override
    public TicketVO lookupTicket(String ticketNo) {
        OrderItem item = orderItemMapper.selectOne(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getTicketNo, ticketNo));
        if (item == null) throw new BusinessException("票据不存在");

        Order order = orderMapper.selectById(item.getOrderId());

        TicketVO vo = new TicketVO();
        vo.setId(item.getId());
        vo.setTicketNo(item.getTicketNo());
        vo.setSeatLabel(item.getSeatLabel());
        vo.setSeatType(item.getSeatType());
        vo.setPrice(item.getPrice());
        vo.setTicketStatus(item.getTicketStatus());
        vo.setVerifyTime(item.getVerifyTime());

        if (order != null) {
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
        }
        return vo;
    }

    private void saveVerification(Long orderItemId, String ticketNo, Long inspectorId,
                                  String result, String remark) {
        TicketVerification tv = new TicketVerification();
        tv.setOrderItemId(orderItemId);
        tv.setTicketNo(ticketNo);
        tv.setInspectorId(inspectorId);
        tv.setVerifyResult(result);
        tv.setRemark(remark);
        verificationMapper.insert(tv);
    }
}
