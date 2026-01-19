package com.sitekit.templateModule.service;

import com.sitekit.templateModule.model.AssetDTO;

import java.util.List;
import java.util.Map;

public interface AssetService {

    Map<String, String> createAsset(AssetDTO assetDTO);

    AssetDTO getAssetById(AssetDTO assetDTO);

    List<AssetDTO> getAllAssetsByUser(AssetDTO assetDTO);

    List<AssetDTO> getAssetsBySite(AssetDTO assetDTO);

    List<AssetDTO> getAssetsBySiteAndType(AssetDTO assetDTO);

    List<AssetDTO> getAssetsByUserAndType(AssetDTO assetDTO);

    Map<String, String> updateAsset(AssetDTO assetDTO);

    Map<String, String> deleteAsset(AssetDTO assetDTO);

}
