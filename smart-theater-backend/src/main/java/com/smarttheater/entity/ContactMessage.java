package com.smarttheater.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("contact_message")
public class ContactMessage extends BaseEntity {
    private String name;
    private String email;
    private String subject;
    private String message;
    private Integer isRead;
    private String reply;
}
