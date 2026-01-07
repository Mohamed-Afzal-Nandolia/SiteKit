package com.sitekit.userManagementModule.model;

import com.sitekit.utilityModule.enums.Role;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {

    private Long id;

    private String username;

    private String emailAddress;

    private String password;

    private Role role;

    private LocalDateTime createdOn;

    private LocalDateTime lastUpdatedOn;
}
