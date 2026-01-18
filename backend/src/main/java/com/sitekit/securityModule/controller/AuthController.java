package com.sitekit.securityModule.controller;


import com.sitekit.securityModule.model.LoginRequest;
import com.sitekit.securityModule.model.Token;
import com.sitekit.securityModule.service.AuthService;
import com.sitekit.userManagementModule.model.UserDTO;
import com.sitekit.userManagementModule.service.UserService;
import com.sitekit.utilityModule.constants.APIEndpoints;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(APIEndpoints.AUTH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping(APIEndpoints.AUTH_LOGIN)
    public ResponseEntity<Token> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(request, response));
    }

    @PostMapping(APIEndpoints.AUTH_LOGOUT)
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    @PostMapping(APIEndpoints.CREATE_USER)
    public ResponseEntity<Token> createUser(@Valid @RequestBody UserDTO userDTO, HttpServletResponse response) {
        return ResponseEntity.ok(userService.createUser(userDTO, response));
    }

    @PostMapping(APIEndpoints.AUTH_REFRESH)
    public ResponseEntity<?> refreshToken(
            @RequestHeader("Authorization") String refreshToken,
            HttpServletResponse response) {
        return ResponseEntity.ok(authService.refreshToken(refreshToken, response));
    }

    @GetMapping(APIEndpoints.PING)
    public ResponseEntity<String> checkServerAlive(){
        return ResponseEntity.ok("Server is Alive");
    }

}
