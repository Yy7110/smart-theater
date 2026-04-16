package com.smarttheater.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smarttheater.vo.order.OrderVO;
import com.smarttheater.vo.order.TicketVO;
import java.util.List;

public interface OrderService {
    OrderVO createOrder(Long userId, Long scheduleId, List<Long> seatIds);
    OrderVO createOrderByPrice(Long userId, Long scheduleId, String seatType, int quantity);
    OrderVO payOrder(Long userId, Long orderId);
    OrderVO cancelOrder(Long userId, Long orderId);
    Page<OrderVO> getUserOrders(Long userId, Integer page, Integer size);
    OrderVO getOrderDetail(Long userId, Long orderId);
    List<TicketVO> getUserTickets(Long userId);
    TicketVO getTicketDetail(Long userId, String ticketNo);
    byte[] getTicketQrCode(Long userId, String ticketNo);
    void cancelExpiredOrders();
}
