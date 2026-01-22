"use client";

import React from "react";
import { useEditor } from "@/components/editor";

export interface FeatureItem {
    title: string;
    description: string;
    icon?: string; 
}

export interface ContentV1Config {
    title?: string;
    titleStyles?: React.CSSProperties;
    description?: string;
    descriptionStyles?: React.CSSProperties;
    features?: FeatureItem[];
    featureTitleStyles?: React.CSSProperties[];
    featureDescriptionStyles?: React.CSSProperties[];
    layout?: "grid" | "alternating";
    sectionBackgroundImage?: string;
    sectionBackground?: string;
    sectionBackgroundOpacity?: number;
    paddingTop?: number;
    paddingBottom?: number;
}

interface ContentV1Props {
    config: ContentV1Config;
    onConfigChange?: (newConfig: ContentV1Config) => void;
    domain?: string;
}

export function ContentV1({ config, onConfigChange, domain }: ContentV1Props) {
    // We retain props for compatibility but don't use the text content
    
    return (
        <section 
            className="relative bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 ease-in-out"
            style={{ 
                // Reduce min-height when padding is customized to allow smaller sections
                minHeight: (config?.paddingTop === undefined && config?.paddingBottom === undefined) ? '400px' : '100px',
                paddingTop: config?.paddingTop !== undefined ? `${config.paddingTop}px` : undefined,
                paddingBottom: config?.paddingBottom !== undefined ? `${config.paddingBottom}px` : undefined,
                // Fallback: apply defaults if specific side is undefined
                ...(config?.paddingTop === undefined && { paddingTop: '5rem' }),
                ...(config?.paddingBottom === undefined && { paddingBottom: '5rem' })
            }}
        >
            {/* Background decoration */}
            <div className="absolute inset-0 z-0">
                {/* Background Image Layer */}
                {config?.sectionBackgroundImage && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-all"
                        style={{ backgroundImage: `url(${config.sectionBackgroundImage})` }}
                    />
                )}

                {/* Custom Background Color Layer */}
                {config?.sectionBackground && config.sectionBackground !== "transparent" && (
                    <div 
                        className="absolute inset-0 transition-colors"
                        style={{ 
                            backgroundColor: config.sectionBackground,
                            opacity: config.sectionBackgroundOpacity ?? (config.sectionBackgroundImage ? 0.8 : 1)
                        }}
                    />
                )}
            </div>
            
            {/* Content removed. Dynamic elements rendered by ElementOverlay. */}
        </section>
    );
}
