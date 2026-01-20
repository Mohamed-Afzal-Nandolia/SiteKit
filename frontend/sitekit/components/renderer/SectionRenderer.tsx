import React from "react";
import type { PageSectionDTO } from "@/api";
import { useEditor } from "../editor";

// Import Variants
import { HeaderV1 } from "../sections/Header/HeaderV1";
import { HeroV1 } from "../sections/Hero/HeroV1";
import { ContentV1 } from "../sections/Content/ContentV1";
import { CtaV1 } from "../sections/CTA/CtaV1";
import { FooterV1 } from "../sections/Footer/FooterV1";

// Registry Type
type ComponentRegistry = Record<string, Record<string, React.FC<{ config: any; onConfigChange?: (newConfig: any) => void; domain?: string }>>>;

// Registry Mapping
const SECTION_REGISTRY: ComponentRegistry = {
    HEADER: {
        "header_v1": HeaderV1,
        "default": HeaderV1,
    },
    HERO: {
        "hero_v1": HeroV1,
        "default": HeroV1,
    },
    CONTENT: {
        "content_v1": ContentV1,
        "default": ContentV1,
    },
    CTA: {
        "cta_v1": CtaV1,
        "default": CtaV1,
    },
    FOOTER: {
        "footer_v1": FooterV1,
        "default": FooterV1,
    }
};

export function SectionRenderer({ section, disableOverlay = false, isFirst = false, domain }: { section: PageSectionDTO, disableOverlay?: boolean, isFirst?: boolean, domain?: string }) {
    const { sectionType, variant, config, configJson } = section;
    const { isEditMode, updateSectionConfig, getSectionConfig } = useEditor();

    if (!sectionType) return null;

    // Resolve Component
    const variants = SECTION_REGISTRY[sectionType];
    if (!variants) {
        console.warn(`No registry found for section type: ${sectionType}`);
        return null;
    }

    const Component = variants[variant || "default"] || variants["default"];
    
    if (!Component) {
        console.warn(`No component found for variant: ${variant} of type ${sectionType}`);
        return null;
    }

    // Get config (with any pending changes from context)
    const sectionId = section.id;
    let parsedConfig: any = {};
    
    if (sectionId && (isEditMode || getSectionConfig)) {
        // In edit mode OR if we have access to context (Preview Mode), get config from context
        // getSectionConfig returns null if not found, so we fallback
        const pendingConfig = getSectionConfig(sectionId);
        if (pendingConfig) {
            parsedConfig = pendingConfig;
        } else {
             // Fallback to props if context has no data for this section
            if (configJson) {
                try {
                    parsedConfig = JSON.parse(configJson);
                } catch (e) { }
            } else if (typeof config === "string") {
                 try { parsedConfig = JSON.parse(config); } catch (e) { }
            } else {
                parsedConfig = config || {};
            }
        }
    } else {
        // pure read-only mode (published site)
        if (configJson) {
            try {
                parsedConfig = JSON.parse(configJson);
            } catch (e) {
                console.error("Failed to parse section configJson", e);
            }
        } else if (typeof config === "string") {
            try {
                parsedConfig = JSON.parse(config);
            } catch (e) {
                console.error("Failed to parse section config string", e);
                parsedConfig = {};
            }
        } else if (config) {
            parsedConfig = config;
        }
    }

    // Handle config changes from editable components
    const handleConfigChange = (newConfig: any) => {
        if (sectionId) {
            updateSectionConfig(sectionId, newConfig);
        }
    };

    // Extract elements and background from config
    const elements = parsedConfig.elements || [];
    const sectionBackground = parsedConfig.sectionBackground;

    return (
        <div 
            className="relative"
            style={sectionBackground && sectionBackground !== "transparent" ? { backgroundColor: sectionBackground } : {}}
        >
            <Component config={parsedConfig} onConfigChange={handleConfigChange} domain={domain} />
            
            {/* Render Overlay Elements for Public View / Read-Only */}
            {elements.length > 0 && !disableOverlay && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* We need to import ElementOverlay or replicate its read-only logic. 
                        Since it's in a different directory structure, let's use the one from editor. 
                    */}
                    <ElementOverlay 
                        elements={elements} 
                        sectionRef={{ current: null } as any} // Ref not strictly needed for read-only pos
                        isEditMode={false}
                        onUpdateElement={() => {}}
                        onDeleteElement={() => {}}
                        isFirst={isFirst}
                    />
                </div>
            )}
        </div>
    );
}

// Import ElementOverlay locally or ensure it is exported from @/components/editor
import { ElementOverlay } from "../editor/DraggableElement";
