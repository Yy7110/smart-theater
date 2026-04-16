package com.smarttheater.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smarttheater.common.exception.BusinessException;
import com.smarttheater.common.result.Result;
import com.smarttheater.entity.*;
import com.smarttheater.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/operator")
@RequiredArgsConstructor
public class OperatorController {

    private final ShowMapper showMapper;
    private final ShowScheduleMapper scheduleMapper;
    private final ScheduleSeatPriceMapper priceMapper;
    private final ShowImageMapper imageMapper;
    private final ShowTagMapper tagMapper;
    private final SeatMapper seatMapper;
    private final SeatMapMapper seatMapMapper;
    private final CategoryMapper categoryMapper;
    private final VenueMapper venueMapper;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final ContactMessageMapper messageMapper;
    private final TicketVerificationMapper verificationMapper;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (Long) auth.getPrincipal();
    }

    private void checkShowOwner(Long showId) {
        Show show = showMapper.selectById(showId);
        if (show == null) throw new BusinessException("演出不存在");
        if (showId <= 6) throw new BusinessException(403, "系统预置演出不可修改");
        if (!show.getOperatorId().equals(getCurrentUserId())) {
            throw new BusinessException(403, "无权操作此演出");
        }
    }

    @GetMapping("/shows")
    public Result<List<Show>> myShows() {
        return Result.success(showMapper.selectList(
                new LambdaQueryWrapper<Show>().eq(Show::getOperatorId, getCurrentUserId())
                        .orderByDesc(Show::getCreateTime)));
    }

    @PostMapping("/shows")
    public Result<Show> createShow(@RequestBody Map<String, Object> body) {
        Show show = new Show();
        show.setTitle((String) body.get("title"));
        show.setCategoryId(Long.valueOf(body.get("categoryId").toString()));
        show.setVenueId(Long.valueOf(body.get("venueId").toString()));
        if (body.get("venueHallId") != null) show.setVenueHallId(Long.valueOf(body.get("venueHallId").toString()));
        show.setArtist((String) body.get("artist"));
        show.setDescription((String) body.get("description"));
        show.setPosterUrl((String) body.get("posterUrl"));
        if (body.get("minPrice") != null && !body.get("minPrice").toString().isEmpty())
            show.setMinPrice(new BigDecimal(body.get("minPrice").toString()));
        if (body.get("maxPrice") != null && !body.get("maxPrice").toString().isEmpty())
            show.setMaxPrice(new BigDecimal(body.get("maxPrice").toString()));
        show.setStatus("DRAFT");
        show.setOperatorId(getCurrentUserId());
        show.setDeleted(0);
        showMapper.insert(show);

        if (body.get("tags") instanceof List<?> tagList) {
            for (Object t : tagList) {
                ShowTag tag = new ShowTag();
                tag.setShowId(show.getId());
                tag.setTagName(t.toString());
                tagMapper.insert(tag);
            }
        }

        // Auto-create default schedule with prices
        autoCreateSchedule(show);

        return Result.success(show);
    }

    @PutMapping("/shows/{id}")
    public Result<Void> updateShow(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        checkShowOwner(id);
        Show show = showMapper.selectById(id);
        if (body.containsKey("title")) show.setTitle((String) body.get("title"));
        if (body.containsKey("categoryId")) show.setCategoryId(Long.valueOf(body.get("categoryId").toString()));
        if (body.containsKey("venueId")) show.setVenueId(Long.valueOf(body.get("venueId").toString()));
        if (body.containsKey("artist")) show.setArtist((String) body.get("artist"));
        if (body.containsKey("description")) show.setDescription((String) body.get("description"));
        if (body.containsKey("posterUrl")) show.setPosterUrl((String) body.get("posterUrl"));
        if (body.containsKey("minPrice") && body.get("minPrice") != null && !body.get("minPrice").toString().isEmpty())
            show.setMinPrice(new BigDecimal(body.get("minPrice").toString()));
        if (body.containsKey("maxPrice") && body.get("maxPrice") != null && !body.get("maxPrice").toString().isEmpty())
            show.setMaxPrice(new BigDecimal(body.get("maxPrice").toString()));
        if (body.containsKey("status")) show.setStatus((String) body.get("status"));
        showMapper.updateById(show);
        return Result.success();
    }

    private void autoCreateSchedule(Show show) {
        List<SeatMap> seatMaps = seatMapMapper.selectList(new LambdaQueryWrapper<SeatMap>().last("LIMIT 1"));
        if (seatMaps.isEmpty()) return;
        SeatMap sm = seatMaps.get(0);
        Long seatCount = seatMapper.selectCount(new LambdaQueryWrapper<Seat>()
                .eq(Seat::getSeatMapId, sm.getId()).eq(Seat::getStatus, 1));

        for (int offset : new int[]{7, 14}) {
            ShowSchedule s = new ShowSchedule();
            s.setShowId(show.getId());
            s.setSeatMapId(sm.getId());
            s.setShowDate(LocalDate.now().plusDays(offset));
            s.setShowTime(LocalTime.of(19, 30));
            s.setEndTime(LocalTime.of(21, 30));
            s.setStatus("ON_SALE");
            s.setTotalTickets(seatCount.intValue());
            s.setSoldTickets(0);
            s.setDeleted(0);
            scheduleMapper.insert(s);

            BigDecimal min = show.getMinPrice() != null ? show.getMinPrice() : new BigDecimal("100");
            BigDecimal max = show.getMaxPrice() != null ? show.getMaxPrice() : new BigDecimal("500");
            BigDecimal mid = min.add(max).divide(new BigDecimal("2"), 0, java.math.RoundingMode.HALF_UP);
            for (var entry : new Object[][]{{"VIP", max}, {"STANDARD", mid}, {"ECONOMY", min}}) {
                ScheduleSeatPrice p = new ScheduleSeatPrice();
                p.setScheduleId(s.getId());
                p.setSeatType((String) entry[0]);
                p.setPrice((BigDecimal) entry[1]);
                p.setDeleted(0);
                priceMapper.insert(p);
            }
        }
    }

    @PostMapping("/shows/{id}/schedules")
    public Result<ShowSchedule> createSchedule(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        checkShowOwner(id);
        ShowSchedule s = new ShowSchedule();
        s.setShowId(id);
        if (body.get("seatMapId") != null) s.setSeatMapId(Long.valueOf(body.get("seatMapId").toString()));
        s.setShowDate(LocalDate.parse(body.get("showDate").toString()));
        s.setShowTime(LocalTime.parse(body.get("showTime").toString()));
        if (body.get("endTime") != null) s.setEndTime(LocalTime.parse(body.get("endTime").toString()));
        s.setStatus("ON_SALE");
        if (s.getSeatMapId() != null) {
            Long count = seatMapper.selectCount(new LambdaQueryWrapper<Seat>()
                    .eq(Seat::getSeatMapId, s.getSeatMapId()).eq(Seat::getStatus, 1));
            s.setTotalTickets(count.intValue());
        } else {
            s.setTotalTickets(Integer.parseInt(body.getOrDefault("totalTickets", "0").toString()));
        }
        s.setSoldTickets(0);
        s.setDeleted(0);
        scheduleMapper.insert(s);
        return Result.success(s);
    }

    @PostMapping("/shows/{id}/images")
    public Result<Void> addImages(@PathVariable Long id, @RequestBody List<Map<String, Object>> images) {
        checkShowOwner(id);
        for (Map<String, Object> img : images) {
            ShowImage si = new ShowImage();
            si.setShowId(id);
            si.setImageUrl(img.get("imageUrl").toString());
            si.setSortOrder(Integer.parseInt(img.getOrDefault("sortOrder", "0").toString()));
            si.setDeleted(0);
            imageMapper.insert(si);
        }
        return Result.success();
    }

    @DeleteMapping("/shows/{id}")
    public Result<Void> deleteShow(@PathVariable Long id) {
        checkShowOwner(id);
        showMapper.deleteById(id);
        return Result.success();
    }

    @PutMapping("/shows/{id}/status")
    public Result<Void> updateShowStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        checkShowOwner(id);
        Show show = showMapper.selectById(id);
        show.setStatus(body.get("status"));
        showMapper.updateById(show);
        return Result.success();
    }

    @GetMapping("/categories")
    public Result<List<Category>> getCategories() {
        return Result.success(categoryMapper.selectList(null));
    }

    @GetMapping("/venues")
    public Result<List<Venue>> getVenues() {
        return Result.success(venueMapper.selectList(null));
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats() {
        Long userId = getCurrentUserId();
        List<Show> myShows = showMapper.selectList(
                new LambdaQueryWrapper<Show>().eq(Show::getOperatorId, userId));
        List<Long> showIds = myShows.stream().map(Show::getId).toList();
        long totalSales = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        List<ShowSchedule> allSchedules = new java.util.ArrayList<>();
        for (Show s : myShows) {
            List<ShowSchedule> schedules = scheduleMapper.selectList(
                    new LambdaQueryWrapper<ShowSchedule>().eq(ShowSchedule::getShowId, s.getId()));
            allSchedules.addAll(schedules);
            for (ShowSchedule sc : schedules) {
                totalSales += sc.getSoldTickets() != null ? sc.getSoldTickets() : 0;
            }
        }
        // Calculate revenue from paid orders
        if (!showIds.isEmpty()) {
            List<Long> scheduleIds = allSchedules.stream().map(ShowSchedule::getId).toList();
            if (!scheduleIds.isEmpty()) {
                List<Order> paidOrders = orderMapper.selectList(
                        new LambdaQueryWrapper<Order>().in(Order::getScheduleId, scheduleIds).eq(Order::getStatus, "PAID"));
                totalRevenue = paidOrders.stream().map(Order::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            }
        }
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalShows", myShows.size());
        stats.put("totalSchedules", allSchedules.size());
        stats.put("totalSales", totalSales);
        stats.put("totalRevenue", totalRevenue);
        return Result.success(stats);
    }

    // === Schedules for all operator's shows ===
    @GetMapping("/schedules")
    public Result<List<Map<String, Object>>> getMySchedules() {
        Long userId = getCurrentUserId();
        List<Show> myShows = showMapper.selectList(
                new LambdaQueryWrapper<Show>().eq(Show::getOperatorId, userId));
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Show show : myShows) {
            List<ShowSchedule> schedules = scheduleMapper.selectList(
                    new LambdaQueryWrapper<ShowSchedule>().eq(ShowSchedule::getShowId, show.getId())
                            .orderByAsc(ShowSchedule::getShowDate, ShowSchedule::getShowTime));
            for (ShowSchedule s : schedules) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", s.getId());
                item.put("showId", show.getId());
                item.put("showTitle", show.getTitle());
                item.put("showDate", s.getShowDate());
                item.put("showTime", s.getShowTime());
                item.put("endTime", s.getEndTime());
                item.put("status", s.getStatus());
                item.put("totalTickets", s.getTotalTickets());
                item.put("soldTickets", s.getSoldTickets());
                item.put("availableTickets", s.getTotalTickets() - (s.getSoldTickets() != null ? s.getSoldTickets() : 0));
                item.put("seatMapId", s.getSeatMapId());
                // Prices
                List<ScheduleSeatPrice> prices = priceMapper.selectList(
                        new LambdaQueryWrapper<ScheduleSeatPrice>().eq(ScheduleSeatPrice::getScheduleId, s.getId()));
                item.put("prices", prices);
                result.add(item);
            }
        }
        return Result.success(result);
    }

    @PutMapping("/schedules/{id}")
    public Result<Void> updateSchedule(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        ShowSchedule s = scheduleMapper.selectById(id);
        if (s == null) return Result.error("场次不存在");
        Show show = showMapper.selectById(s.getShowId());
        if (show == null || !show.getOperatorId().equals(getCurrentUserId())) return Result.error("无权操作");
        if (body.containsKey("showDate")) s.setShowDate(LocalDate.parse(body.get("showDate").toString()));
        if (body.containsKey("showTime")) s.setShowTime(LocalTime.parse(body.get("showTime").toString()));
        if (body.containsKey("endTime")) s.setEndTime(LocalTime.parse(body.get("endTime").toString()));
        if (body.containsKey("status")) s.setStatus(body.get("status").toString());
        scheduleMapper.updateById(s);
        return Result.success();
    }

    @DeleteMapping("/schedules/{id}")
    public Result<Void> deleteSchedule(@PathVariable Long id) {
        ShowSchedule s = scheduleMapper.selectById(id);
        if (s == null) return Result.error("场次不存在");
        Show show = showMapper.selectById(s.getShowId());
        if (show == null || !show.getOperatorId().equals(getCurrentUserId())) return Result.error("无权操作");
        if (s.getSoldTickets() != null && s.getSoldTickets() > 0) return Result.error("已有售票，不可删除");
        priceMapper.delete(new LambdaQueryWrapper<ScheduleSeatPrice>().eq(ScheduleSeatPrice::getScheduleId, id));
        scheduleMapper.deleteById(id);
        return Result.success();
    }

    @PostMapping("/schedules/{id}/prices")
    public Result<Void> setSchedulePrices(@PathVariable Long id, @RequestBody List<Map<String, Object>> prices) {
        ShowSchedule s = scheduleMapper.selectById(id);
        if (s == null) return Result.error("场次不存在");
        Show show = showMapper.selectById(s.getShowId());
        if (show == null || !show.getOperatorId().equals(getCurrentUserId())) return Result.error("无权操作");
        priceMapper.delete(new LambdaQueryWrapper<ScheduleSeatPrice>().eq(ScheduleSeatPrice::getScheduleId, id));
        for (Map<String, Object> p : prices) {
            ScheduleSeatPrice price = new ScheduleSeatPrice();
            price.setScheduleId(id);
            price.setSeatType(p.get("seatType").toString());
            price.setPrice(new BigDecimal(p.get("price").toString()));
            price.setDeleted(0);
            priceMapper.insert(price);
        }
        return Result.success();
    }

    // === Seat Map ===
    @GetMapping("/seat-maps")
    public Result<List<Map<String, Object>>> getSeatMaps() {
        List<SeatMap> maps = seatMapMapper.selectList(null);
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (SeatMap sm : maps) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", sm.getId());
            item.put("name", sm.getName());
            item.put("totalRows", sm.getTotalRows());
            List<Seat> seats = seatMapper.selectList(new LambdaQueryWrapper<Seat>()
                    .eq(Seat::getSeatMapId, sm.getId()).orderByAsc(Seat::getRowNum, Seat::getColNum));
            // Group by row
            Map<Integer, List<Map<String, Object>>> rows = new java.util.LinkedHashMap<>();
            for (Seat seat : seats) {
                rows.computeIfAbsent(seat.getRowNum(), k -> new java.util.ArrayList<>())
                        .add(Map.of("seatId", seat.getId(), "rowNum", seat.getRowNum(), "colNum", seat.getColNum(),
                                "seatLabel", seat.getSeatLabel(), "seatType", seat.getSeatType(), "status", seat.getStatus()));
            }
            List<Map<String, Object>> rowList = new java.util.ArrayList<>();
            rows.forEach((rowNum, seatList) -> rowList.add(Map.of("rowNum", rowNum, "seats", seatList)));
            item.put("rows", rowList);
            item.put("totalSeats", seats.size());
            long vip = seats.stream().filter(s -> "VIP".equals(s.getSeatType())).count();
            long standard = seats.stream().filter(s -> "STANDARD".equals(s.getSeatType())).count();
            long economy = seats.stream().filter(s -> "ECONOMY".equals(s.getSeatType())).count();
            item.put("vipCount", vip);
            item.put("standardCount", standard);
            item.put("economyCount", economy);
            result.add(item);
        }
        return Result.success(result);
    }

    // === Orders for operator's shows ===
    @GetMapping("/orders")
    public Result<List<Map<String, Object>>> getMyOrders() {
        Long userId = getCurrentUserId();
        List<Show> myShows = showMapper.selectList(
                new LambdaQueryWrapper<Show>().eq(Show::getOperatorId, userId));
        List<Long> showIds = myShows.stream().map(Show::getId).toList();
        if (showIds.isEmpty()) return Result.success(List.of());
        List<ShowSchedule> schedules = scheduleMapper.selectList(
                new LambdaQueryWrapper<ShowSchedule>().in(ShowSchedule::getShowId, showIds));
        List<Long> scheduleIds = schedules.stream().map(ShowSchedule::getId).toList();
        if (scheduleIds.isEmpty()) return Result.success(List.of());
        List<Order> orders = orderMapper.selectList(
                new LambdaQueryWrapper<Order>().in(Order::getScheduleId, scheduleIds).orderByDesc(Order::getCreateTime));
        Map<Long, ShowSchedule> scheduleMap = schedules.stream().collect(java.util.stream.Collectors.toMap(ShowSchedule::getId, s -> s));
        Map<Long, Show> showMap = myShows.stream().collect(java.util.stream.Collectors.toMap(Show::getId, s -> s));
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Order o : orders) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", o.getId());
            item.put("orderNo", o.getOrderNo());
            item.put("status", o.getStatus());
            item.put("totalAmount", o.getTotalAmount());
            item.put("createTime", o.getCreateTime());
            item.put("paymentTime", o.getPaymentTime());
            ShowSchedule sc = scheduleMap.get(o.getScheduleId());
            if (sc != null) {
                item.put("scheduleDate", sc.getShowDate());
                item.put("scheduleTime", sc.getShowTime());
                Show show = showMap.get(sc.getShowId());
                if (show != null) item.put("showTitle", show.getTitle());
            }
            List<OrderItem> items = orderItemMapper.selectList(
                    new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, o.getId()));
            item.put("ticketCount", items.size());
            item.put("seats", items.stream().map(OrderItem::getSeatLabel).toList());
            result.add(item);
        }
        return Result.success(result);
    }

    // === Messages/Feedback ===
    @GetMapping("/messages")
    public Result<List<ContactMessage>> getMessages() {
        return Result.success(messageMapper.selectList(
                new LambdaQueryWrapper<ContactMessage>().orderByDesc(ContactMessage::getCreateTime)));
    }

    @PutMapping("/messages/{id}/reply")
    public Result<Void> replyMessage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        ContactMessage msg = messageMapper.selectById(id);
        if (msg == null) return Result.error("留言不存在");
        msg.setReply(body.get("reply"));
        msg.setIsRead(1);
        messageMapper.updateById(msg);
        return Result.success();
    }
}
