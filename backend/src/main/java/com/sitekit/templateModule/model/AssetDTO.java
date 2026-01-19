package com.sitekit.templateModule.model;

import com.sitekit.userManagementModule.entity.UserEntity;
import com.sitekit.utilityModule.enums.AssetType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssetDTO {

    private Long id;

    private UserEntity user;

    private String name;

    private AssetType assetType;

    private String url;

    private byte[] fileData;

    private Long fileSize;

    private String mimeType;

    private Long siteId;

    private LocalDateTime createdOn;

    private LocalDateTime lastUpdatedOn;

}