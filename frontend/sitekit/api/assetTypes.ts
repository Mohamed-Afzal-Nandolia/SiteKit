// Asset Types
// Type definitions for asset entities

/**
 * Asset types supported by the system
 */
export type AssetType = "IMAGE" | "PDF" | "WORD" | "VIDEO" | "LINK";

/**
 * Asset data transfer object matching backend AssetDTO
 */
export interface AssetDTO {
    id?: number;
    name: string;
    assetType: AssetType;
    url?: string;
    fileData?: string; // Base64 encoded for transfer
    fileSize?: number;
    mimeType?: string;
    siteId?: number;
    createdOn?: string;
    lastUpdatedOn?: string;
}

/**
 * User reference for requests
 */
export interface UserRef {
    id: number;
}

/**
 * Request to create a new asset
 */
export interface CreateAssetRequest {
    user: UserRef;
    name: string;
    assetType: AssetType;
    url?: string;
    fileData?: string; // Base64 encoded
    fileSize?: number;
    mimeType?: string;
    siteId?: number;
}

/**
 * Request to get asset by ID
 */
export interface GetAssetRequest {
    user: UserRef;
    id: number;
}

/**
 * Request to get all assets for a user
 */
export interface GetAllAssetsRequest {
    user: UserRef;
}

/**
 * Request to get assets by site
 */
export interface GetAssetsBySiteRequest {
    user: UserRef;
    siteId: number;
}

/**
 * Request to get assets by type, optionally filtered by site
 */
export interface GetAssetsByTypeRequest {
    user: UserRef;
    assetType: AssetType;
    siteId?: number;
}

/**
 * Request to update an asset
 */
export interface UpdateAssetRequest {
    user: UserRef;
    id: number;
    name?: string;
    assetType?: AssetType;
    url?: string;
    fileData?: string;
    fileSize?: number;
    mimeType?: string;
    siteId?: number;
}

/**
 * Request to delete an asset
 */
export interface DeleteAssetRequest {
    user: UserRef;
    id: number;
}

/**
 * API success response
 */
export interface AssetSuccessResponse {
    success: string;
    id?: string;
}

/**
 * Helper to detect asset type from MIME type
 */
export function detectAssetType(mimeType: string): AssetType {
    if (mimeType.startsWith("image/")) return "IMAGE";
    if (mimeType.startsWith("video/")) return "VIDEO";
    if (mimeType === "application/pdf") return "PDF";
    if (
        mimeType === "application/msword" ||
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) return "WORD";
    return "LINK";
}

/**
 * Get display icon for asset type
 */
export function getAssetTypeIcon(assetType: AssetType): string {
    switch (assetType) {
        case "IMAGE": return "🖼️";
        case "VIDEO": return "🎬";
        case "PDF": return "📄";
        case "WORD": return "📝";
        case "LINK": return "🔗";
        default: return "📁";
    }
}
