package com.sitekit.templateModule.model;

import com.sitekit.templateModule.entity.TemplateSectionEntity;
import com.sitekit.userManagementModule.entity.UserEntity;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TemplateDTO {

    private Long id;

    private String name;

    private String category;

    private String thumbnailUrl;

    private Boolean isPublic;

    private UserEntity createdBy;

    private List<TemplateSectionEntity> allSections;

}
