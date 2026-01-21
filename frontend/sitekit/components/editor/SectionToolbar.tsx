"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { createDefaultTextElement, createDefaultButtonElement, createDefaultImageElement, COLOR_PRESETS } from "./elementTypes";
import type { SectionElement } from "./elementTypes";
import { AssetManager } from "./AssetManager";
import type { AssetDTO } from "@/api";

interface SectionToolbarProps {
    onAddElement: (element: SectionElement) => void;
    onAddShape?: () => void;
    onBackgroundChange?: (color: string) => void;
    onOpenBackgroundImagePicker?: () => void;
    currentBackground?: string;
    currentBackgroundImage?: string;

    isVisible: boolean;
}

export function SectionToolbar({
    onAddElement,
    onAddShape,
    onBackgroundChange,
    onOpenBackgroundImagePicker,
    currentBackground,
    currentBackgroundImage,

    isVisible
}: SectionToolbarProps) {
    const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAssetManager, setShowAssetManager] = useState(false);
    
    // Ref for the toggle button to calculate position
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    // Calculate position when opening
    React.useLayoutEffect(() => {
        if (isExpanded && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Position: below the button (rect.bottom), aligned to right (rect.right)
            // Note: Menu width is ~220px, so we subtract that from rect.right to align right edge
            setMenuPosition({
                top: rect.bottom + window.scrollY + 8, // 8px gap
                left: rect.right + window.scrollX - 220 
            });
        }
    }, [isExpanded]);

    // Close on click outside
    React.useEffect(() => {
        if (!isExpanded) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (buttonRef.current && buttonRef.current.contains(e.target as Node)) return;
            // Check if click is inside the portal menu (we'll attach a ref or class)
            if ((e.target as Element).closest('[data-portal-menu]')) return;
            setIsExpanded(false);
        };
        window.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);


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

    const handleAssetSelect = (asset: AssetDTO) => {
        // Create an image element from the selected asset
        let imageUrl = "";
        if (asset.fileData && asset.mimeType) {
            imageUrl = `data:${asset.mimeType};base64,${asset.fileData}`;
        } else if (asset.url) {
            imageUrl = asset.url;
        }

        if (imageUrl) {
            const imageElement = createDefaultImageElement(50, 50, imageUrl);
            onAddElement(imageElement);
        }
        setShowAssetManager(false);
        setIsExpanded(false);
    };

    return (
        <>
            {/* Toolbar UI - only visible when isVisible is true */}
            {isVisible && (
                <div className="absolute top-2 right-2 z-[100]">
                    {/* Main Toggle Button */}
                    <button
                        ref={buttonRef}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-all ${isExpanded
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                            } border border-slate-200 dark:border-slate-700`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>

                    {/* Expanded Menu - Rendered in Portal */}
                    {isExpanded && createPortal(
                        <div 
                            data-portal-menu="true"
                            className="fixed z-[99999] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[220px]"
                            style={{
                                top: menuPosition.top,
                                left: menuPosition.left,
                                width: '220px'
                            }}
                        >
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

                            {/* Add Asset (Image) */}
                            <button
                                onClick={() => {
                                    setShowAssetManager(true);
                                    setIsExpanded(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-t border-slate-100 dark:border-slate-700"
                            >
                                <span className="text-xl">🖼️</span>
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-white text-sm">Add Asset</div>
                                    <div className="text-xs text-slate-500">Add image from assets</div>
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

                            {/* Background Image */}
                            <button
                                onClick={() => {
                                    if (onOpenBackgroundImagePicker) {
                                        onOpenBackgroundImagePicker();
                                    }
                                    setIsExpanded(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-t border-slate-100 dark:border-slate-700"
                            >
                                <span className="text-xl">🖼️</span>
                                <div className="flex-1">
                                    <div className="font-medium text-slate-900 dark:text-white text-sm">Background Image</div>
                                    <div className="text-xs text-slate-500">Set section background</div>
                                </div>
                                {currentBackgroundImage && (
                                    <div
                                        className="w-6 h-6 rounded border-2 border-slate-300 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${currentBackgroundImage})` }}
                                    />
                                )}
                            </button>

                            {/* Change Background Color */}
                            <button
                                onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-t border-slate-100 dark:border-slate-700"
                            >
                                <span className="text-xl">🎨</span>
                                <div className="flex-1">
                                    <div className="font-medium text-slate-900 dark:text-white text-sm">Background Color</div>
                                    <div className="text-xs text-slate-500">Change section color</div>
                                </div>
                                {currentBackground && currentBackground !== "transparent" && (
                                    <div
                                        className="w-6 h-6 rounded-full border-2 border-slate-300"
                                        style={{ backgroundColor: currentBackground }}
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
                                                className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${currentBackground === color
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
                                        Remove Background Color
                                    </button>
                                    
                                    {/* Separate Remove Background Image button if image exists */}
                                    {currentBackgroundImage && (
                                        <button
                                            onClick={() => {
                                                if (onBackgroundChange) onBackgroundChange("remove-image");
                                                setShowBackgroundPicker(false);
                                            }}
                                            className="w-full mt-2 px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                                        >
                                            Remove Background Image
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>,
                        document.body
                    )}
                </div>
            )}

            {/* Asset Manager Modal - Always rendered so it persists when hovering away */}
            <AssetManager
                isOpen={showAssetManager}
                onClose={() => setShowAssetManager(false)}
                onSelect={handleAssetSelect}
                filterType="IMAGE"
            />
        </>
    );
}
