// Page Section API Service
// Functions for PageSection CRUD operations

import { apiRequest, ApiResponse } from "./config";
import { SECTION_ENDPOINTS } from "./urls";
import {
    PageSectionDTO,
    AddSectionRequest,
    GetSectionsRequest,
    DeleteSectionRequest,
    ReorderSectionsRequest,
    ApiSuccessMessage,
} from "./siteTypes";

/**
 * Add a new section to a page
 * @param request - Section data with page ID, section type, variant, and config
 */
export async function addSection(
    request: AddSectionRequest
): Promise<ApiResponse<PageSectionDTO>> {
    return apiRequest<PageSectionDTO>(SECTION_ENDPOINTS.ADD_SECTION, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Get all sections for a page (ordered by position)
 * @param request - Request with user ID and page ID
 */
export async function getSections(
    request: GetSectionsRequest
): Promise<ApiResponse<PageSectionDTO[]>> {
    return apiRequest<PageSectionDTO[]>(SECTION_ENDPOINTS.GET_SECTIONS, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Delete a section
 * @param request - Request with user ID and section ID
 */
export async function deleteSection(
    request: DeleteSectionRequest
): Promise<ApiResponse<ApiSuccessMessage>> {
    return apiRequest<ApiSuccessMessage>(SECTION_ENDPOINTS.DELETE_SECTION, {
        method: "DELETE",
        body: JSON.stringify(request),
    });
}

/**
 * Reorder sections on a page
 * @param request - Request with user ID, page ID, and ordered section IDs
 */
export async function reorderSections(
    request: ReorderSectionsRequest
): Promise<ApiResponse<ApiSuccessMessage>> {
    return apiRequest<ApiSuccessMessage>(SECTION_ENDPOINTS.REORDER_SECTIONS, {
        method: "PATCH",
        body: JSON.stringify(request),
    });
}

/**
 * Update a section's config or other properties
 * @param request - PageSectionDTO with id, userId, and updated fields
 */
export async function updateSection(
    request: PageSectionDTO
): Promise<ApiResponse<ApiSuccessMessage>> {
    return apiRequest<ApiSuccessMessage>(SECTION_ENDPOINTS.UPDATE_SECTION, {
        method: "PATCH",
        body: JSON.stringify(request),
    });
}
