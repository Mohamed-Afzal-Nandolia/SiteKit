package com.sitekit.securityModule.controller;


import com.sitekit.securityModule.model.LoginRequest;
import com.sitekit.securityModule.model.TokenResponse;
import com.sitekit.securityModule.config.JwtUtil;
import com.sitekit.userManagementModule.entity.UserEntity;
import com.sitekit.userManagementModule.repository.UserRepository;
import com.sitekit.utilityModule.constants.APIEndpoints;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(APIEndpoints.AUTH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @PostMapping(APIEndpoints.AUTH_LOGIN)
    public TokenResponse login(@RequestBody LoginRequest request, HttpServletResponse response ) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        UserEntity user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();

        String accessToken = jwtUtil.generateAccessToken(
                user.getUsername(),
                user.getRole().toString()
        );

        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true); // true in prod (HTTPS)
        refreshCookie.setPath("/auth/refresh");
        refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days

        response.addCookie(refreshCookie);

        return new TokenResponse(accessToken);
    }

    @PostMapping(APIEndpoints.AUTH_LOGOUT)
    public void logout(HttpServletResponse response) {

        Cookie cookie = new Cookie("refresh_token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/auth/refresh");
        cookie.setMaxAge(0);

        response.addCookie(cookie);
    }

}
