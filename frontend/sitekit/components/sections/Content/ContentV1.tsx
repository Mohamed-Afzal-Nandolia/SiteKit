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
    description?: string;
    features?: FeatureItem[];
    layout?: "grid" | "alternating";
}

interface ContentV1Props {
    config: ContentV1Config;
    onConfigChange?: (newConfig: ContentV1Config) => void;
}

export function ContentV1({ config, onConfigChange }: ContentV1Props) {
    const { isEditMode } = useEditor();
    
    const {
        title = "Features",
        description,
        features = [],
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

    return (
        <section className="py-20 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <EditableText
                        value={title}
                        onUpdate={(newValue) => updateConfig({ title: newValue })}
                        as="h2"
                        className="text-3xl font-bold text-slate-900 dark:text-white mb-4"
                        placeholder="Section Title"
                    />
                    {(description || isEditMode) && (
                        <EditableText
                            value={description || ""}
                            onUpdate={(newValue) => updateConfig({ description: newValue })}
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
                                as="h3"
                                className="text-xl font-semibold text-slate-900 dark:text-white mb-3"
                                placeholder="Feature title"
                            />
                            <EditableText
                                value={feature.description}
                                onUpdate={(newValue) => updateFeature(idx, { description: newValue })}
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
