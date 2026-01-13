import React from "react";

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

export function ContentV1({ config }: { config: ContentV1Config }) {
    const {
        title = "Features",
        description,
        features = [],
        layout = "grid"
    } = config || {};

    return (
        <section className="py-20 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
                    {description && (
                        <p className="text-lg text-slate-600 dark:text-slate-400">{description}</p>
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
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
