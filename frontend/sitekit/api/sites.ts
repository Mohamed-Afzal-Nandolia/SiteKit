// Site API Service
// Functions for Site CRUD operations

import { apiRequest, ApiResponse } from "./config";
import { SITE_ENDPOINTS } from "./urls";
import {
    SiteDTO,
    CreateSiteRequest,
    GetAllSitesRequest,
    GetSiteByIdRequest,
    DeleteSiteRequest,
    UpdateSiteStatusRequest,
    ApiSuccessMessage,
} from "./siteTypes";

/**
 * Create a new site
 * @param request - Site creation data with user ID, name, and optional domain
 */
export async function createSite(
    request: CreateSiteRequest
): Promise<ApiResponse<ApiSuccessMessage>> {
    return apiRequest<ApiSuccessMessage>(SITE_ENDPOINTS.CREATE_SITE, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Get all sites for a user
 * @param request - Request with user ID
 */
export async function getAllSites(
    request: GetAllSitesRequest
): Promise<ApiResponse<SiteDTO[]>> {
    return apiRequest<SiteDTO[]>(SITE_ENDPOINTS.GET_ALL_SITE, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Get a specific site by ID
 * @param request - Request with user ID and site ID
 */
export async function getSiteById(
    request: GetSiteByIdRequest
): Promise<ApiResponse<SiteDTO>> {
    return apiRequest<SiteDTO>(SITE_ENDPOINTS.GET_SITE_BY_ID, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Delete a site
 * @param request - Request with user ID and site ID
 */
export async function deleteSite(
    request: DeleteSiteRequest
): Promise<ApiResponse<ApiSuccessMessage>> {
    return apiRequest<ApiSuccessMessage>(SITE_ENDPOINTS.DELETE_SITE, {
        method: "DELETE",
        body: JSON.stringify(request),
    });
}

/**
 * Update site status (DRAFT, PUBLISHED, ARCHIVED)
 * @param request - Request with user ID, site ID, and new status
 */
export async function updateSiteStatus(
    request: UpdateSiteStatusRequest
): Promise<ApiResponse<ApiSuccessMessage>> {
    return apiRequest<ApiSuccessMessage>(SITE_ENDPOINTS.UPDATE_SITE_STATUS, {
        method: "PATCH",
        body: JSON.stringify(request),
    });
}

/**
 * Rename a site
 * @param request - Request with user ID, site ID, and new name
 */
export async function renameSite(
    request: { user: { id: number }; id: number; name: string }
): Promise<ApiResponse<ApiSuccessMessage>> {
    return apiRequest<ApiSuccessMessage>(SITE_ENDPOINTS.UPDATE_SITE_NAME, {
        method: "PATCH",
        body: JSON.stringify(request),
    });
}
