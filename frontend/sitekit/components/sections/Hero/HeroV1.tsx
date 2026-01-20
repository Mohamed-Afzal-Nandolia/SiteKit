"use client";

import Link from "next/link";
import React from "react";
import { EditableText, EditableLink, useEditor, EditableShape, ImagePicker } from "@/components/editor";
import type { DecorativeShape } from "@/components/editor/shapeTypes";

export interface HeroV1Config {
    headline?: string;
    headlineStyles?: React.CSSProperties;
    subheadline?: string;
    subheadlineStyles?: React.CSSProperties;
    primaryCta?: { label: string; href: string };
    primaryCtaStyles?: React.CSSProperties;
    secondaryCta?: { label: string; href: string };
    secondaryCtaStyles?: React.CSSProperties;
    alignment?: "center" | "left";
    backgroundImage?: string; // URL
    decorativeShapes?: DecorativeShape[];
    paddingTop?: number;
    paddingBottom?: number;
}

interface HeroV1Props {
    config: HeroV1Config;
    onConfigChange?: (newConfig: HeroV1Config) => void;
    domain?: string;
}

export function HeroV1({ config, onConfigChange, domain }: HeroV1Props) {
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
        headline,
        headlineStyles = {},
        subheadline,
        subheadlineStyles = {},
        primaryCta,
        primaryCtaStyles = {},
        secondaryCta,
        secondaryCtaStyles = {},
        alignment = "center",
        backgroundImage,
        decorativeShapes = []
    } = config || {};

    // Helper to update config
    const updateConfig = (updates: Partial<HeroV1Config>) => {
        if (onConfigChange) {
            onConfigChange({ ...config, ...updates });
        }
    };

    // Update CTA buttons
    const updatePrimaryCta = (newLabel: string, newHref: string) => {
        updateConfig({ primaryCta: { label: newLabel, href: newHref } });
    };

    const updateSecondaryCta = (newLabel: string, newHref: string) => {
        updateConfig({ secondaryCta: { label: newLabel, href: newHref } });
    };

    // Shape management
    const addNewShape = () => {
        const newShape: DecorativeShape = {
            id: `shape-${Date.now()}`,
            type: 'circle',
            x: 50,
            y: 30,
            width: 200,
            height: 200,
            color: '#3b82f6',
            opacity: 1.0,
            blur: 0,
            borderRadius: 9999, // Fully rounded for circle
            zIndex: 0,
        };
        updateConfig({ decorativeShapes: [...decorativeShapes, newShape] });
    };

    const updateShape = (id: string, updates: Partial<DecorativeShape>) => {
        const updated = decorativeShapes.map(shape =>
            shape.id === id ? { ...shape, ...updates } : shape
        );
        updateConfig({ decorativeShapes: updated });
    };

    const deleteShape = (id: string) => {
        const filtered = decorativeShapes.filter(shape => shape.id !== id);
        updateConfig({ decorativeShapes: filtered });
    };

    const alignClass = alignment === "center" ? "text-center items-center" : "text-left items-start";

    return (
        <section 
            className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-all duration-300 ease-in-out"
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
                {/* Decorative Shapes */}
                {decorativeShapes.map((shape) => (
                    <EditableShape
                        key={shape.id}
                        shape={shape}
                        onUpdate={(updates) => updateShape(shape.id, updates)}
                        onDelete={() => deleteShape(shape.id)}
                    />
                ))}

                {/* Default shape if no custom shapes */}
                {decorativeShapes.length === 0 && !backgroundImage && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] rounded-full" />
                )}

                {/* Background image */}
                {backgroundImage && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-10"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                )}

                {/* Edit Mode Controls */}
                {isEditMode && (
                    <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                        {/* Add Shape Button */}
                        <button
                            onClick={addNewShape}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm font-medium h-fit"
                            title="Add decorative shape"
                        >
                            + Add Shape
                        </button>
                    </div>
                )}
            </div>

            <div className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${alignClass}`}>
                {headline && (
                    <EditableText
                        value={headline}
                        onUpdate={(newValue) => updateConfig({ headline: newValue })}
                        styles={headlineStyles}
                        onStyleUpdate={(newStyles) => updateConfig({ headlineStyles: newStyles })}
                        onDelete={() => updateConfig({ headline: undefined })}
                        as="h1"
                        className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance mb-6"
                        placeholder="Enter headline..."
                    />
                )}

                {subheadline && (
                    <EditableText
                        value={subheadline}
                        onUpdate={(newValue) => updateConfig({ subheadline: newValue })}
                        styles={subheadlineStyles}
                        onStyleUpdate={(newStyles) => updateConfig({ subheadlineStyles: newStyles })}
                        onDelete={() => updateConfig({ subheadline: undefined })}
                        as="p"
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 text-balance"
                        placeholder="Enter subheadline..."
                        multiline
                    />
                )}

                <div className="flex flex-wrap gap-4">
                    {primaryCta && (
                        isEditMode ? (
                            <EditableLink
                                label={primaryCta.label}
                                href={primaryCta.href}
                                onUpdate={updatePrimaryCta}
                                styles={primaryCtaStyles}
                                onStyleUpdate={(newStyles) => updateConfig({ primaryCtaStyles: newStyles })}
                                onDelete={() => updateConfig({ primaryCta: undefined })}
                                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
                            />
                        ) : (
                            <Link
                                href={getSiteLink(primaryCta.href)}
                                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
                            >
                                {primaryCta.label}
                            </Link>
                        )
                    )}
                    {secondaryCta && (
                        isEditMode ? (
                            <EditableLink
                                label={secondaryCta.label}
                                href={secondaryCta.href}
                                onUpdate={updateSecondaryCta}
                                styles={secondaryCtaStyles}
                                onStyleUpdate={(newStyles) => updateConfig({ secondaryCtaStyles: newStyles })}
                                onDelete={() => updateConfig({ secondaryCta: undefined })}
                                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                            />
                        ) : (
                            <Link
                                href={getSiteLink(secondaryCta.href)}
                                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                            >
                                {secondaryCta.label}
                            </Link>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}
