import React from "react";
import { SectionRenderer } from "../renderer/SectionRenderer";
import type { PageSectionDTO } from "@/api";

interface TemplateCardPreviewProps {
    sections?: PageSectionDTO[];
}

export function TemplateCardPreview({ sections = [] }: TemplateCardPreviewProps) {
    if (!sections || sections.length === 0) {
        return (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-sm">
                No Preview
            </div>
        );
    }

    // Sort sections
    const sortedSections = [...sections].sort((a, b) => (a.position || 0) - (b.position || 0));

    // We use a percentage-based approach to ensure it fills the width perfectly.
    // Width 400% * Scale 0.25 = 100% of the parent container.
    // This makes the "virtual" viewport 4x the card width (e.g. 300px card -> 1200px viewport).
    
    return (
        <div className="w-full h-full relative overflow-hidden bg-white dark:bg-slate-950 select-none pointer-events-none">
            {/* Scaling Container */}
            <div 
                className="origin-top-left"
                style={{ 
                    width: "400%",
                    transform: "scale(0.25)", 
                }}
            >
                {sortedSections.map((section) => (
                    <SectionRenderer key={section.id} section={section} />
                ))}
            </div>
            
            {/* Interaction Shield */}
            <div className="absolute inset-0 z-10" />
        </div>
    );
}
