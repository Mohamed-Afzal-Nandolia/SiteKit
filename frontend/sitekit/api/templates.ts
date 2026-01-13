import { apiRequest, ApiResponse } from "./config";
import { TEMPLATE_ENDPOINTS } from "./urls";
import type { TemplateDTO } from "./siteTypes";

export async function getAllTemplates(): Promise<ApiResponse<TemplateDTO[]>> {
    return apiRequest<TemplateDTO[]>(TEMPLATE_ENDPOINTS.GET_ALL_TEMPLATES);
}

export async function getAllSiteTemplates(): Promise<ApiResponse<TemplateDTO[]>> {
    return apiRequest<TemplateDTO[]>(TEMPLATE_ENDPOINTS.GET_ALL_SITE_TEMPLATES);
}
