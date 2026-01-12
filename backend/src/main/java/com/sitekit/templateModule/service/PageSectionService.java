package com.sitekit.templateModule.service;

import com.sitekit.templateModule.model.PageSectionDTO;
import com.sitekit.templateModule.model.ReorderDTO;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface PageSectionService {
    PageSectionDTO addSection(PageSectionDTO dto);

    List<PageSectionDTO> getSections(PageSectionDTO dto);

//    PageSectionDTO updateSection(Long sectionId, PageSectionDTO dto);

    Map<String, String> reorderSections(ReorderDTO dto);

    Map<String, String> deleteSection(PageSectionDTO dto);

}
