"use client";

import Link from "next/link";
import React from "react";
import { EditableText, EditableLink, useEditor } from "@/components/editor";

export interface FooterLink {
    label: string;
    href: string;
}

export interface FooterColumn {
    title: string;
    links: FooterLink[];
}

export interface FooterV1Config {
    brandName?: string;
    brandNameStyles?: React.CSSProperties;
    description?: string;
    descriptionStyles?: React.CSSProperties;
    columns?: FooterColumn[];
    columnTitleStyles?: React.CSSProperties[];
    columnLinkStyles?: React.CSSProperties[][];
    copyrightText?: string;
    copyrightStyles?: React.CSSProperties;
    sectionBackground?: string;
    sectionBackgroundOpacity?: number;
    paddingTop?: number;
    paddingBottom?: number;
}

interface FooterV1Props {
    config: FooterV1Config;
    onConfigChange?: (newConfig: FooterV1Config) => void;
    domain?: string;
}

export function FooterV1({ config, onConfigChange, domain }: FooterV1Props) {
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
        brandName,
        brandNameStyles = {},
        description,
        descriptionStyles = {},
        columns = [],
        columnTitleStyles = [],
        columnLinkStyles = [],
        copyrightText,
        copyrightStyles = {}
    } = config || {};

    // Helper to update config
    const updateConfig = (updates: Partial<FooterV1Config>) => {
        if (onConfigChange) {
            onConfigChange({ ...config, ...updates });
        }
    };

    // Update column title
    const updateColumnTitle = (colIndex: number, newTitle: string) => {
        const updatedColumns = [...columns];
        updatedColumns[colIndex] = { ...updatedColumns[colIndex], title: newTitle };
        updateConfig({ columns: updatedColumns });
    };

    // Update column title styles
    const updateColumnTitleStyles = (colIndex: number, newStyles: React.CSSProperties) => {
        const updatedStyles = [...columnTitleStyles];
        updatedStyles[colIndex] = newStyles;
        updateConfig({ columnTitleStyles: updatedStyles });
    };

    // Update column link
    const updateColumnLink = (colIndex: number, linkIndex: number, newLabel: string, newHref: string) => {
        const updatedColumns = [...columns];
        const updatedLinks = [...updatedColumns[colIndex].links];
        updatedLinks[linkIndex] = { label: newLabel, href: newHref };
        updatedColumns[colIndex] = { ...updatedColumns[colIndex], links: updatedLinks };
        updateConfig({ columns: updatedColumns });
    };

    // Update column link styles
    const updateColumnLinkStyles = (colIndex: number, linkIndex: number, newStyles: React.CSSProperties) => {
        const updatedStyles = [...columnLinkStyles];
        if (!updatedStyles[colIndex]) {
            updatedStyles[colIndex] = [];
        }
        updatedStyles[colIndex][linkIndex] = newStyles;
        updateConfig({ columnLinkStyles: updatedStyles });
    };

    return (
        <footer 
            className="relative bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 ease-in-out"
            style={{ 
                paddingTop: config?.paddingTop !== undefined ? `${config.paddingTop}px` : undefined,
                paddingBottom: config?.paddingBottom !== undefined ? `${config.paddingBottom}px` : undefined,
                // Fallback: apply defaults if specific side is undefined
                ...(config?.paddingTop === undefined && { paddingTop: '4rem' }),
                ...(config?.paddingBottom === undefined && { paddingBottom: '2rem' })
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
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        {brandName && (
                            <div className="font-bold text-xl text-slate-900 dark:text-white mb-4">
                                <EditableText
                                    value={brandName}
                                    onUpdate={(newValue) => updateConfig({ brandName: newValue })}
                                    styles={brandNameStyles}
                                    onStyleUpdate={(newStyles) => updateConfig({ brandNameStyles: newStyles })}
                                    onDelete={() => updateConfig({ brandName: undefined })}
                                    placeholder="Brand Name"
                                />
                            </div>
                        )}
                        {description && (
                            <EditableText
                                value={description}
                                onUpdate={(newValue) => updateConfig({ description: newValue })}
                                styles={descriptionStyles}
                                onStyleUpdate={(newStyles) => updateConfig({ descriptionStyles: newStyles })}
                                onDelete={() => updateConfig({ description: undefined })}
                                as="p"
                                className="text-slate-600 dark:text-slate-400 text-sm"
                                placeholder="Brand description..."
                                multiline
                            />
                        )}
                    </div>

                    {columns.map((col, idx) => (
                        <div key={idx} className="col-span-1">
                            <EditableText
                                value={col.title}
                                onUpdate={(newValue) => updateColumnTitle(idx, newValue)}
                                styles={columnTitleStyles[idx]}
                                onStyleUpdate={(newStyles) => updateColumnTitleStyles(idx, newStyles)}
                                onDelete={() => {
                                    const updatedColumns = columns.filter((_, i) => i !== idx);
                                    updateConfig({ columns: updatedColumns });
                                }}
                                as="h3"
                                className="font-semibold text-slate-900 dark:text-white mb-4"
                                placeholder="Column Title"
                            />
                            <ul className="space-y-3">
                                {col.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        {isEditMode ? (
                                            <EditableLink
                                                label={link.label}
                                                href={link.href}
                                                onUpdate={(newLabel, newHref) => updateColumnLink(idx, lIdx, newLabel, newHref)}
                                                styles={columnLinkStyles[idx]?.[lIdx]}
                                                onStyleUpdate={(newStyles) => updateColumnLinkStyles(idx, lIdx, newStyles)}
                                                onDelete={() => {
                                                    const updatedColumns = [...columns];
                                                    const updatedLinks = updatedColumns[idx].links.filter((_, i) => i !== lIdx);
                                                    updatedColumns[idx] = { ...updatedColumns[idx], links: updatedLinks };
                                                    updateConfig({ columns: updatedColumns });
                                                }}
                                                className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            />
                                        ) : (
                                            <Link 
                                                href={getSiteLink(link.href)}
                                                className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {copyrightText && (
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
                        <EditableText
                            value={copyrightText}
                            onUpdate={(newValue) => updateConfig({ copyrightText: newValue })}
                            styles={copyrightStyles}
                            onStyleUpdate={(newStyles) => updateConfig({ copyrightStyles: newStyles })}
                            onDelete={() => updateConfig({ copyrightText: undefined })}
                            placeholder="© 2024 Your Company"
                        />
                    </div>
                )}
            </div>
        </footer>
    );
}
