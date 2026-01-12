package com.sitekit.templateModule.model;

import com.sitekit.templateModule.entity.SiteEntity;
import com.sitekit.utilityModule.enums.PageStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PageDTO {

    private Long id;

    private SiteEntity site;

    private String name;

    private String slug;

    private PageStatus status;

    private LocalDateTime createdOn;

    private LocalDateTime lastUpdatedOn;

}
