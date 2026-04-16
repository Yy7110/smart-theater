package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ticket_verification")
public class TicketVerification {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderItemId;
    private String ticketNo;
    private Long inspectorId;
    private String verifyResult;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
