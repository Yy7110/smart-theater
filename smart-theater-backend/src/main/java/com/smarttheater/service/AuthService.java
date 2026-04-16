package com.smarttheater.service;

import com.smarttheater.dto.auth.LoginDTO;
import com.smarttheater.dto.auth.RegisterDTO;
import com.smarttheater.vo.auth.LoginVO;
import com.smarttheater.vo.auth.UserInfoVO;

public interface AuthService {
    LoginVO login(LoginDTO dto);
    LoginVO register(RegisterDTO dto);
    LoginVO refreshToken(String refreshToken);
    void logout(String token);
    UserInfoVO getCurrentUser(Long userId);
}
