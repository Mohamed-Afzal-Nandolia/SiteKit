"use client";

import Link from "next/link";
import React, { useState } from "react";
import { EditableText, EditableLink, useEditor } from "@/components/editor";
import { createDefaultTextElement, createDefaultButtonElement, COLOR_PRESETS } from "../../editor/elementTypes";
import { ElementOverlay } from "../../editor/DraggableElement";
import type { SectionElement } from "../../editor/elementTypes";

export interface HeaderV1Config {
    logoText?: string;
    logoImage?: string;
    logoStyles?: React.CSSProperties;
    navLinks?: { label: string; href: string; styles?: React.CSSProperties }[];
    actionButton?: { label: string; href: string; variant?: "primary" | "secondary" | "outline"; styles?: React.CSSProperties };
    elements?: SectionElement[];
    sectionBackground?: string;
}

interface HeaderV1Props {
    config: HeaderV1Config;
    onConfigChange?: (newConfig: HeaderV1Config) => void;
}

export function HeaderV1({ config, onConfigChange }: HeaderV1Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isEditMode } = useEditor();
    const sectionRef = React.useRef<HTMLElement>(null);
    
    // Editor state
    const [isExpanded, setIsExpanded] = useState(false);
    const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

    const { 
        logoText,
        logoStyles = {},
        navLinks = [], 
        actionButton,
        elements = [],
        sectionBackground
    } = config || {};

    // Helper to update config
    const updateConfig = (updates: Partial<HeaderV1Config>) => {
        if (onConfigChange) {
            onConfigChange({ ...config, ...updates });
        }
    };

    // Update a specific nav link
    const updateNavLink = (index: number, newLabel: string, newHref: string) => {
        const updatedLinks = [...navLinks];
        updatedLinks[index] = { ...updatedLinks[index], label: newLabel, href: newHref };
        updateConfig({ navLinks: updatedLinks });
    };

    // Update nav link styles
    const updateNavLinkStyles = (index: number, newStyles: React.CSSProperties) => {
        const updatedLinks = [...navLinks];
        updatedLinks[index] = { ...updatedLinks[index], styles: newStyles };
        updateConfig({ navLinks: updatedLinks });
    };

    // Delete a nav link
    const deleteNavLink = (index: number) => {
        const updatedLinks = navLinks.filter((_, idx) => idx !== index);
        updateConfig({ navLinks: updatedLinks });
    };

    // Update action button
    const updateActionButton = (newLabel: string, newHref: string) => {
        if (actionButton) {
            updateConfig({ 
                actionButton: { ...actionButton, label: newLabel, href: newHref } 
            });
        }
    };

    // Editor handlers
    const handleAddText = () => {
        const textElement = createDefaultTextElement(50, 50);
        updateConfig({ elements: [...elements, textElement] });
        setIsExpanded(false);
    };

    const handleAddButton = () => {
        const buttonElement = createDefaultButtonElement(50, 70);
        updateConfig({ elements: [...elements, buttonElement] });
        setIsExpanded(false);
    };

    const handleBackgroundSelect = (color: string) => {
        updateConfig({ sectionBackground: color });
        setShowBackgroundPicker(false);
        setIsExpanded(false);
    };

    return (
        <header 
            ref={sectionRef}
            className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative z-10">
                {/* Logo */}
                {logoText && (
                    <div className="flex-shrink-0 font-bold text-xl text-slate-900 dark:text-white">
                        <EditableText
                            value={logoText}
                            onUpdate={(newValue) => updateConfig({ logoText: newValue })}
                            styles={logoStyles}
                            onStyleUpdate={(newStyles) => updateConfig({ logoStyles: newStyles })}
                            onDelete={() => updateConfig({ logoText: undefined })}
                            placeholder="Brand Name"
                        />
                    </div>
                )}

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link, idx) => (
                        isEditMode ? (
                            <EditableLink
                                key={idx}
                                label={link.label}
                                href={link.href}
                                onUpdate={(newLabel, newHref) => updateNavLink(idx, newLabel, newHref)}
                                styles={link.styles}
                                onStyleUpdate={(newStyles) => updateNavLinkStyles(idx, newStyles)}
                                onDelete={() => deleteNavLink(idx)}
                                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            />
                        ) : (
                            <Link 
                                key={idx} 
                                href={link.href}
                                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {link.label}
                            </Link>
                        )
                    ))}
                </nav>

                {/* Desktop Action & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        {actionButton && (
                            isEditMode ? (
                                <EditableLink
                                    label={actionButton.label}
                                    href={actionButton.href}
                                    onUpdate={updateActionButton}
                                    styles={actionButton.styles}
                                    onStyleUpdate={(newStyles) => updateConfig({ actionButton: { ...actionButton, styles: newStyles } })}
                                    onDelete={() => updateConfig({ actionButton: undefined })}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        actionButton.variant === "outline" 
                                            ? "border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
                                    }`}
                                />
                            ) : (
                                <Link
                                    href={actionButton.href}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        actionButton.variant === "outline" 
                                            ? "border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
                                    }`}
                                >
                                    {actionButton.label}
                                </Link>
                            )
                        )}
                    </div>



                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle menu"
                    >
                         {isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                         ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                         )}
                    </button>
                </div>
            </div>

            {/* Custom Elements Overlay (View Mode Only) */}
            {!isEditMode && elements.length > 0 && (
                <ElementOverlay
                    elements={elements}
                    sectionRef={sectionRef}
                    isEditMode={false}
                    onUpdateElement={() => {}}
                    onDeleteElement={() => {}}
                />
            )}

            {/* Editor Toolbar Button - Absolute Positioned */}
            {isEditMode && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 z-50">
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
        
                            {/* Change Background */}
                            <button
                                onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-t border-slate-100 dark:border-slate-700"
                            >
                                <span className="text-xl">🎨</span>
                                <div className="flex-1">
                                    <div className="font-medium text-slate-900 dark:text-white text-sm">Background</div>
                                    <div className="text-xs text-slate-500">Change section color</div>
                                </div>
                                {sectionBackground && sectionBackground !== "transparent" && (
                                    <div 
                                        className="w-6 h-6 rounded-full border-2 border-slate-300"
                                        style={{ backgroundColor: sectionBackground }}
                                    />
                                )}
                            </button>
        
                            {/* Background Color Picker */}
                            {showBackgroundPicker && (
                                <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                    <div className="grid grid-cols-7 gap-2 mb-2">
                                        {COLOR_PRESETS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => handleBackgroundSelect(color)}
                                                className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${
                                                    sectionBackground === color 
                                                        ? "border-blue-500 ring-2 ring-blue-500/30" 
                                                        : "border-slate-300 dark:border-slate-600"
                                                }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handleBackgroundSelect("transparent")}
                                        className="w-full px-3 py-1.5 text-xs bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                                    >
                                        Remove Background
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white px-4 py-4 space-y-4 shadow-xl">
                    <nav className="flex flex-col space-y-4">
                        {navLinks.map((link, idx) => (
                            <Link 
                                key={idx} 
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="block text-base font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    
                    {actionButton && (
                         <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                             <Link
                                href={actionButton.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block w-full text-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                    actionButton.variant === "outline" 
                                        ? "border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            >
                                {actionButton.label}
                            </Link>
                         </div>
                    )}
                </div>
            )}
        </header>
    );
}
