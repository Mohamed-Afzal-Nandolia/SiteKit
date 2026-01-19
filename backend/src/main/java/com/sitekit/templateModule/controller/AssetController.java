package com.sitekit.templateModule.controller;

import com.sitekit.templateModule.model.AssetDTO;
import com.sitekit.templateModule.service.AssetService;
import com.sitekit.utilityModule.constants.APIEndpoints;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping(APIEndpoints.BASE_VERSION)
public class AssetController {

    private final AssetService assetService;

    @PostMapping(APIEndpoints.CREATE_ASSET)
    public ResponseEntity<Map<String, String>> createAsset(@RequestBody AssetDTO assetDTO) {
        return ResponseEntity.ok(assetService.createAsset(assetDTO));
    }

    @PostMapping(APIEndpoints.GET_ASSET)
    public ResponseEntity<AssetDTO> getAssetById(@RequestBody AssetDTO assetDTO) {
        return ResponseEntity.ok(assetService.getAssetById(assetDTO));
    }

    @PostMapping(APIEndpoints.GET_ALL_ASSETS)
    public ResponseEntity<List<AssetDTO>> getAllAssetsByUser(@RequestBody AssetDTO assetDTO) {
        return ResponseEntity.ok(assetService.getAllAssetsByUser(assetDTO));
    }

    @PostMapping(APIEndpoints.GET_ASSETS_BY_SITE)
    public ResponseEntity<List<AssetDTO>> getAssetsBySite(@RequestBody AssetDTO assetDTO) {
        return ResponseEntity.ok(assetService.getAssetsBySite(assetDTO));
    }

    @PostMapping(APIEndpoints.GET_ASSETS_BY_TYPE)
    public ResponseEntity<List<AssetDTO>> getAssetsByType(@RequestBody AssetDTO assetDTO) {
        // If siteId is provided, filter by site and type; otherwise filter by user and
        // type
        if (assetDTO.getSiteId() != null) {
            return ResponseEntity.ok(assetService.getAssetsBySiteAndType(assetDTO));
        }
        return ResponseEntity.ok(assetService.getAssetsByUserAndType(assetDTO));
    }

    @PatchMapping(APIEndpoints.UPDATE_ASSET)
    public ResponseEntity<Map<String, String>> updateAsset(@RequestBody AssetDTO assetDTO) {
        return ResponseEntity.ok(assetService.updateAsset(assetDTO));
    }

    @DeleteMapping(APIEndpoints.DELETE_ASSET)
    public ResponseEntity<Map<String, String>> deleteAsset(@RequestBody AssetDTO assetDTO) {
        return ResponseEntity.ok(assetService.deleteAsset(assetDTO));
    }

}
