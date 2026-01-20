"use client";

import Link from "next/link";
import React from "react";
import { EditableText, EditableLink, useEditor } from "@/components/editor";

export interface CtaV1Config {
    title?: string;
    titleStyles?: React.CSSProperties;
    description?: string;
    descriptionStyles?: React.CSSProperties;
    buttonText?: string;
    buttonLink?: string;
    buttonStyles?: React.CSSProperties;
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
    const { isEditMode } = useEditor();

    // Helper to transform internal links for public site view
    const getSiteLink = (href: string) => {
        if (!domain || !href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) {
            return href;
        }
        // Avoid double prefixing if already includes domain
        if (href.startsWith(`/${domain}/`) || href === `/${domain}`) {
            return href;
        }
        const path = href.startsWith("/") ? href : `/${href}`;
        return `/${domain}${path}`;
    };
    
    const {
        title,
        titleStyles = {},
        description,
        descriptionStyles = {},
        buttonText,
        buttonLink,
        buttonStyles = {}
    } = config || {};

    // Helper to update config
    const updateConfig = (updates: Partial<CtaV1Config>) => {
        if (onConfigChange) {
            onConfigChange({ ...config, ...updates });
        }
    };

    // Update button
    const updateButton = (newLabel: string, newHref: string) => {
        updateConfig({ buttonText: newLabel, buttonLink: newHref });
    };

    return (
        <section 
            className="relative overflow-hidden transition-all duration-300 ease-in-out bg-blue-600 dark:bg-blue-700"
            style={{ 
                paddingTop: config?.paddingTop !== undefined ? `${config.paddingTop}px` : undefined,
                paddingBottom: config?.paddingBottom !== undefined ? `${config.paddingBottom}px` : undefined,
                // Fallback: apply defaults if specific side is undefined
                ...(config?.paddingTop === undefined && { paddingTop: '5rem' }),
                ...(config?.paddingBottom === undefined && { paddingBottom: '5rem' })
            }}
        >
            {/* Background decoration */}
            <div className="absolute inset-0 z-0">
                {/* Custom Background Color Layer */}
                {config.sectionBackground && config.sectionBackground !== "transparent" && (
                    <div 
                        className="absolute inset-0 transition-colors"
                        style={{ 
                            backgroundColor: config.sectionBackground,
                            opacity: config.sectionBackgroundOpacity ?? 1
                        }}
                    />
                )}
            </div>
            
            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                {title && (
                    <EditableText
                        value={title}
                        onUpdate={(newValue) => updateConfig({ title: newValue })}
                        styles={titleStyles}
                        onStyleUpdate={(newStyles) => updateConfig({ titleStyles: newStyles })}
                        onDelete={() => updateConfig({ title: undefined })}
                        as="h2"
                        className="text-3xl md:text-4xl font-bold text-white mb-6"
                        placeholder="CTA Title"
                    />
                )}
                {description && (
                    <EditableText
                        value={description}
                        onUpdate={(newValue) => updateConfig({ description: newValue })}
                        styles={descriptionStyles}
                        onStyleUpdate={(newStyles) => updateConfig({ descriptionStyles: newStyles })}
                        onDelete={() => updateConfig({ description: undefined })}
                        as="p"
                        className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
                        placeholder="CTA description..."
                        multiline
                    />
                )}
                {buttonText && (
                    isEditMode ? (
                        <EditableLink
                            label={buttonText}
                            href={buttonLink || ""}
                            onUpdate={updateButton}
                            styles={buttonStyles}
                            onStyleUpdate={(newStyles) => updateConfig({ buttonStyles: newStyles })}
                            onDelete={() => updateConfig({ buttonText: undefined, buttonLink: undefined })}
                            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl"
                        />
                    ) : (
                        <Link
                            href={getSiteLink(buttonLink || "#")}
                            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl"
                        >
                            {buttonText}
                        </Link>
                    )
                )}
            </div>
        </section>
    );
}
