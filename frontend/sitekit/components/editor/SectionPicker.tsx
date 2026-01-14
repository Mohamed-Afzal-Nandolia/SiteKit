"use client";

import React, { useState } from "react";
import { useEditor } from "./EditorContext";
import type { SectionType } from "@/api";

interface SectionPickerProps {
    onSelect: (sectionType: SectionType, variant: string) => void;
    onClose: () => void;
}

// Available section types with their default variants
const SECTION_OPTIONS: { type: SectionType; label: string; description: string; icon: string }[] = [
    { type: "HEADER", label: "Header", description: "Navigation bar with logo and links", icon: "🔝" },
    { type: "HERO", label: "Hero", description: "Large banner with headline and CTA", icon: "🦸" },
    { type: "CONTENT", label: "Content/Features", description: "Grid of features or content blocks", icon: "📦" },
    { type: "CTA", label: "Call to Action", description: "Action-focused section with button", icon: "📣" },
    { type: "FOOTER", label: "Footer", description: "Bottom navigation and info", icon: "📍" },
];

export function SectionPicker({ onSelect, onClose }: SectionPickerProps) {
    const [hoveredType, setHoveredType] = useState<SectionType | null>(null);

    const handleSelect = (type: SectionType) => {
        // Default to v1 variant for all types
        const variant = `${type.toLowerCase()}_v1`;
        onSelect(type, variant);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Section</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-2">
                    {SECTION_OPTIONS.map((option) => (
                        <button
                            key={option.type}
                            onClick={() => handleSelect(option.type)}
                            onMouseEnter={() => setHoveredType(option.type)}
                            onMouseLeave={() => setHoveredType(null)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${
                                hoveredType === option.type 
                                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500" 
                                    : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                            } border border-transparent`}
                        >
                            <span className="text-2xl">{option.icon}</span>
                            <div>
                                <div className="font-semibold text-slate-900 dark:text-white">
                                    {option.label}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {option.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <p className="mt-4 text-xs text-slate-400 text-center">
                    Click on a section type to add it to your page
                </p>
            </div>
        </div>
    );
}

// Add Section Button Component
interface AddSectionButtonProps {
    onClick: () => void;
}

export function AddSectionButton({ onClick }: AddSectionButtonProps) {
    const { isEditMode } = useEditor();
    
    if (!isEditMode) return null;

    return (
        <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center">
                <button
                    onClick={onClick}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Section
                </button>
            </div>
        </div>
    );
}
