package com.sitekit.templateModule.service.impl;

import com.sitekit.templateModule.entity.SiteEntity;
import com.sitekit.templateModule.entity.TemplateEntity;
import com.sitekit.templateModule.entity.TemplateSectionEntity;
import com.sitekit.templateModule.model.SiteDTO;
import com.sitekit.templateModule.model.TemplateDTO;
import com.sitekit.templateModule.repository.TemplateRepository;
import com.sitekit.templateModule.repository.TemplateSectionRepository;
import com.sitekit.templateModule.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateServiceImpl implements TemplateService {

    private final TemplateRepository templateRepository;
    private final TemplateSectionRepository templateSectionRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<TemplateDTO> getAllSiteTemplates() {
        List<TemplateDTO> dtos = new ArrayList<>();
        List<TemplateEntity> allTemplates = templateRepository.findAllByCreatedBy_Id(1L);
        for(TemplateEntity entity : allTemplates){
            TemplateDTO dto = modelMapper.map(entity, TemplateDTO.class);
            List<TemplateSectionEntity> allByTemplateId = templateSectionRepository.findAllByTemplateId(entity.getId());
            dto.setAllSections(allByTemplateId);
            dtos.add(dto);
        }
        return dtos;
    }

    @Override
    public List<TemplateDTO> getAllTemplates() {
        return templateRepository.findAllByCreatedBy_Id(1L)
                .stream()
                .map(templateEntity -> modelMapper.map(templateEntity, TemplateDTO.class))
                .toList();
    }

}
