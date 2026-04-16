package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("venue")
public class Venue extends BaseEntity {
    private String name;
    private String city;
    private String address;
    private String description;
    private String image;
    private String phone;
    private Integer totalSeats;
    private String facilities;
    private Integer status;
}
