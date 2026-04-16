package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("show_tag")
public class ShowTag {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long showId;
    private String tagName;
}
