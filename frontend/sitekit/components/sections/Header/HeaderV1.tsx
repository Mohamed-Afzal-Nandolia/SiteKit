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
    sectionBackgroundImage?: string;
    sectionBackground?: string;
    sectionBackgroundOpacity?: number;
    paddingTop?: number;
    paddingBottom?: number;
}

interface HeaderV1Props {
    config: HeaderV1Config;
    onConfigChange?: (newConfig: HeaderV1Config) => void;
    domain?: string;
}

export function HeaderV1({ config, onConfigChange, domain }: HeaderV1Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isEditMode } = useEditor();
    const sectionRef = React.useRef<HTMLElement>(null);
    
    // Helper to transform internal links for public site view
    const getSiteLink = (href: string) => {
        // If no domain provided (editor mode) or external link, return as is
        if (!domain || !href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) {
            return href;
        }
        
        // Avoid double prefixing if already includes domain
        if (href.startsWith(`/${domain}/`) || href === `/${domain}`) {
            return href;
        }

        // Ensure href starts with /
        const path = href.startsWith("/") ? href : `/${href}`;
        
        // Return domain prefixed link
        return `/${domain}${path}`;
    };

    const { 
        logoText,
        logoImage,
        logoStyles = {},
        navLinks = [], 
        actionButton,
        elements = [],
        sectionBackground,
        sectionBackgroundImage,
        sectionBackgroundOpacity
    } = config || {};

    // Helper to update config
    const updateConfig = (updates: Partial<HeaderV1Config>) => {
        if (onConfigChange) {
            onConfigChange({ ...config, ...updates });
        }
    };

    // Auto-migrate legacy props to elements
    React.useEffect(() => {
        if (!elements || elements.length === 0) {
            const newElements: SectionElement[] = [];
            
            // Migrate Logo (Image or Text)
            if (logoImage) {
                newElements.push({
                    id: `logo-${Date.now()}`,
                    type: "image",
                    content: "",
                    src: logoImage,
                    x: 5,
                    y: 50,
                    width: 15,
                    height: 80, // High height to fit container, check objectFit
                    objectFit: "contain",
                    mobile: { x: 5, y: 50, width: 25 } 
                });
            } else if (logoText) {
                newElements.push({
                    id: `logo-${Date.now()}`,
                    type: "text",
                    content: logoText,
                    x: 5,
                    y: 50,
                    fontSize: 20,
                    fontWeight: "700",
                    textColor: logoStyles?.color as string || "#0F172A",
                    fontFamily: logoStyles?.fontFamily as string || "Inter",
                    mobile: { x: 5, y: 50, fontSize: 18 } // Keep logo visible/sized on mobile
                });
            }

            // Migrate Nav Links
            navLinks.forEach((link, idx) => {
                // Calculate position based on index (centered-ish)
                const startX = 40;
                const gap = 10; // %
                newElements.push({
                    id: `nav-${Date.now()}-${idx}`,
                    type: "text",
                    content: link.label,
                    href: link.href,
                    x: startX + (idx * gap),
                    y: 50,
                    fontSize: 14,
                    fontWeight: "500",
                    textColor: "#475569",
                    mobile: { hidden: true } // Helper property we'll use to hide from canvas
                });
            });

            // Migrate Action Button
            if (actionButton) {
                newElements.push({
                    id: `btn-${Date.now()}`,
                    type: "button",
                    content: actionButton.label,
                    href: actionButton.href,
                    x: 90,
                    y: 50,
                    fontSize: 14,
                    fontWeight: "500",
                    backgroundColor: actionButton.variant === "outline" ? "transparent" : "#2563EB",
                    textColor: actionButton.variant === "outline" ? "#0F172A" : "#FFFFFF",
                    paddingX: 16,
                    paddingY: 8,
                    borderRadius: 8,
                    borderWidth: actionButton.variant === "outline" ? 1 : 0,
                    borderColor: actionButton.variant === "outline" ? "#E2E8F0" : "transparent",
                    mobile: { hidden: true }
                });
            }

            if (newElements.length > 0) {
                // Clear legacy props to prevent double render after migration
                updateConfig({
                    elements: newElements,
                    logoText: undefined,
                    logoImage: undefined,
                    navLinks: undefined,
                    actionButton: undefined
                });
            }
        }
    }, [logoText, logoImage, navLinks, actionButton, elements]); // Run when these change/load

    // Filter elements for Mobile View
    // On mobile canvas, we only show "content" (like Logo) and hide "links" (which go in the menu)
    // We assume items with 'href' are navigation items.
    const canvasElements = React.useMemo(() => {
        // We can't easily check for 'mobile' view mode here effectively because of SSR/Hydration matching? 
        // Actually we are client side.
        // But for now, let's rely on the 'mobile.hidden' flag if we set it, or just filter by href.
        
        // Simple heuristic: If it has an href, it goes in the menu on Mobile.
        // Exception: Images? No, usually icons.
        
        // We need to return ALL elements for Desktop.
        // But for Mobile, we filter.
        // Since ElementOverlay is generic, let's just pass all elements, 
        // BUT we need to make sure the "hidden" ones are actually hidden.
        // standard DraggableElement doesn't have "hidden". 
        // We will just allow them to be there for now, or use the View logic.
        return elements;
    }, [elements]);

    const mobileMenuElements = elements.filter(e => e.href);

    return (
        <header 
            ref={sectionRef}
            className={`${isEditMode ? 'relative' : 'sticky'} top-0 z-50 w-full border-b border-white/10 transition-all duration-300 ease-in-out`}
            style={{ 
                paddingTop: config?.paddingTop !== undefined ? `${config.paddingTop}px` : undefined,
                paddingBottom: config?.paddingBottom !== undefined ? `${config.paddingBottom}px` : undefined,
                minHeight: '64px' // Ensure height
            }}
        >
            {/* Background Layer */}
            <div className={`absolute inset-0 ${isEditMode ? '' : 'z-0'}`}>
                {/* Default backdrop blur layer */}
                <div 
                    className="absolute inset-0 backdrop-blur-md bg-white dark:bg-slate-950"
                    style={{ opacity: (!sectionBackground || sectionBackground === "transparent") ? (sectionBackgroundOpacity ?? 0.8) : 0 }}
                />
                
                {/* Background Image Layer */}
                {sectionBackgroundImage && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-all"
                        style={{ backgroundImage: `url(${sectionBackgroundImage})` }}
                    />
                )}
                
                {/* Custom Background Color Layer */}
                {sectionBackground && sectionBackground !== "transparent" && (
                    <div 
                        className="absolute inset-0 transition-colors"
                        style={{ 
                            backgroundColor: sectionBackground,
                            opacity: sectionBackgroundOpacity ?? (sectionBackgroundImage ? 0.8 : 1)
                        }}
                    />
                )}
            </div>

            {/* Desktop / Main Layout Container */}
            {/* We render an overlay-like container for elements to live in relative to this header */}
            <div className={`relative w-full h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex items-center justify-between`}>
                 {/* 
                    Design Decision:
                    To enable fully draggable "Hero-like" behavior, we stop using Flexbox for the content.
                    Instead, we rely on the `ElementOverlay` (provided by SectionWrapper) to render everything absolutely.
                    
                    HOWEVER, SectionWrapper renders the overlay covering the *entire section*.
                    So we don't need to render elements here manually.
                    
                    We JUST need the Mobile Toggle Button.
                 */}
                 
                 {/* Render Mobile Toggle - Only visible on Mobile */}
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden z-50">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

            {/* Note: Standard Elements are rendered by SectionWrapper/SectionRenderer in the overlay */}

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-4 shadow-xl z-50">
                    <nav className="flex flex-col space-y-4">
                        {mobileMenuElements.map((el, idx) => (
                            <div key={el.id} className="block">
                                {isEditMode ? (
                                    <EditableLink
                                        label={el.content || "Link"}
                                        href={el.href || "#"}
                                        onUpdate={(newLabel, newHref) => {
                                            // Find element, update it
                                            const updated = elements.map(e => e.id === el.id ? { ...e, content: newLabel, href: newHref } : e);
                                            updateConfig({ elements: updated });
                                        }}
                                        styles={{
                                            ...el,
                                            // Force mobile friendly styles for list
                                            position: 'relative',
                                            display: 'block',
                                            width: '100%',
                                            textAlign: 'left',
                                            fontSize: '16px',
                                            padding: '8px 0',
                                        } as any}
                                        // No delete in menu for now? Or allow delete?
                                    />
                                ) : (
                                    <Link 
                                        href={getSiteLink(el.href || "#")}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block text-base font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        {el.content}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
