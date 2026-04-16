package com.smarttheater.service;

import com.smarttheater.entity.ContactMessage;

public interface ContactService {
    void submitMessage(String name, String email, String subject, String message);
}
