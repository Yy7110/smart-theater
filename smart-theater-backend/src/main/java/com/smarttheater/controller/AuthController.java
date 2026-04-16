package com.smarttheater.controller;

import com.smarttheater.common.result.Result;
import com.smarttheater.dto.auth.LoginDTO;
import com.smarttheater.dto.auth.RegisterDTO;
import com.smarttheater.service.AuthService;
import com.smarttheater.vo.auth.LoginVO;
import com.smarttheater.vo.auth.UserInfoVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return Result.success(authService.login(dto));
    }

    @PostMapping("/register")
    public Result<LoginVO> register(@Valid @RequestBody RegisterDTO dto) {
        return Result.success(authService.register(dto));
    }

    @PostMapping("/refresh")
    public Result<LoginVO> refresh(@RequestBody String refreshToken) {
        return Result.success(authService.refreshToken(refreshToken));
    }

    @PostMapping("/logout")
    public Result<Void> logout(@RequestHeader("Authorization") String header) {
        String token = header.replace("Bearer ", "");
        authService.logout(token);
        return Result.success();
    }

    @GetMapping("/me")
    public Result<UserInfoVO> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getPrincipal();
        return Result.success(authService.getCurrentUser(userId));
    }
}
