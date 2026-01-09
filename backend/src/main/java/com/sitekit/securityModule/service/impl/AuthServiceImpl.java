package com.sitekit.securityModule.service.impl;

import com.sitekit.securityModule.config.JwtUtil;
import com.sitekit.securityModule.model.LoginRequest;
import com.sitekit.securityModule.model.Token;
import com.sitekit.securityModule.service.AuthService;
import com.sitekit.userManagementModule.entity.UserEntity;
import com.sitekit.userManagementModule.repository.UserRepository;
import com.sitekit.utilityModule.exceptions.InvalidTokenException;
import com.sitekit.utilityModule.userUtils.UserUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Map;


@RequiredArgsConstructor
@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public Token login(LoginRequest request, HttpServletResponse response) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmailAddress(),
                        request.getPassword()
                )
        );

        UserEntity user = userRepository.findByEmailAddress(request.getEmailAddress())
                .orElseThrow();

        String accessToken = jwtUtil.generateAccessToken(
                user.getEmailAddress(),
                user.getRole().toString()
        );

        String refreshToken = jwtUtil.generateRefreshToken(user.getEmailAddress());

        Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true); // true in prod (HTTPS)
        refreshCookie.setPath("/auth/refresh");
        refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days

        response.addCookie(refreshCookie);

        return new Token(accessToken);
    }

    @Override
    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/auth/refresh");
        cookie.setMaxAge(0);

        response.addCookie(cookie);
    }

    @Override
    public Map<String, String> refreshToken(String refreshToken, HttpServletResponse response) {
        if (refreshToken == null || !refreshToken.startsWith("Bearer ")) {
            throw new RuntimeException("No refresh token provided");
        }

        String token = refreshToken.substring(7);

        try {
            Claims claims = jwtUtil.validateToken(token);

            String userEmail = claims.getSubject();

            UserEntity user = userRepository.findByEmailAddress(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String newAccessToken = jwtUtil.generateAccessToken(user.getEmailAddress(), user.getRole().toString());

            String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmailAddress());

            Cookie refreshCookie = new Cookie("refresh_token", newRefreshToken);
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(true);
            refreshCookie.setPath("/auth/refresh");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60);
            response.addCookie(refreshCookie);

            return Map.of("accessToken", newAccessToken);

        } catch (Exception e) {
            throw new InvalidTokenException("Invalid or expired refresh token: " + e.getMessage());
        }
    }

}
