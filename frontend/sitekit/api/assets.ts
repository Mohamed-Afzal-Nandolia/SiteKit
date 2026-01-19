// Asset API Service
// Functions for Asset CRUD operations

import { apiRequest, ApiResponse } from "./config";
import { ASSET_ENDPOINTS } from "./urls";
import {
    AssetDTO,
    CreateAssetRequest,
    GetAssetRequest,
    GetAllAssetsRequest,
    GetAssetsBySiteRequest,
    GetAssetsByTypeRequest,
    UpdateAssetRequest,
    DeleteAssetRequest,
    AssetSuccessResponse,
} from "./assetTypes";

/**
 * Create a new asset
 * @param request - Asset creation data
 */
export async function createAsset(
    request: CreateAssetRequest
): Promise<ApiResponse<AssetSuccessResponse>> {
    return apiRequest<AssetSuccessResponse>(ASSET_ENDPOINTS.CREATE_ASSET, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Get a specific asset by ID
 * @param request - Request with asset ID
 */
export async function getAssetById(
    request: GetAssetRequest
): Promise<ApiResponse<AssetDTO>> {
    return apiRequest<AssetDTO>(ASSET_ENDPOINTS.GET_ASSET, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Get all assets for the logged-in user
 * @param request - Request with user ID
 */
export async function getAllAssets(
    request: GetAllAssetsRequest
): Promise<ApiResponse<AssetDTO[]>> {
    return apiRequest<AssetDTO[]>(ASSET_ENDPOINTS.GET_ALL_ASSETS, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Get assets for a specific site
 * @param request - Request with site ID
 */
export async function getAssetsBySite(
    request: GetAssetsBySiteRequest
): Promise<ApiResponse<AssetDTO[]>> {
    return apiRequest<AssetDTO[]>(ASSET_ENDPOINTS.GET_ASSETS_BY_SITE, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Get assets filtered by type (optionally by site)
 * @param request - Request with asset type and optional site ID
 */
export async function getAssetsByType(
    request: GetAssetsByTypeRequest
): Promise<ApiResponse<AssetDTO[]>> {
    return apiRequest<AssetDTO[]>(ASSET_ENDPOINTS.GET_ASSETS_BY_TYPE, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Update an existing asset
 * @param request - Update request with asset ID and fields to update
 */
export async function updateAsset(
    request: UpdateAssetRequest
): Promise<ApiResponse<AssetSuccessResponse>> {
    return apiRequest<AssetSuccessResponse>(ASSET_ENDPOINTS.UPDATE_ASSET, {
        method: "PATCH",
        body: JSON.stringify(request),
    });
}

/**
 * Delete an asset
 * @param request - Request with asset ID
 */
export async function deleteAsset(
    request: DeleteAssetRequest
): Promise<ApiResponse<AssetSuccessResponse>> {
    return apiRequest<AssetSuccessResponse>(ASSET_ENDPOINTS.DELETE_ASSET, {
        method: "DELETE",
        body: JSON.stringify(request),
    });
}

/**
 * Helper function to convert a File to base64
 * Useful for uploading files to the asset API
 */
export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/png;base64,")
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
