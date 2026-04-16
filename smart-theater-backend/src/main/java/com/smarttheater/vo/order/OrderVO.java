package com.smarttheater.vo.order;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderVO {
    private Long id;
    private String orderNo;
    private String showTitle;
    private String showImage;
    private String venue;
    private String scheduleDate;
    private String scheduleTime;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime paymentTime;
    private LocalDateTime expireTime;
    private LocalDateTime createTime;
    private List<TicketVO> tickets;
}
