package com.sitekit.templateModule.controller;

import com.sitekit.templateModule.model.SiteDTO;
import com.sitekit.templateModule.service.SiteService;
import com.sitekit.utilityModule.constants.APIEndpoints;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping(APIEndpoints.BASE_VERSION)
public class SiteController {

    final private SiteService siteService;

    @PostMapping(APIEndpoints.GET_ALL_SITE)
    public ResponseEntity<List<SiteDTO>> getAllSite(@RequestBody SiteDTO siteDTO) {
        return ResponseEntity.ok(siteService.getAllSite(siteDTO));
    }

    @PostMapping(APIEndpoints.GET_SITE_BY_ID)
    public ResponseEntity<SiteDTO> getSiteById(@RequestBody SiteDTO siteDTO) {
        return ResponseEntity.ok(siteService.getSiteById(siteDTO));
    }

    @PostMapping(APIEndpoints.CREATE_SITE)
    public ResponseEntity<Map<String, String>> createSite(@RequestBody SiteDTO siteDTO) {
        return ResponseEntity.ok(siteService.createSite(siteDTO));
    }

    @DeleteMapping(APIEndpoints.DELETE_SITE)
    public ResponseEntity<Map<String, String>> deleteSite(@RequestBody SiteDTO siteDto) {
        return ResponseEntity.ok(siteService.deleteSite(siteDto));
    }

    @PatchMapping(APIEndpoints.UPDATE_SITE_STATUS)
    public ResponseEntity<Map<String, String>> updateSiteStatus(@RequestBody SiteDTO siteDto) {
        return ResponseEntity.ok(siteService.updateSiteStatus(siteDto));
    }

}
