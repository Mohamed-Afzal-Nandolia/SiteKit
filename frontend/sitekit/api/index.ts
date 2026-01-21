// API Exports

// Config
export { apiRequest } from "./config";
export type { ApiResponse } from "./config";

// URLs
export { API_BASE_URL, AUTH_ENDPOINTS, ROUTES, SITE_ENDPOINTS, PAGE_ENDPOINTS, SECTION_ENDPOINTS } from "./urls";

// Auth Types
export type {
    LoginRequest,
    LoginResponse,
    CreateUserRequest,
    CreateUserResponse,
    LogoutResponse,
} from "./types";

// Site Types
export type {
    SiteStatus,
    PageStatus,
    SectionType,
    UserReference,
    SiteDTO,
    CreateSiteRequest,
    GetAllSitesRequest,
    GetSiteByIdRequest,
    DeleteSiteRequest,
    UpdateSiteStatusRequest,
    SiteReference,
    PageDTO,
    CreatePageRequest,
    GetPagesBySiteRequest,
    GetPageBySlugRequest,
    DeletePageRequest,
    PageSectionDTO,
    AddSectionRequest,
    GetSectionsRequest,
    DeleteSectionRequest,
    ReorderSectionsRequest,
    ApiSuccessMessage,
    TemplateDTO,
    TemplateCategory,
} from "./siteTypes";

// Token Utilities
export {
    parseJwt,
    isTokenExpired,
    getValidTokenPayload,
    getTokenTimeRemaining,
} from "./tokenUtils";
export type { JwtPayload } from "./tokenUtils";

// Auth Service
export {
    login,
    createUser,
    logout,
    refreshAccessToken,
    isAuthenticated,
    getAccessToken,
    getUserFromToken,
    clearAuth,
    forceLogout,
} from "./auth";

// Site API Service
export {
    createSite,
    getAllSites,
    getSiteById,
    deleteSite,
    updateSiteStatus,
    updateSiteName,
    updateSiteDomain,
    updateSite,
} from "./sites";

// Page API Service
export {
    createPage,
    getPagesBySite,
    getPageBySlug,
    deletePage,
} from "./pages";

// Section API Service
export {
    addSection,
    getSections,
    deleteSection,
    reorderSections,
    updateSection,
} from "./sections";

// Template API Service
export {
    getAllTemplates,
    getAllSiteTemplates,
} from "./templates";

// Asset Types
export type {
    AssetDTO,
    AssetType,
    UserRef,
    CreateAssetRequest,
    GetAssetRequest,
    GetAllAssetsRequest,
    GetAssetsBySiteRequest,
    GetAssetsByTypeRequest,
    UpdateAssetRequest,
    DeleteAssetRequest,
    AssetSuccessResponse,
} from "./assetTypes";

export { detectAssetType, getAssetTypeIcon } from "./assetTypes";

// Asset API Service
export {
    createAsset,
    getAssetById,
    getAllAssets,
    getAssetsBySite,
    getAssetsByType,
    updateAsset,
    deleteAsset,
    fileToBase64,
} from "./assets";
