package com.sitekit.templateModule.controller;

import com.sitekit.templateModule.model.PageDTO;
import com.sitekit.templateModule.service.PageService;
import com.sitekit.utilityModule.constants.APIEndpoints;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping(APIEndpoints.BASE_VERSION)
public class PageController {

    final private PageService pageService;

    @PostMapping(APIEndpoints.CREATE_PAGE)
    public ResponseEntity<PageDTO> createPage(@RequestBody PageDTO pageDTO) {
        return ResponseEntity.ok(pageService.createPage(pageDTO));
    }

    @PostMapping(APIEndpoints.GET_PAGE_BY_SITE_ID)
    public ResponseEntity<List<PageDTO>> getPages(@RequestBody PageDTO pageDTO) {
        return ResponseEntity.ok(pageService.getPagesBySite(pageDTO));
    }

    @PostMapping(APIEndpoints.GET_PAGE_BY_SLUG)
    public ResponseEntity<PageDTO> getPageBySlug(@RequestBody PageDTO pageDTO) {
        return ResponseEntity.ok(pageService.getPageBySlug(pageDTO));
    }

    @DeleteMapping(APIEndpoints.DELETE_PAGE)
    public ResponseEntity<Map<String, String>> deletePage(@RequestBody PageDTO pageDTO) {
        return ResponseEntity.ok(pageService.deletePage(pageDTO));
    }


}
