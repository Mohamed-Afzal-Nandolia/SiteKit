"use client";

import React, { useState } from "react";
import { useEditor } from "./EditorContext";
import type { PageSectionDTO } from "@/api";

interface SectionWrapperProps {
    section: PageSectionDTO;
    onDelete: (sectionId: number) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    children: React.ReactNode;
}

export function SectionWrapper({
    section,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst = false,
    isLast = false,
    children,
}: SectionWrapperProps) {
    const { isEditMode, selectedSectionId, selectSection } = useEditor();
    const [isHovered, setIsHovered] = useState(false);

    if (!isEditMode) {
        return <>{children}</>;
    }

    const isSelected = selectedSectionId === section.id;
    const sectionId = section.id;

    const handleClick = (e: React.MouseEvent) => {
        // Only select if clicking the wrapper, not inner content
        if (e.target === e.currentTarget) {
            selectSection(sectionId || null);
        }
    };

    const handleDelete = () => {
        if (sectionId && confirm("Are you sure you want to delete this section?")) {
            onDelete(sectionId);
        }
    };

    return (
        <div
            className={`relative transition-all ${
                isSelected 
                    ? "ring-2 ring-blue-500 ring-offset-2" 
                    : isHovered 
                        ? "ring-2 ring-blue-300/50 ring-offset-1" 
                        : ""
            }`}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Section Controls - ALWAYS visible in edit mode, touch-friendly for mobile */}
            <div 
                className="absolute top-2 right-2 md:top-4 md:right-4 z-[100] flex items-center gap-0.5 md:gap-1 bg-slate-900 shadow-lg rounded-lg p-1 md:p-1.5"
                style={{ pointerEvents: 'auto' }}
            >
                {/* Section Type Label - hidden on mobile */}
                <span className="hidden md:inline-block px-2 py-1 text-xs font-medium text-white bg-slate-700 rounded">
                    {section.sectionType}
                </span>

                {/* Move Up - larger touch target on mobile */}
                {!isFirst && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                        className="p-2 md:p-1.5 hover:bg-white/10 active:bg-white/20 rounded text-white/80 hover:text-white transition-colors touch-manipulation"
                        title="Move Up"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 15l-6-6-6 6" />
                        </svg>
                    </button>
                )}

                {/* Move Down - larger touch target on mobile */}
                {!isLast && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                        className="p-2 md:p-1.5 hover:bg-white/10 active:bg-white/20 rounded text-white/80 hover:text-white transition-colors touch-manipulation"
                        title="Move Down"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>
                )}

                {/* Delete - larger touch target on mobile */}
                <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                    className="p-2 md:p-1.5 bg-red-500/20 hover:bg-red-500 active:bg-red-600 rounded text-red-400 hover:text-white transition-colors touch-manipulation"
                    title="Delete Section"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                </button>
            </div>

            {/* Section Content */}
            {children}
        </div>
    );
}
