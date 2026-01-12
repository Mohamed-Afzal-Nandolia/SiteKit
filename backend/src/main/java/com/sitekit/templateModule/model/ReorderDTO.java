package com.sitekit.templateModule.model;

import lombok.Data;

import java.util.List;

@Data
public class ReorderDTO {
    private Long userId;
    private Long pageId;
    private List<Long> orderedSectionIds;
}
