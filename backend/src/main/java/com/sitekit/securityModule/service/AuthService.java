package com.sitekit.securityModule.service;

import com.sitekit.securityModule.model.LoginRequest;
import com.sitekit.securityModule.model.Token;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Map;

public interface AuthService {

    public Token login(LoginRequest request, HttpServletResponse response);

    public void logout(HttpServletResponse response);

    public Map<String, String> refreshToken(String refreshToken, HttpServletResponse response);
}
