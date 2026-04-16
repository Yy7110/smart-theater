package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("show_image")
public class ShowImage {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long showId;
    private String imageUrl;
    private Integer sortOrder;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableLogic
    private Integer deleted;
}
