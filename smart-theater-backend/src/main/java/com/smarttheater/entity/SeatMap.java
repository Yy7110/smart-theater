package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seat_map")
public class SeatMap extends BaseEntity {
    private Long venueHallId;
    private String name;
    private Integer totalRows;
    private String description;
}
