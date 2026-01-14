// UpdateSectionRequest type for the PATCH update-section API
import { SectionType, PageSectionDTO } from "./siteTypes";

export interface UpdateSectionRequest {
    id: number;
    userId: number;
    pageId?: number;
    sectionType?: SectionType;
    variant?: string;
    position?: number;
    config?: Record<string, unknown>;
}

// Re-export for convenience
export type { PageSectionDTO };
