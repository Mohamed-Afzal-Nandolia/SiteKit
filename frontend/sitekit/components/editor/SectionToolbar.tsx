"use client";

import React, { useState } from "react";
import { createDefaultTextElement, createDefaultButtonElement, COLOR_PRESETS } from "./elementTypes";
import type { SectionElement } from "./elementTypes";

interface SectionToolbarProps {
    onAddElement: (element: SectionElement) => void;
    onAddShape?: () => void;
    onBackgroundChange?: (color: string) => void;
    currentBackground?: string;
    onBackgroundOpacityChange?: (opacity: number) => void;
    currentOpacity?: number;
    isVisible: boolean;
}

export function SectionToolbar({ 
    onAddElement, 
    onAddShape,
    onBackgroundChange, 
    currentBackground,
    onBackgroundOpacityChange,
    currentOpacity,
    isVisible 
}: SectionToolbarProps) {
    const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isVisible) return null;

    const handleAddText = () => {
        const textElement = createDefaultTextElement(50, 50);
        onAddElement(textElement);
        setIsExpanded(false);
    };

    const handleAddButton = () => {
        const buttonElement = createDefaultButtonElement(50, 70);
        onAddElement(buttonElement);
        setIsExpanded(false);
    };

    const handleBackgroundSelect = (color: string) => {
        if (onBackgroundChange) {
            onBackgroundChange(color);
        }
        setShowBackgroundPicker(false);
        setIsExpanded(false);
    };

    return (
        <div className="absolute top-2 right-2 z-[100]">
            {/* Main Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-all ${
                    isExpanded 
                        ? "bg-blue-600 text-white" 
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                } border border-slate-200 dark:border-slate-700`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                {/* <span className="hidden sm:inline">Edit Section</span> */}
            </button>

            {/* Expanded Menu */}
            {isExpanded && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[200px]">
                    {/* Add Text */}
                    <button
                        onClick={handleAddText}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="text-xl">📝</span>
                        <div>
                            <div className="font-medium text-slate-900 dark:text-white text-sm">Add Text</div>
                            <div className="text-xs text-slate-500">Add editable text</div>
                        </div>
                    </button>

                    {/* Add Button */}
                    <button
                        onClick={handleAddButton}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-t border-slate-100 dark:border-slate-700"
                    >
                        <span className="text-xl">🔘</span>
                        <div>
                            <div className="font-medium text-slate-900 dark:text-white text-sm">Add Button</div>
                            <div className="text-xs text-slate-500">Add clickable button</div>
                        </div>
                    </button>

                    {/* Add Shape */}
                    {onAddShape && (
                        <button
                            onClick={() => {
                                onAddShape();
                                setIsExpanded(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-t border-slate-100 dark:border-slate-700"
                        >
                            <span className="text-xl">⭕</span>
                            <div>
                                <div className="font-medium text-slate-900 dark:text-white text-sm">Add Shape</div>
                                <div className="text-xs text-slate-500">Add decorative shape</div>
                            </div>
                        </button>
                    )}

                    {/* Background Control */}
                    <div className="border-t border-slate-100 dark:border-slate-700 p-3">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Background</label>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="color"
                                value={currentBackground && currentBackground !== "transparent" ? currentBackground : "#ffffff"}
                                onChange={(e) => onBackgroundChange?.(e.target.value)}
                                className="w-10 h-10 rounded border border-slate-200 dark:border-slate-600 cursor-pointer"
                            />
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    value={(currentBackground && currentBackground !== "transparent") ? currentBackground : ""}
                                    onChange={(e) => onBackgroundChange?.(e.target.value)}
                                    placeholder="Transparent"
                                    className="w-full px-2 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                />
                            </div>
                            <button
                                onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                                className={`p-2 rounded-lg transition-colors ${
                                    showBackgroundPicker 
                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
                                }`}
                                title="Show presets"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                                </svg>
                            </button>
                        </div>

                        {/* Opacity Control */}
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 w-16">Opacity</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={Math.round((currentOpacity ?? 1) * 100)}
                                onChange={(e) => onBackgroundOpacityChange?.(parseInt(e.target.value) / 100)}
                                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right">
                                {Math.round((currentOpacity ?? 1) * 100)}%
                            </span>
                        </div>

                        {/* Presets Grid */}
                        {showBackgroundPicker && (
                            <div className="grid grid-cols-7 gap-2 mb-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                {COLOR_PRESETS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            onBackgroundChange?.(color);
                                            setShowBackgroundPicker(false);
                                        }}
                                        className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${
                                            currentBackground === color 
                                                ? "border-blue-500 ring-2 ring-blue-500/30" 
                                                : "border-slate-300 dark:border-slate-600"
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => {
                                onBackgroundChange?.("transparent");
                                setShowBackgroundPicker(false);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            Remove Background
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
