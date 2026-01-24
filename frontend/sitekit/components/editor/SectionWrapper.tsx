"use client";

import React, { useState, useRef } from "react";
import { useEditor } from "./EditorContext";
import { SectionToolbar } from "./SectionToolbar";
import { ElementOverlay } from "./DraggableElement";
import { AssetManager } from "./AssetManager";
import type { PageSectionDTO, AssetDTO } from "@/api";
import type { SectionElement, ExtendedSectionConfig } from "./elementTypes";

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
    const { isEditMode, selectedSectionId, selectSection, updateSectionConfig, getSectionConfig } = useEditor();
    const [isHovered, setIsHovered] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBackgroundImagePicker, setShowBackgroundImagePicker] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    // Use ref to hold the setter to avoid stale closures
    const setShowBackgroundImagePickerRef = useRef(setShowBackgroundImagePicker);
    setShowBackgroundImagePickerRef.current = setShowBackgroundImagePicker;



    // Get current config with elements
    const sectionId = section.id;
    // Get pending config from context, OR fallback to existing section config
    const pendingConfig = sectionId ? getSectionConfig(sectionId) : undefined;

    // Parse the initial config from props
    let initialConfig: ExtendedSectionConfig = {};
    try {
        if (section.configJson) {
            initialConfig = JSON.parse(section.configJson);
        } else if (typeof section.config === "string") {
            initialConfig = JSON.parse(section.config);
        } else {
            initialConfig = (section.config as ExtendedSectionConfig) || {};
        }
    } catch (e) {
        console.error("Failed to parse section config", e);
    }

    // Merge: pending config takes precedence
    const currentConfig: ExtendedSectionConfig = {
        ...initialConfig,
        ...(pendingConfig || {})
    };
    const elements = currentConfig.elements || [];
    const sectionBackground = currentConfig.sectionBackground;
    const sectionBackgroundImage = currentConfig.sectionBackgroundImage;



    // Add a new element
    const handleAddElement = (element: SectionElement) => {
        if (!sectionId) return;



        const updatedElements = [...elements, element];
        updateSectionConfig(sectionId, {
            ...currentConfig,
            elements: updatedElements,
        });


    };

    // Update an element
    const handleUpdateElement = (elementId: string, updates: Partial<SectionElement>) => {
        if (!sectionId) return;



        const updatedElements = elements.map((el) =>
            el.id === elementId ? { ...el, ...updates } : el
        );



        updateSectionConfig(sectionId, {
            ...currentConfig,
            elements: updatedElements,
        });
    };

    // Delete an element
    const handleDeleteElement = (elementId: string) => {
        if (!sectionId) return;

        const updatedElements = elements.filter((el) => el.id !== elementId);
        updateSectionConfig(sectionId, {
            ...currentConfig,
            elements: updatedElements,
        });
    };

    // Change section background
    const handleBackgroundChange = (color: string) => {
        if (!sectionId) return;

        if (color === "remove-image") {
            updateSectionConfig(sectionId, {
                ...currentConfig,
                sectionBackgroundImage: "", // Clear image
            });
            return;
        }

        updateSectionConfig(sectionId, {
            ...currentConfig,
            sectionBackground: color,
        });
    };

    // Open background image picker - use ref to avoid stale closure issues
    const openBackgroundImagePicker = React.useCallback(() => {

        setShowBackgroundImagePickerRef.current(true);
    }, []);

    // Handle background image selection from AssetManager
    const handleBackgroundImageSelect = (asset: AssetDTO) => {
        if (!sectionId) return;

        let imageUrl = "";
        if (asset.fileData && asset.mimeType) {
            imageUrl = `data:${asset.mimeType};base64,${asset.fileData}`;
        } else if (asset.url) {
            imageUrl = asset.url;
        }

        if (imageUrl) {
            const freshConfig = getSectionConfig(sectionId) as ExtendedSectionConfig || {};
            updateSectionConfig(sectionId, {
                ...freshConfig,
                sectionBackgroundImage: imageUrl,
            });
        }
        setShowBackgroundImagePicker(false);
    };

    // Build background styles for view mode
    const getBackgroundStyles = (): React.CSSProperties => {
        const styles: React.CSSProperties = {};

        if (sectionBackgroundImage) {
            styles.backgroundImage = `url(${sectionBackgroundImage})`;
            styles.backgroundSize = 'cover';
            styles.backgroundPosition = 'center';
            styles.backgroundRepeat = 'no-repeat';

        }
        if (sectionBackground && sectionBackground !== "transparent") {
            // If both color and image, color acts as a fallback
            styles.backgroundColor = sectionBackground;
        }
        return styles;
    };

    if (!isEditMode) {
        // In view mode, render with elements overlay but no editing controls
        return (
            <div
                ref={sectionRef}
                className="relative"
                style={getBackgroundStyles()}
            >
                {children}
                {elements.length > 0 && (
                    <ElementOverlay
                        elements={elements}
                        sectionRef={sectionRef}
                        isEditMode={false}
                        onUpdateElement={() => { }}
                        onDeleteElement={() => { }}
                    />
                )}
            </div>
        );
    }

    const isSelected = selectedSectionId === section.id;

    const handleClick = (e: React.MouseEvent) => {
        // Only select if clicking the wrapper, not inner content
        if (e.target === e.currentTarget) {
            selectSection(sectionId || null);
        }
    };

    const handleDelete = () => {
        if (!sectionId) return;

        if (showDeleteConfirm) {
            onDelete(sectionId);
            setShowDeleteConfirm(false);
        } else {
            setShowDeleteConfirm(true);
            setTimeout(() => setShowDeleteConfirm(false), 3000);
        }
    };

    // Drag-to-resize state
    const [dragState, setDragState] = useState<{
        isDragging: boolean;
        handle: 'top' | 'bottom' | null;
        startY: number;
        startPadding: number;
    }>({
        isDragging: false,
        handle: null,
        startY: 0,
        startPadding: 0
    });

    // Handle global mouse move / up for resizing
    React.useEffect(() => {
        if (!dragState.isDragging || !dragState.handle || !sectionId) return;

        const handleMouseMove = (e: MouseEvent) => {
            const dy = e.clientY - dragState.startY;
            // If dragging top handle: moving down (positive dy) should DECREASE padding
            // If dragging bottom handle: moving down (positive dy) should INCREASE padding
            const paddingChange = dragState.handle === 'top' ? -dy : dy;

            let newPadding = Math.max(0, dragState.startPadding + paddingChange);

            // Apply step of 5px for easier alignment
            newPadding = Math.round(newPadding / 5) * 5;

            const updates: Partial<ExtendedSectionConfig> = {};
            if (dragState.handle === 'top') {
                updates.paddingTop = newPadding;
            } else {
                updates.paddingBottom = newPadding;
            }

            updateSectionConfig(sectionId, {
                ...currentConfig,
                ...updates
            });
        };

        const handleMouseUp = () => {
            setDragState({
                isDragging: false,
                handle: null,
                startY: 0,
                startPadding: 0
            });
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto'; // Re-enable selection
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState, sectionId, currentConfig, updateSectionConfig]);

    const startResize = (e: React.MouseEvent, handle: 'top' | 'bottom') => {
        e.stopPropagation();
        if (!sectionId) return;

        const currentPadding = handle === 'top'
            ? (currentConfig.paddingTop ?? 80) // Default 80px (py-20)
            : (currentConfig.paddingBottom ?? 80);

        setDragState({
            isDragging: true,
            handle,
            startY: e.clientY,
            startPadding: currentPadding
        });

        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none'; // Disable selection
    };

    return (
        <div
            ref={sectionRef}
            className={`relative transition-all ${isSelected
                ? "ring-2 ring-blue-500 ring-offset-2 z-[9999]"
                : isHovered
                    ? "ring-2 ring-blue-300/50 ring-offset-1 z-[9999]"
                    : "z-0"
                }`}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Section Background Image Overlay - sits above child backgrounds but below content */}
            {sectionBackgroundImage && (
                <div
                    className="absolute inset-0 z-[1] pointer-events-none"
                    style={{
                        backgroundImage: `url(${sectionBackgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            )}

            {/* Resize Handles - Visible when selected or hovered */}
            {(isSelected || isHovered) && (
                <>
                    {/* Top Handle */}
                    <div
                        className="absolute top-0 left-0 right-0 h-4 z-[101] cursor-ns-resize flex items-start justify-center group"
                        onMouseDown={(e) => startResize(e, 'top')}
                    >
                        {/* Visual indicator */}
                        <div className="w-24 h-5 -mt-2.5 bg-blue-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white cursor-ns-resize">
                            <div className="w-10 h-1 border-t-2 border-b-2 border-white/50" />
                        </div>
                        {/* Hover hint line */}
                        <div className="absolute top-0 w-full border-t-2 border-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Bottom Handle */}
                    <div
                        className="absolute bottom-0 left-0 right-0 h-4 z-[101] cursor-ns-resize flex items-end justify-center group"
                        onMouseDown={(e) => startResize(e, 'bottom')}
                    >
                        {/* Visual indicator */}
                        <div className="w-24 h-5 -mb-2.5 bg-blue-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white cursor-ns-resize">
                            <div className="w-10 h-1 border-t-2 border-b-2 border-white/50" />
                        </div>
                        {/* Hover hint line */}
                        <div className="absolute bottom-0 w-full border-b-2 border-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </>
            )}

            {/* Section Controls - Visible on hover or when selected */}
            <div
                className={`absolute top-2 left-2 md:top-4 md:left-4 z-[100] flex items-center gap-0.5 md:gap-1 bg-slate-900 shadow-lg rounded-lg p-1 md:p-1.5 transition-opacity duration-200 ${isHovered || isSelected ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                style={{ pointerEvents: isHovered || isSelected ? 'auto' : 'none' }}
            >
                {/* Section Type Label - hidden on mobile */}
                <span className="hidden md:inline-block px-2 py-1 text-xs font-medium text-white bg-slate-700 rounded">
                    {section.sectionType}
                </span>

                {/* Move Up */}
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

                {/* Move Down */}
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

                {/* Delete - 2-Step Confirmation */}
                <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                    className={`p-2 md:p-1.5 rounded transition-all touch-manipulation flex items-center gap-1 ${showDeleteConfirm
                        ? "bg-red-600 text-white shadow-lg ring-2 ring-red-400 ring-offset-2 ring-offset-slate-900 px-3 w-auto"
                        : "bg-red-500/20 hover:bg-red-500 active:bg-red-600 text-red-400 hover:text-white"
                        }`}
                    title={showDeleteConfirm ? "Click again to confirm" : "Delete Section"}
                >
                    {showDeleteConfirm ? (
                        <span className="text-xs font-bold whitespace-nowrap">Confirm?</span>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Section Toolbar - Edit Section button with add text/button options */}
            <SectionToolbar
                onAddElement={handleAddElement}
                onBackgroundChange={handleBackgroundChange}
                onOpenBackgroundImagePicker={openBackgroundImagePicker}
                currentBackground={sectionBackground}
                currentBackgroundImage={sectionBackgroundImage}
                isVisible={isEditMode && isHovered}
            />

            {/* Section Content */}
            {children}

            {/* Element Overlay - Renders all custom elements */}
            <ElementOverlay
                elements={elements}
                sectionRef={sectionRef}
                isEditMode={isEditMode}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
            />

            {/* Background Image Picker - rendered here to persist across hover states */}
            <AssetManager
                isOpen={showBackgroundImagePicker}
                onClose={() => setShowBackgroundImagePicker(false)}
                onSelect={handleBackgroundImageSelect}
                filterType="IMAGE"
            />
        </div>
    );
}
