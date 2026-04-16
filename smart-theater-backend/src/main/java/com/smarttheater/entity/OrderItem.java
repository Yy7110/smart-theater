package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_item")
public class OrderItem extends BaseEntity {
    private Long orderId;
    private Long seatId;
    private Long scheduleId;
    private String ticketNo;
    private String seatLabel;
    private String seatType;
    private BigDecimal price;
    private String ticketStatus;
    private LocalDateTime verifyTime;
    private Long verifyUserId;
}
