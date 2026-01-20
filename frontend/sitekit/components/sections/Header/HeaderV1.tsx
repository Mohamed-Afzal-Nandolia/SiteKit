"use client";

import Link from "next/link";
import React, { useState } from "react";
import { EditableText, EditableLink, useEditor } from "@/components/editor";
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
    sectionBackgroundOpacity?: number;
}

interface HeaderV1Props {
    config: HeaderV1Config;
    onConfigChange?: (newConfig: HeaderV1Config) => void;
}

export function HeaderV1({ config, onConfigChange }: HeaderV1Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isEditMode } = useEditor();
    const sectionRef = React.useRef<HTMLElement>(null);
    
    const { 
        logoText,
        logoStyles = {},
        navLinks = [], 
        actionButton,
        elements = [],
        sectionBackground,
        sectionBackgroundOpacity
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

    return (
        <header 
            ref={sectionRef}
            className="sticky top-0 z-50 w-full border-b border-white/10"
        >
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                {/* Default backdrop blur layer */}
                <div 
                    className="absolute inset-0 backdrop-blur-md bg-white dark:bg-slate-950"
                    style={{ opacity: (!sectionBackground || sectionBackground === "transparent") ? (sectionBackgroundOpacity ?? 0.8) : 0 }}
                />
                
                {/* Custom Background Color Layer */}
                {sectionBackground && sectionBackground !== "transparent" && (
                    <div 
                        className="absolute inset-0 transition-colors"
                        style={{ 
                            backgroundColor: sectionBackground,
                            opacity: sectionBackgroundOpacity ?? 1
                        }}
                    />
                )}
            </div>
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
