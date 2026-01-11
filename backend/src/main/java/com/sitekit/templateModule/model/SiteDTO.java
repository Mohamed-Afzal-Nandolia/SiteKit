package com.sitekit.templateModule.model;

import com.sitekit.userManagementModule.entity.UserEntity;
import com.sitekit.utilityModule.enums.SiteStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SiteDTO {

    private Long id;

    private UserEntity user;

    private String name;

    private String domain;

    private SiteStatus siteStatus;

    private LocalDateTime createdOn;

    private LocalDateTime lastUpdatedOn;

}
