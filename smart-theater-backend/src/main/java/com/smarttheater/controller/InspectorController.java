package com.smarttheater.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smarttheater.common.result.Result;
import com.smarttheater.service.VerificationService;
import com.smarttheater.vo.inspector.VerifyResultVO;
import com.smarttheater.vo.order.TicketVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/inspector")
@RequiredArgsConstructor
public class InspectorController {

    private final VerificationService verificationService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (Long) auth.getPrincipal();
    }

    @PostMapping("/verify")
    public Result<VerifyResultVO> verify(@RequestBody Map<String, String> body) {
        String ticketNo = body.get("ticketNo");
        return Result.success(verificationService.verifyTicket(ticketNo, getCurrentUserId()));
    }

    @GetMapping("/verify/history")
    public Result<Page<Map<String, Object>>> history(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return Result.success(verificationService.getVerificationHistory(getCurrentUserId(), page, size));
    }

    @GetMapping("/verify/today")
    public Result<Map<String, Object>> todaySummary() {
        return Result.success(verificationService.getTodaySummary(getCurrentUserId()));
    }

    @GetMapping("/ticket/{ticketNo}")
    public Result<TicketVO> lookupTicket(@PathVariable String ticketNo) {
        return Result.success(verificationService.lookupTicket(ticketNo));
    }
}
