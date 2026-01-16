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
 * Update site name only
 * @param request - Request with user ID, site ID, and new name
 */
export async function updateSiteName(
    request: { user: { id: number }; id: number; name: string }
): Promise<ApiResponse<ApiSuccessMessage>> {
    return apiRequest<ApiSuccessMessage>(SITE_ENDPOINTS.UPDATE_SITE_NAME, {
        method: "PATCH",
        body: JSON.stringify(request),
    });
}

/**
 * Update site domain only
 * @param request - Request with user ID, site ID, and new domain
 */
export async function updateSiteDomain(
    request: { user: { id: number }; id: number; domain: string }
): Promise<ApiResponse<ApiSuccessMessage>> {
    return apiRequest<ApiSuccessMessage>(SITE_ENDPOINTS.UPDATE_SITE_DOMAIN, {
        method: "PATCH",
        body: JSON.stringify(request),
    });
}

/**
 * Update site details (name and/or domain)
 * Intelligently calls the appropriate API(s) based on what changed
 * @param request - Request with user ID, site ID, new name, new domain, and original values
 */
export async function updateSite(
    request: {
        user: { id: number };
        id: number;
        name: string;
        domain: string;
        originalName: string;
        originalDomain: string;
    }
): Promise<ApiResponse<ApiSuccessMessage>> {
    const { user, id, name, domain, originalName, originalDomain } = request;

    const nameChanged = name !== originalName;
    const domainChanged = domain !== originalDomain;

    // If only name changed, call update name API
    if (nameChanged && !domainChanged) {
        return updateSiteName({ user, id, name });
    }

    // If only domain changed, call update domain API
    if (!nameChanged && domainChanged) {
        return updateSiteDomain({ user, id, domain });
    }

    // If both changed, call name first, then domain
    if (nameChanged && domainChanged) {
        const nameResult = await updateSiteName({ user, id, name });
        if (nameResult.error) {
            return nameResult;
        }
        return updateSiteDomain({ user, id, domain });
    }

    // Nothing changed
    return { data: { success: "No changes made" }, status: 200 };
}
