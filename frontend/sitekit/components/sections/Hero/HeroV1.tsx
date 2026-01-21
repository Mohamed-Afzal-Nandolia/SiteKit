"use client";

import React from "react";
import { useEditor, EditableShape } from "@/components/editor";
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
    sectionBackgroundImage?: string; // Generic background
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

    const {
        backgroundImage,
        sectionBackgroundImage,
        decorativeShapes = []
    } = config || {};

    // Use either specific backgroundImage or generic sectionBackgroundImage
    const bgImage = backgroundImage || sectionBackgroundImage;

    // Helper to update config
    const updateConfig = (updates: Partial<HeroV1Config>) => {
        if (onConfigChange) {
            onConfigChange({ ...config, ...updates });
        }
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

    return (
        <section 
            className="relative overflow-hidden transition-all duration-300 ease-in-out"
            style={{ 
                // Only apply min-height if padding hasn't been customized
                minHeight: (config?.paddingTop === undefined && config?.paddingBottom === undefined) ? '600px' : '200px',
                paddingTop: config?.paddingTop !== undefined ? `${config.paddingTop}px` : undefined,
                paddingBottom: config?.paddingBottom !== undefined ? `${config.paddingBottom}px` : undefined,
                // Fallback: apply defaults if specific side is undefined
                ...(config?.paddingTop === undefined && { paddingTop: '5rem' }),
                ...(config?.paddingBottom === undefined && { paddingBottom: '5rem' })
            }}
        >
            {/* Background decoration */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                 {/* Note: pointer-events-none allows checking clicks on elements below, BUT shapes need pointer events if editable.
                     The EditableShape component likely handles its own pointer events.
                     Actually, if this div is z-0, and elements are in ElementOverlay (z-10?), elements will be on top.
                     But if users want to drag shapes, we need pointer events on shapes.
                 */}
                
                <div className="absolute inset-0 pointer-events-auto">
                    {/* Decorative Shapes */}
                    {decorativeShapes.map((shape) => (
                        <EditableShape
                            key={shape.id}
                            shape={shape}
                            onUpdate={(updates) => updateShape(shape.id, updates)}
                            onDelete={() => deleteShape(shape.id)}
                        />
                    ))}
                </div>

                {/* Default shape if no custom shapes */}
                {decorativeShapes.length === 0 && !backgroundImage && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] rounded-full" />
                )}

                {/* Background image */}
                {bgImage && (
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${bgImage})` }}
                    />
                )}

                {/* Edit Mode Controls for Shapes */}
                {isEditMode && (
                    <div className="absolute bottom-4 right-4 z-10 flex gap-2 pointer-events-auto">
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
            
            {/* No static content rendered here anymore. 
                Elements are rendered by SectionRenderer via ElementOverlay. 
            */}
        </section>
    );
}
