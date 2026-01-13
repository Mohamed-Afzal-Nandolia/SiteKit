package com.sitekit.templateModule.controller;

import com.sitekit.templateModule.model.TemplateDTO;
import com.sitekit.templateModule.service.TemplateService;
import com.sitekit.utilityModule.constants.APIEndpoints;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping(APIEndpoints.BASE_VERSION)
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping(APIEndpoints.GET_ALL_SITE_TEMPLATES)
    public ResponseEntity<List<TemplateDTO>> getAllSiteTemplates() {
        return ResponseEntity.ok(templateService.getAllSiteTemplates());
    }

    @GetMapping(APIEndpoints.GET_ALL_TEMPLATES)
    public ResponseEntity<List<TemplateDTO>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }


}
