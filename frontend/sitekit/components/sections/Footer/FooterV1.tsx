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
    description?: string;
    columns?: FooterColumn[];
    copyrightText?: string;
}

interface FooterV1Props {
    config: FooterV1Config;
    onConfigChange?: (newConfig: FooterV1Config) => void;
}

export function FooterV1({ config, onConfigChange }: FooterV1Props) {
    const { isEditMode } = useEditor();
    
    const {
        brandName = "SiteKit",
        description = "Building the web, one block at a time.",
        columns = [],
        copyrightText = "© 2024 SiteKit. All rights reserved."
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

    // Update column link
    const updateColumnLink = (colIndex: number, linkIndex: number, newLabel: string, newHref: string) => {
        const updatedColumns = [...columns];
        const updatedLinks = [...updatedColumns[colIndex].links];
        updatedLinks[linkIndex] = { label: newLabel, href: newHref };
        updatedColumns[colIndex] = { ...updatedColumns[colIndex], links: updatedLinks };
        updateConfig({ columns: updatedColumns });
    };

    return (
        <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="font-bold text-xl text-slate-900 dark:text-white mb-4">
                            <EditableText
                                value={brandName}
                                onUpdate={(newValue) => updateConfig({ brandName: newValue })}
                                placeholder="Brand Name"
                            />
                        </div>
                        <EditableText
                            value={description}
                            onUpdate={(newValue) => updateConfig({ description: newValue })}
                            as="p"
                            className="text-slate-600 dark:text-slate-400 text-sm"
                            placeholder="Brand description..."
                            multiline
                        />
                    </div>

                    {columns.map((col, idx) => (
                        <div key={idx} className="col-span-1">
                            <EditableText
                                value={col.title}
                                onUpdate={(newValue) => updateColumnTitle(idx, newValue)}
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
                                                className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            />
                                        ) : (
                                            <Link 
                                                href={link.href}
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

                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
                    <EditableText
                        value={copyrightText}
                        onUpdate={(newValue) => updateConfig({ copyrightText: newValue })}
                        placeholder="© 2024 Your Company"
                    />
                </div>
            </div>
        </footer>
    );
}
