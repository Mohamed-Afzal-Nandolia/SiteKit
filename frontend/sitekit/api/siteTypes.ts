// TypeScript interfaces for Template Module DTOs
// These match the backend Java DTOs exactly

// ============ Enums ============

export type SiteStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type PageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type SectionType = "HEADER" | "HERO" | "CONTENT" | "CTA" | "FOOTER";
export type TemplateCategory = "SAAS" | "ECOMMERCE" | "PORTFOLIO" | "BLOG" | "OTHER";

// ============ User Reference ============

export interface UserReference {
    id: number;
    username?: string;
    emailAddress?: string;
    role?: string;
    createdOn?: string;
    lastUpdatedOn?: string;
}

// ============ Site Types ============

export interface SiteDTO {
    id?: number;
    user?: UserReference;
    name?: string;
    domain?: string;
    siteStatus?: SiteStatus;
    createdOn?: string;
    lastUpdatedOn?: string;
}

export interface CreateSiteRequest {
    user: UserReference;
    name: string;
    domain?: string;
}

export interface GetAllSitesRequest {
    user: UserReference;
}

export interface GetSiteByIdRequest {
    user: UserReference;
    id: number;
}

export interface DeleteSiteRequest {
    user: UserReference;
    id: number;
}

export interface UpdateSiteStatusRequest {
    user: UserReference;
    id: number;
    siteStatus: SiteStatus;
}

// ============ Site Reference (for Page DTOs) ============

export interface SiteReference {
    id: number;
    user: UserReference;
}

// ============ Page Types ============

export interface PageDTO {
    id?: number;
    site?: SiteReference;
    name?: string;
    slug?: string;
    status?: PageStatus;
    createdOn?: string;
    lastUpdatedOn?: string;
}

export interface CreatePageRequest {
    site: SiteReference;
    name: string;
    slug: string;
}

export interface GetPagesBySiteRequest {
    site: SiteReference;
}

export interface GetPageBySlugRequest {
    site: SiteReference;
    slug: string;
}

export interface DeletePageRequest {
    site: {
        user: UserReference;
    };
    id: number;
}

// ============ Page Section Types ============

export interface PageSectionDTO {
    id?: number;
    userId?: number;
    pageId?: number;
    sectionType?: SectionType;
    variant?: string;
    position?: number;
    config?: Record<string, unknown> | string;
    configJson?: string; // Added for Template response compatibility
    template?: TemplateDTO; // Reference back to template if strictly needed
}

export interface AddSectionRequest {
    userId: number;
    pageId: number;
    sectionType: SectionType;
    variant?: string;
    config?: Record<string, unknown>;
}

export interface GetSectionsRequest {
    userId: number;
    pageId: number;
}

export interface DeleteSectionRequest {
    userId: number;
    id: number;
}

export interface ReorderSectionsRequest {
    userId: number;
    pageId: number;
    orderedSectionIds: number[];
}

// ============ Template Types ============

export interface TemplateDTO {
    id: number;
    name: string;
    category: TemplateCategory | string;
    isPublic: boolean;
    thumbnailUrl?: string;
    createdBy?: UserReference;
    allSections?: PageSectionDTO[];
    createdOn?: string;
    lastUpdatedOn?: string;
}

// ============ API Response Types ============

export interface ApiSuccessMessage {
    success?: string;
    message?: string;
    id?: string;
}
