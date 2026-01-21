"use client";

import React from "react";
import { useEditor } from "@/components/editor";

export interface CtaV1Config {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    // ...
    // ...
    sectionBackgroundImage?: string;
    sectionBackground?: string;
    sectionBackgroundOpacity?: number;
    paddingTop?: number;
    paddingBottom?: number;
}

interface CtaV1Props {
    config: CtaV1Config;
    onConfigChange?: (newConfig: CtaV1Config) => void;
    domain?: string;
}

export function CtaV1({ config, onConfigChange, domain }: CtaV1Props) {
    
    return (
        <section 
            className="relative overflow-hidden transition-all duration-300 ease-in-out bg-blue-600 dark:bg-blue-700"
            style={{ 
                // Reduce min-height when padding is customized to allow smaller sections
                minHeight: (config?.paddingTop === undefined && config?.paddingBottom === undefined) ? '300px' : '100px',
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
