"use client";

import React from "react";
import { EditableText, useEditor } from "@/components/editor";

export interface FeatureItem {
    title: string;
    description: string;
    icon?: string; // Could be lucide icon name or svg path, treating as simplified string for now
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
    sectionBackground?: string;
    sectionBackgroundOpacity?: number;
}

interface ContentV1Props {
    config: ContentV1Config;
    onConfigChange?: (newConfig: ContentV1Config) => void;
    domain?: string;
}

export function ContentV1({ config, onConfigChange, domain }: ContentV1Props) {
    const { isEditMode } = useEditor();
    
    const {
        title,
        titleStyles = {},
        description,
        descriptionStyles = {},
        features = [],
        featureTitleStyles = [],
        featureDescriptionStyles = [],
        layout = "grid"
    } = config || {};

    // Helper to update config
    const updateConfig = (updates: Partial<ContentV1Config>) => {
        if (onConfigChange) {
            onConfigChange({ ...config, ...updates });
        }
    };

    // Update a specific feature
    const updateFeature = (index: number, updates: Partial<FeatureItem>) => {
        const updatedFeatures = [...features];
        updatedFeatures[index] = { ...updatedFeatures[index], ...updates };
        updateConfig({ features: updatedFeatures });
    };

    // Update feature title styles
    const updateFeatureTitleStyles = (index: number, newStyles: React.CSSProperties) => {
        const updatedStyles = [...featureTitleStyles];
        updatedStyles[index] = newStyles;
        updateConfig({ featureTitleStyles: updatedStyles });
    };

    // Update feature description styles
    const updateFeatureDescriptionStyles = (index: number, newStyles: React.CSSProperties) => {
        const updatedStyles = [...featureDescriptionStyles];
        updatedStyles[index] = newStyles;
        updateConfig({ featureDescriptionStyles: updatedStyles });
    };

    return (
        <section className="relative py-20 bg-white dark:bg-slate-900 overflow-hidden transition-colors">
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
                <div className="text-center max-w-3xl mx-auto mb-16">
                    {title && (
                        <EditableText
                            value={title}
                            onUpdate={(newValue) => updateConfig({ title: newValue })}
                            styles={titleStyles}
                            onStyleUpdate={(newStyles) => updateConfig({ titleStyles: newStyles })}
                            onDelete={() => updateConfig({ title: undefined })}
                            as="h2"
                            className="text-3xl font-bold text-slate-900 dark:text-white mb-4"
                            placeholder="Section Title"
                        />
                    )}
                    {(description || isEditMode) && (
                        <EditableText
                            value={description || ""}
                            onUpdate={(newValue) => updateConfig({ description: newValue })}
                            styles={descriptionStyles}
                            onStyleUpdate={(newStyles) => updateConfig({ descriptionStyles: newStyles })}
                            onDelete={() => updateConfig({ description: undefined })}
                            as="p"
                            className="text-lg text-slate-600 dark:text-slate-400"
                            placeholder="Section description..."
                            multiline
                        />
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div 
                            key={idx} 
                            className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-500/50 transition-colors"
                        >
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-6">
                                {/* Placeholder icon */}
                                <div className="w-6 h-6 border-2 border-current rounded-full" />
                            </div>
                            <EditableText
                                value={feature.title}
                                onUpdate={(newValue) => updateFeature(idx, { title: newValue })}
                                styles={featureTitleStyles[idx]}
                                onStyleUpdate={(newStyles) => updateFeatureTitleStyles(idx, newStyles)}
                                onDelete={() => {
                                    const updatedFeatures = features.filter((_, i) => i !== idx);
                                    updateConfig({ features: updatedFeatures });
                                }}
                                as="h3"
                                className="text-xl font-semibold text-slate-900 dark:text-white mb-3"
                                placeholder="Feature title"
                            />
                            <EditableText
                                value={feature.description}
                                onUpdate={(newValue) => updateFeature(idx, { description: newValue })}
                                styles={featureDescriptionStyles[idx]}
                                onStyleUpdate={(newStyles) => updateFeatureDescriptionStyles(idx, newStyles)}
                                onDelete={() => updateFeature(idx, { description: undefined })}
                                as="p"
                                className="text-slate-600 dark:text-slate-400"
                                placeholder="Feature description..."
                                multiline
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
