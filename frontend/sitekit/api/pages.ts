// Page API Service
// Functions for Page CRUD operations

import { apiRequest, ApiResponse } from "./config";
import { PAGE_ENDPOINTS } from "./urls";
import {
    PageDTO,
    CreatePageRequest,
    GetPagesBySiteRequest,
    GetPageBySlugRequest,
    DeletePageRequest,
    ApiSuccessMessage,
} from "./siteTypes";

/**
 * Create a new page for a site
 * @param request - Page creation data with site reference, name, and slug
 */
export async function createPage(
    request: CreatePageRequest
): Promise<ApiResponse<PageDTO>> {
    return apiRequest<PageDTO>(PAGE_ENDPOINTS.CREATE_PAGE, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Get all pages for a site
 * @param request - Request with site and user reference
 */
export async function getPagesBySite(
    request: GetPagesBySiteRequest
): Promise<ApiResponse<PageDTO[]>> {
    return apiRequest<PageDTO[]>(PAGE_ENDPOINTS.GET_PAGE_BY_SITE_ID, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Get a specific page by slug
 * @param request - Request with site reference and slug
 */
export async function getPageBySlug(
    request: GetPageBySlugRequest
): Promise<ApiResponse<PageDTO>> {
    return apiRequest<PageDTO>(PAGE_ENDPOINTS.GET_PAGE_BY_SLUG, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Delete a page
 * @param request - Request with user reference and page ID
 */
export async function deletePage(
    request: DeletePageRequest
): Promise<ApiResponse<ApiSuccessMessage>> {
    return apiRequest<ApiSuccessMessage>(PAGE_ENDPOINTS.DELETE_PAGE, {
        method: "DELETE",
        body: JSON.stringify(request),
    });
}
