package com.smarttheater.service.impl;

import com.smarttheater.entity.ContactMessage;
import com.smarttheater.mapper.ContactMessageMapper;
import com.smarttheater.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactMessageMapper messageMapper;

    @Override
    public void submitMessage(String name, String email, String subject, String message) {
        ContactMessage msg = new ContactMessage();
        msg.setName(name);
        msg.setEmail(email);
        msg.setSubject(subject);
        msg.setMessage(message);
        msg.setIsRead(0);
        msg.setDeleted(0);
        messageMapper.insert(msg);
    }
}
