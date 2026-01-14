package com.sitekit.templateModule.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sitekit.templateModule.entity.PageEntity;
import com.sitekit.templateModule.entity.PageSectionEntity;
import com.sitekit.templateModule.model.PageSectionDTO;
import com.sitekit.templateModule.model.ReorderDTO;
import com.sitekit.templateModule.repository.PageRepository;
import com.sitekit.templateModule.repository.PageSectionRepository;
import com.sitekit.templateModule.service.PageSectionService;
import com.sitekit.utilityModule.UtilClass.UserUtils;
import com.sitekit.utilityModule.exceptions.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PageSectionServiceImpl implements PageSectionService {

    private final PageSectionRepository sectionRepository;
    private final PageRepository pageRepository;
    private final ModelMapper modelMapper;
    private final UserUtils userUtil;
    private final ObjectMapper objectMapper;

    @Override
    public PageSectionDTO addSection(PageSectionDTO dto) {
        Long pageId = dto.getPageId();
        Long userId = dto.getUserId();

        userUtil.getUserById(userId);

        PageEntity page = pageRepository.findById(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found"));

        PageSectionEntity entity = new PageSectionEntity();
        entity.setPage(page);
        entity.setSectionType(dto.getSectionType());
        entity.setVariant(dto.getVariant());
        entity.setPosition(sectionRepository.countByPageId(pageId) + 1);

        if (dto.getConfig() != null) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                entity.setConfigJson(objectMapper.writeValueAsString(dto.getConfig()));
            } catch (Exception e) {
                throw new RuntimeException("Invalid config format", e);
            }
        }

        return toDto(sectionRepository.save(entity));
    }

    @Override
    public List<PageSectionDTO> getSections(PageSectionDTO dto) {
        Long pageId = dto.getPageId();
        Long userId = dto.getUserId();

        userUtil.getUserById(userId);
        return sectionRepository.findByPageIdOrderByPositionAsc(pageId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public Map<String, String> updateSection(PageSectionDTO dto) {
        Long userId = dto.getUserId();
        userUtil.getUserById(userId);

        PageSectionEntity pageSection = sectionRepository.findById(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));

        pageSection.setSectionType(dto.getSectionType());
        pageSection.setVariant(dto.getVariant());
        pageSection.setPosition(dto.getPosition());
        pageSection.setConfigJson(dto.getConfig().toString());
        sectionRepository.save(pageSection);

        return Map.of("message", "Section updated successfully");
    }

    private PageSectionDTO toDto(PageSectionEntity entity) {
        PageSectionDTO dto = new PageSectionDTO();
        dto.setId(entity.getId());
        dto.setPageId(entity.getPage().getId());
        dto.setSectionType(entity.getSectionType());
        dto.setVariant(entity.getVariant());
        dto.setPosition(entity.getPosition());
        dto.setConfig(entity.getConfigJson());

        return dto;
    }

    @Transactional
    public Map<String, String> reorderSections(ReorderDTO dto) {

        Long userId = dto.getUserId();
        Long pageId = dto.getPageId();
        List<Long> orderedSectionIds = dto.getOrderedSectionIds();
        userUtil.getUserById(userId);

        List<PageSectionEntity> sections =
                sectionRepository.findByPage_Id(pageId);

        if (sections.isEmpty()) {
            throw new RuntimeException("No sections found for page");
        }

        Map<Long, PageSectionEntity> sectionMap =
                sections.stream()
                        .collect(Collectors.toMap(PageSectionEntity::getId, s -> s));

        if (sectionMap.size() != orderedSectionIds.size()) {
            throw new IllegalArgumentException("Section list mismatch");
        }

        int position = 1;
        for (Long sectionId : orderedSectionIds) {
            PageSectionEntity section = sectionMap.get(sectionId);

            if (section == null) {
                throw new RuntimeException("Invalid section ID: " + sectionId);
            }
            section.setPosition(position++);
        }
        sectionRepository.saveAll(sections);

        return Map.of("message", "Section order saved successfully");
    }


    @Override
    public Map<String, String> deleteSection(PageSectionDTO dto) {
        Long sectionId = dto.getId();
        Long userId = dto.getUserId();

        userUtil.getUserById(userId);

        PageSectionEntity section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        sectionRepository.delete(section);
        return Map.of("message", "Section deleted successfully");
    }
}
