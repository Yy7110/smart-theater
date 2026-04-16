package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seat")
public class Seat extends BaseEntity {
    private Long seatMapId;
    private Integer rowNum;
    private Integer colNum;
    private String seatLabel;
    private String seatType;
    private Integer status;
}
