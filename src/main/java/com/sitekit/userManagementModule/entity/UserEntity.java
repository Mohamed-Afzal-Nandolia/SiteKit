package com.sitekit.userManagementModule.entity;

import com.sitekit.utilityModule.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "ACCESS_MANAGEMENT_ENGINE_USER")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "USER_NAME")
    private String username;

    @Column(name = "EMAIL_ADDRESS")
    private String emailAddress;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "ROLE")
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "CREATED_ON")
    private LocalDateTime createdOn;

    @Column(name = "LAST_UPDATE_ON")
    private LocalDateTime lastUpdatedOn;
}
