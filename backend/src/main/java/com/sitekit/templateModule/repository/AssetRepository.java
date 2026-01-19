package com.sitekit.templateModule.repository;

import com.sitekit.templateModule.entity.AssetEntity;
import com.sitekit.utilityModule.enums.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<AssetEntity, Long> {

    List<AssetEntity> findAllByCreatedById(Long userId);

    List<AssetEntity> findAllBySiteId(Long siteId);

    Optional<AssetEntity> findByIdAndCreatedById(Long id, Long userId);

    List<AssetEntity> findAllBySiteIdAndAssetType(Long siteId, AssetType assetType);

    List<AssetEntity> findAllByCreatedByIdAndAssetType(Long userId, AssetType assetType);

}
