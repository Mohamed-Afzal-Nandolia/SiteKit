package com.sitekit.templateModule.service.impl;

import com.sitekit.templateModule.entity.AssetEntity;
import com.sitekit.templateModule.entity.SiteEntity;
import com.sitekit.templateModule.model.AssetDTO;
import com.sitekit.templateModule.repository.AssetRepository;
import com.sitekit.templateModule.repository.SiteRepository;
import com.sitekit.templateModule.service.AssetService;
import com.sitekit.userManagementModule.entity.UserEntity;
import com.sitekit.utilityModule.UtilClass.UserUtils;
import com.sitekit.utilityModule.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final SiteRepository siteRepository;
    private final UserUtils userUtils;

    @Override
    public Map<String, String> createAsset(AssetDTO assetDTO) {
        UserEntity user = userUtils.getLoggedInUser();
        AssetEntity assetEntity = new AssetEntity();
        assetEntity.setName(assetDTO.getName());
        assetEntity.setAssetType(assetDTO.getAssetType());
        assetEntity.setUrl(assetDTO.getUrl());
        assetEntity.setFileSize(assetDTO.getFileSize());
        assetEntity.setMimeType(assetDTO.getMimeType());
        assetEntity.setCreatedBy(user);

        // Associate with site if siteId is provided
        if (assetDTO.getSiteId() != null) {
            SiteEntity site = siteRepository.findById(assetDTO.getSiteId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Site not found with id: " + assetDTO.getSiteId()));
            assetEntity.setSite(site);
        }

        AssetEntity savedAsset = assetRepository.save(assetEntity);
        return Map.of(
                "success", "Asset '" + savedAsset.getName() + "' created successfully",
                "id", String.valueOf(savedAsset.getId()));
    }

    @Override
    public AssetDTO getAssetById(AssetDTO assetDTO) {
        Long userId = userUtils.getLoggedInUserId();

        AssetEntity assetEntity = assetRepository.findByIdAndCreatedById(assetDTO.getId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + assetDTO.getId()));

        return mapToDTO(assetEntity);
    }

    @Override
    public List<AssetDTO> getAllAssetsByUser(AssetDTO assetDTO) {
        Long userId = userUtils.getLoggedInUserId();

        return assetRepository.findAllByCreatedById(userId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<AssetDTO> getAssetsBySite(AssetDTO assetDTO) {
        Long userId = userUtils.getLoggedInUserId();

        // Verify site exists
        SiteEntity site=siteRepository.findById(assetDTO.getSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with id: " ));

        if (!site.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Not your site");
        }
        return assetRepository.findAllBySiteId(site.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<AssetDTO> getAssetsBySiteAndType(AssetDTO assetDTO) {
        userUtils.getUserById(assetDTO.getUserId());

        // Verify site exists
        siteRepository.findById(assetDTO.getSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with id: " + assetDTO.getSiteId()));

        return assetRepository.findAllBySiteIdAndAssetType(assetDTO.getSiteId(), assetDTO.getAssetType())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<AssetDTO> getAssetsByUserAndType(AssetDTO assetDTO) {
        userUtils.getUserById(assetDTO.getUserId());

        return assetRepository.findAllByCreatedByIdAndAssetType(assetDTO.getUserId(), assetDTO.getAssetType())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public Map<String, String> updateAsset(AssetDTO assetDTO) {
        userUtils.getUserById(assetDTO.getUserId());

        AssetEntity assetEntity = assetRepository.findByIdAndCreatedById(assetDTO.getId(), assetDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + assetDTO.getId()));

        // Update fields if provided
        if (assetDTO.getName() != null) {
            assetEntity.setName(assetDTO.getName());
        }
        if (assetDTO.getUrl() != null) {
            assetEntity.setUrl(assetDTO.getUrl());
        }
        if (assetDTO.getAssetType() != null) {
            assetEntity.setAssetType(assetDTO.getAssetType());
        }
        if (assetDTO.getFileSize() != null) {
            assetEntity.setFileSize(assetDTO.getFileSize());
        }
        if (assetDTO.getMimeType() != null) {
            assetEntity.setMimeType(assetDTO.getMimeType());
        }
        if (assetDTO.getSiteId() != null) {
            SiteEntity site = siteRepository.findById(assetDTO.getSiteId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Site not found with id: " + assetDTO.getSiteId()));
            assetEntity.setSite(site);
        }

        assetRepository.save(assetEntity);
        return Map.of("success", "Asset '" + assetEntity.getName() + "' updated successfully");
    }

    @Override
    public Map<String, String> deleteAsset(AssetDTO assetDTO) {
        userUtils.getUserById(assetDTO.getUserId());

        AssetEntity assetEntity = assetRepository.findByIdAndCreatedById(assetDTO.getId(), assetDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + assetDTO.getId()));

        assetRepository.delete(assetEntity);
        return Map.of("success", "Asset '" + assetEntity.getName() + "' deleted successfully");
    }

    private AssetDTO mapToDTO(AssetEntity assetEntity) {
        AssetDTO dto = new AssetDTO();
        dto.setId(assetEntity.getId());
        dto.setName(assetEntity.getName());
        dto.setAssetType(assetEntity.getAssetType());
        dto.setUrl(assetEntity.getUrl());
        dto.setFileSize(assetEntity.getFileSize());
        dto.setMimeType(assetEntity.getMimeType());
        dto.setUserId(assetEntity.getCreatedBy().getId());
        dto.setCreatedOn(assetEntity.getCreatedOn());
        dto.setLastUpdatedOn(assetEntity.getLastUpdatedOn());
        if (assetEntity.getSite() != null) {
            dto.setSiteId(assetEntity.getSite().getId());
        }
        return dto;
    }

}
