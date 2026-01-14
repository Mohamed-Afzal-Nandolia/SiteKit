"use client";

import Link from "next/link";
import React from "react";
import { EditableText, EditableLink, useEditor } from "@/components/editor";

export interface HeroV1Config {
    headline?: string;
    subheadline?: string;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    alignment?: "center" | "left";
    backgroundImage?: string; // URL
}

interface HeroV1Props {
    config: HeroV1Config;
    onConfigChange?: (newConfig: HeroV1Config) => void;
}

export function HeroV1({ config, onConfigChange }: HeroV1Props) {
    const { isEditMode } = useEditor();
    
    const {
        headline = "Build your dream website",
        subheadline = "The fastest way to create stunning websites without writing code.",
        primaryCta,
        secondaryCta,
        alignment = "center",
        backgroundImage
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

    const alignClass = alignment === "center" ? "text-center items-center" : "text-left items-start";

    return (
        <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-50 dark:bg-slate-950">
             {/* Background decoration */}
            <div className="absolute inset-0 z-0">
                {backgroundImage ? (
                     <div 
                        className="absolute inset-0 bg-cover bg-center opacity-10"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                     />
                ) : (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] rounded-full" />
                )}
            </div>

            <div className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${alignClass}`}>
                <EditableText
                    value={headline}
                    onUpdate={(newValue) => updateConfig({ headline: newValue })}
                    as="h1"
                    className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance mb-6"
                    placeholder="Enter headline..."
                />
                
                <EditableText
                    value={subheadline}
                    onUpdate={(newValue) => updateConfig({ subheadline: newValue })}
                    as="p"
                    className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 text-balance"
                    placeholder="Enter subheadline..."
                    multiline
                />

                <div className="flex flex-wrap gap-4">
                    {primaryCta && (
                        isEditMode ? (
                            <EditableLink
                                label={primaryCta.label}
                                href={primaryCta.href}
                                onUpdate={updatePrimaryCta}
                                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
                            />
                        ) : (
                            <Link
                                href={primaryCta.href}
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
                                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                            />
                        ) : (
                            <Link
                                href={secondaryCta.href}
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
