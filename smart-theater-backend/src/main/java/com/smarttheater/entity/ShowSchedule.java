package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("show_schedule")
public class ShowSchedule extends BaseEntity {
    private Long showId;
    private Long seatMapId;
    private LocalDate showDate;
    private LocalTime showTime;
    private LocalTime endTime;
    private String status;
    private Integer totalTickets;
    private Integer soldTickets;
}
