package com.smarttheater.vo.order;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TicketVO {
    private Long id;
    private String ticketNo;
    private String seatLabel;
    private String seatType;
    private BigDecimal price;
    private String ticketStatus;
    private String qrCodeBase64;
    private LocalDateTime verifyTime;
    // Show info (denormalized for convenience)
    private String showTitle;
    private String venue;
    private String scheduleDate;
    private String scheduleTime;
}
