package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("schedule_seat_price")
public class ScheduleSeatPrice extends BaseEntity {
    private Long scheduleId;
    private String seatType;
    private BigDecimal price;
}
