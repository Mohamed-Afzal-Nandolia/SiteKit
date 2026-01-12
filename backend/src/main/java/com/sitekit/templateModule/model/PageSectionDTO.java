package com.sitekit.templateModule.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sitekit.utilityModule.enums.SectionType;
import lombok.Data;

@Data
public class PageSectionDTO {
    private Long id;
    private Long userId;
    private Long pageId;
    private SectionType sectionType;
    private String variant;
    private Integer position;
    private Object config;  // Changed to Object type

    // Helper method to get config as String
    @JsonIgnore
    public String getConfigAsString() {
        try {
            if (config == null) return null;
            if (config instanceof String) return (String) config;
            return new ObjectMapper().writeValueAsString(config);
        } catch (Exception e) {
            throw new RuntimeException("Error converting config to string", e);
        }
    }

    // Helper method to get config as JsonNode
    @JsonIgnore
    public JsonNode getConfigAsJson() {
        try {
            if (config == null) return null;
            ObjectMapper objectMapper = new ObjectMapper();
            if (config instanceof String) {
                return objectMapper.readTree((String) config);
            }
            return objectMapper.valueToTree(config);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing config JSON", e);
        }
    }
}