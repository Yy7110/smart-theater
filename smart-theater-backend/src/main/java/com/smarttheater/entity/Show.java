package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("`show`")
public class Show extends BaseEntity {
    private String title;
    private Long categoryId;
    private Long venueId;
    private Long venueHallId;
    private String artist;
    private String description;
    private String posterUrl;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String status;
    private Long operatorId;
}
