package com.sitekit.templateModule.service.impl;

import com.sitekit.templateModule.entity.SiteEntity;
import com.sitekit.templateModule.model.SiteDTO;
import com.sitekit.templateModule.repository.SiteRepository;
import com.sitekit.templateModule.service.SiteService;
import com.sitekit.userManagementModule.entity.UserEntity;
import com.sitekit.utilityModule.enums.SiteStatus;
import com.sitekit.utilityModule.exceptions.ResourceAlreadyExists;
import com.sitekit.utilityModule.exceptions.ResourceNotFoundException;
import com.sitekit.utilityModule.userUtils.UserUtils;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class SiteServiceImpl implements SiteService {

    final private SiteRepository siteRepository;
    final private UserUtils userUtils;
    final private ModelMapper modelMapper;

    @Override
    public List<SiteDTO> getAllSite(SiteDTO siteDTO) {
        Long userId = siteDTO.getUser().getId();
        userUtils.getUserById(userId);
        return siteRepository.findAllByUserId(userId)
                .stream()
                .map(siteEntity -> modelMapper.map(siteEntity, SiteDTO.class))
                .toList();
    }

    @Override
    public SiteDTO getSiteById(SiteDTO siteDTO) {
        Long userId = siteDTO.getUser().getId();
        Long siteId = siteDTO.getId();
        userUtils.getUserById(userId);

        SiteEntity siteEntity = siteRepository.findByIdAndUserId(siteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found"));

        return modelMapper.map(siteEntity, SiteDTO.class);
    }

    @Override
    public Map<String, String> createSite(SiteDTO siteDTO) {
        UserEntity user = userUtils.getUserById(siteDTO.getUser().getId());
        SiteEntity siteEntity = modelMapper.map(siteDTO, SiteEntity.class);
        siteEntity.setSiteStatus(SiteStatus.DRAFT);
        siteEntity.setUser(user);
        SiteEntity save = siteRepository.save(siteEntity);
        return Map.of("success", "Site '" + save.getName() +"' created successfully");
    }

    @Override
    public Map<String, String> deleteSite(SiteDTO siteDTO) {
        userUtils.getUserById(siteDTO.getUser().getId());
        SiteEntity siteEntity = siteRepository.findById(siteDTO.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found"));

        siteRepository.delete(siteEntity);
        return Map.of("success", "Site '" + siteEntity.getName() + "' deleted successfully");
    }

    @Override
    public Map<String, String> updateSiteStatus(SiteDTO siteDTO) {
        userUtils.getUserById(siteDTO.getUser().getId());
        SiteEntity siteEntity = siteRepository.findById(siteDTO.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found"));

        if(siteDTO.getSiteStatus().equals(siteEntity.getSiteStatus()))
            throw new ResourceAlreadyExists("Status is already '" + siteEntity.getSiteStatus() + "'");

        siteEntity.setSiteStatus(siteDTO.getSiteStatus());
        siteRepository.save(siteEntity);

        return Map.of("success", "Site '" + siteEntity.getName() + "' updated successfully");
    }
}
