package com.smarttheater.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smarttheater.common.result.Result;
import com.smarttheater.service.OrderService;
import com.smarttheater.service.SeatService;
import com.smarttheater.vo.order.OrderVO;
import com.smarttheater.vo.order.TicketVO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final SeatService seatService;
    private final OrderService orderService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (Long) auth.getPrincipal();
    }

    @PostMapping("/seats/lock")
    public Result<Boolean> lockSeats(@RequestBody Map<String, Object> body) {
        Long scheduleId = Long.valueOf(body.get("scheduleId").toString());
        @SuppressWarnings("unchecked")
        List<Long> seatIds = ((List<Number>) body.get("seatIds")).stream()
                .map(Number::longValue).toList();
        boolean locked = seatService.lockSeats(scheduleId, seatIds, getCurrentUserId());
        return Result.success(locked);
    }

    @PostMapping("/seats/unlock")
    public Result<Boolean> unlockSeats(@RequestBody Map<String, Object> body) {
        Long scheduleId = Long.valueOf(body.get("scheduleId").toString());
        @SuppressWarnings("unchecked")
        List<Long> seatIds = ((List<Number>) body.get("seatIds")).stream()
                .map(Number::longValue).toList();
        boolean unlocked = seatService.unlockSeats(scheduleId, seatIds, getCurrentUserId());
        return Result.success(unlocked);
    }

    @PostMapping("/orders")
    public Result<OrderVO> createOrder(@RequestBody Map<String, Object> body) {
        Long scheduleId = Long.valueOf(body.get("scheduleId").toString());

        // Ticket-tier mode: seatType + price + quantity (no seat selection)
        if (body.containsKey("seatType") && body.containsKey("quantity")) {
            String seatType = body.get("seatType").toString();
            int quantity = Integer.parseInt(body.get("quantity").toString());
            return Result.success(orderService.createOrderByPrice(getCurrentUserId(), scheduleId, seatType, quantity));
        }

        // Legacy seat-selection mode
        @SuppressWarnings("unchecked")
        List<Long> seatIds = ((List<Number>) body.get("seatIds")).stream()
                .map(Number::longValue).toList();
        return Result.success(orderService.createOrder(getCurrentUserId(), scheduleId, seatIds));
    }

    @PostMapping("/orders/{id}/pay")
    public Result<OrderVO> payOrder(@PathVariable Long id) {
        return Result.success(orderService.payOrder(getCurrentUserId(), id));
    }

    @PostMapping("/orders/{id}/cancel")
    public Result<OrderVO> cancelOrder(@PathVariable Long id) {
        return Result.success(orderService.cancelOrder(getCurrentUserId(), id));
    }

    @GetMapping("/orders")
    public Result<Page<OrderVO>> getOrders(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return Result.success(orderService.getUserOrders(getCurrentUserId(), page, size));
    }

    @GetMapping("/orders/{id}")
    public Result<OrderVO> getOrderDetail(@PathVariable Long id) {
        return Result.success(orderService.getOrderDetail(getCurrentUserId(), id));
    }

    @GetMapping("/tickets")
    public Result<List<TicketVO>> getTickets() {
        return Result.success(orderService.getUserTickets(getCurrentUserId()));
    }

    @GetMapping("/tickets/{ticketNo}")
    public Result<TicketVO> getTicketDetail(@PathVariable String ticketNo) {
        return Result.success(orderService.getTicketDetail(getCurrentUserId(), ticketNo));
    }

    @GetMapping(value = "/tickets/{ticketNo}/qrcode", produces = MediaType.IMAGE_PNG_VALUE)
    public byte[] getTicketQrCode(@PathVariable String ticketNo) {
        return orderService.getTicketQrCode(getCurrentUserId(), ticketNo);
    }
}
