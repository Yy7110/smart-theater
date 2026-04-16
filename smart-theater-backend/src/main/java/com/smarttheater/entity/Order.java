package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("`order`")
public class Order extends BaseEntity {
    private String orderNo;
    private Long userId;
    private Long scheduleId;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime paymentTime;
    private LocalDateTime cancelTime;
    private LocalDateTime expireTime;
    private String remark;
}
