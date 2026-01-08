package com.sitekit.userManagementModule.model;

import com.sitekit.utilityModule.annotation.ValidPassword;
import com.sitekit.utilityModule.annotation.ValidEmail;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserDTO {

    private Long id;

    @NotNull
    private String username;

    @NotNull
    @ValidEmail
    private String emailAddress;

    @NotNull
    @ValidPassword
    private String password;

}
