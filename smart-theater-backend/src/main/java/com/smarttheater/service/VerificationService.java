package com.smarttheater.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smarttheater.vo.inspector.VerifyResultVO;
import com.smarttheater.vo.order.TicketVO;
import java.util.Map;

public interface VerificationService {
    VerifyResultVO verifyTicket(String ticketNo, Long inspectorId);
    Page<Map<String, Object>> getVerificationHistory(Long inspectorId, Integer page, Integer size);
    Map<String, Object> getTodaySummary(Long inspectorId);
    TicketVO lookupTicket(String ticketNo);
}
