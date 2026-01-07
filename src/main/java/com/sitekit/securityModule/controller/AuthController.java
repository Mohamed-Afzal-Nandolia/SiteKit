package com.sitekit.securityModule.controller;


import com.sitekit.securityModule.model.LoginRequest;
import com.sitekit.securityModule.model.Token;
import com.sitekit.securityModule.service.AuthService;
import com.sitekit.utilityModule.constants.APIEndpoints;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping(APIEndpoints.AUTH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(APIEndpoints.AUTH_LOGIN)
    public ResponseEntity<Token> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(request, response));
    }

    @PostMapping(APIEndpoints.AUTH_LOGOUT)
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

}
