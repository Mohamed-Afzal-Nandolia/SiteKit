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
}

interface CtaV1Props {
    config: CtaV1Config;
    onConfigChange?: (newConfig: CtaV1Config) => void;
}

export function CtaV1({ config, onConfigChange }: CtaV1Props) {
    const { isEditMode } = useEditor();
    
    const {
        title = "Ready to get started?",
        titleStyles = {},
        description = "Join thousands of users building their websites today.",
        descriptionStyles = {},
        buttonText = "Start building now",
        buttonLink = "/signup",
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
        <section className="py-20 bg-blue-600 dark:bg-blue-700">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <EditableText
                    value={title}
                    onUpdate={(newValue) => updateConfig({ title: newValue })}
                    styles={titleStyles}
                    onStyleUpdate={(newStyles) => updateConfig({ titleStyles: newStyles })}
                    as="h2"
                    className="text-3xl md:text-4xl font-bold text-white mb-6"
                    placeholder="CTA Title"
                />
                <EditableText
                    value={description}
                    onUpdate={(newValue) => updateConfig({ description: newValue })}
                    styles={descriptionStyles}
                    onStyleUpdate={(newStyles) => updateConfig({ descriptionStyles: newStyles })}
                    as="p"
                    className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
                    placeholder="CTA description..."
                    multiline
                />
                {isEditMode ? (
                    <EditableLink
                        label={buttonText}
                        href={buttonLink}
                        onUpdate={updateButton}
                        styles={buttonStyles}
                        onStyleUpdate={(newStyles) => updateConfig({ buttonStyles: newStyles })}
                        className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl"
                    />
                ) : (
                    <Link
                        href={buttonLink}
                        className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl"
                    >
                        {buttonText}
                    </Link>
                )}
            </div>
        </section>
    );
}
