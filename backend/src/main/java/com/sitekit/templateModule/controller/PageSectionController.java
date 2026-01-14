package com.sitekit.templateModule.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sitekit.templateModule.model.PageSectionDTO;
import com.sitekit.templateModule.model.ReorderDTO;
import com.sitekit.templateModule.service.PageSectionService;
import com.sitekit.utilityModule.constants.APIEndpoints;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping(APIEndpoints.BASE_VERSION)
public class PageSectionController {

    private final PageSectionService sectionService;
    private final ObjectMapper objectMapper;

    @PostMapping(APIEndpoints.ADD_SECTION)
    public ResponseEntity<PageSectionDTO> addSection(@RequestBody PageSectionDTO dto) {
        try {
            return ResponseEntity.ok(sectionService.addSection(dto));
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping(APIEndpoints.GET_SECTIONS)
    public ResponseEntity<List<PageSectionDTO>> getSections(@RequestBody PageSectionDTO dto) {
        return ResponseEntity.ok(sectionService.getSections(dto));
    }

    @PatchMapping(APIEndpoints.UPDATE_SECTION)
    public ResponseEntity<Map<String, String>> updateSection(@RequestBody PageSectionDTO dto) {
        return ResponseEntity.ok(sectionService.updateSection(dto));
    }

    @DeleteMapping(APIEndpoints.DELETE_SECTION)
    public ResponseEntity<Map<String, String>> deleteSection(@RequestBody PageSectionDTO dto) {
        return ResponseEntity.ok(sectionService.deleteSection(dto));
    }

    @PatchMapping(APIEndpoints.REORDER_SECTIONS)
    public ResponseEntity<Map<String, String>> reorderSections(@RequestBody ReorderDTO dto) {
        return ResponseEntity.ok(sectionService.reorderSections(dto));
    }



}
