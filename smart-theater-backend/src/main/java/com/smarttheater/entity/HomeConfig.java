package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("home_config")
public class HomeConfig extends BaseEntity {
    private String configType;
    private Long showId;
    private Integer sortOrder;
    private Integer status;
}
