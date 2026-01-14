package com.sitekit.templateModule.service;

import com.sitekit.templateModule.model.PageSectionDTO;
import com.sitekit.templateModule.model.ReorderDTO;

import java.util.List;
import java.util.Map;


public interface PageSectionService {
    PageSectionDTO addSection(PageSectionDTO dto);

    List<PageSectionDTO> getSections(PageSectionDTO dto);

    Map<String, String> updateSection(PageSectionDTO dto);

    Map<String, String> reorderSections(ReorderDTO dto);

    Map<String, String> deleteSection(PageSectionDTO dto);

}
