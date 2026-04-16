package com.smarttheater.security;

import com.smarttheater.common.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static com.smarttheater.common.constant.RedisKeyConstants.JWT_BLACKLIST_PREFIX;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                if (jwtUtil.validateToken(token)) {
                    String jti = jwtUtil.getJti(token);
                    // Check blacklist (skip if Redis is unavailable)
                    boolean blacklisted = false;
                    try {
                        Boolean bl = stringRedisTemplate.hasKey(JWT_BLACKLIST_PREFIX + jti);
                        blacklisted = bl != null && bl;
                    } catch (Exception ignored) {}
                    if (!blacklisted) {
                        Long userId = jwtUtil.getUserId(token);
                        String username = jwtUtil.getUsername(token);
                        String role = jwtUtil.getRole(token);

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userId, null,
                                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                                );
                        auth.setDetails(Map.of("username", username, "role", role));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception ignored) {
                // Invalid token - continue without authentication
            }
        }
        filterChain.doFilter(request, response);
    }
}
