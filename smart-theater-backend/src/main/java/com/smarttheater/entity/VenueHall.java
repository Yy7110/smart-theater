package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("venue_hall")
public class VenueHall extends BaseEntity {
    private Long venueId;
    private String name;
    private Integer capacity;
    private String description;
    private Integer status;
}
