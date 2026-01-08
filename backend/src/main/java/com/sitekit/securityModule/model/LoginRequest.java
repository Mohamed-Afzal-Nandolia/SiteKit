package com.sitekit.securityModule.model;

import com.sitekit.utilityModule.annotation.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class LoginRequest {

    @NotBlank(message = "Email address is required")
    private String emailAddress;

    @NotBlank(message = "Password is required")
    private String password;
}
