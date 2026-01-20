import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useEditor } from "./EditorContext";
import type { SectionElement } from "./elementTypes";
import { COLOR_PRESETS, FONT_OPTIONS, FONT_SIZE_OPTIONS, FONT_WEIGHT_OPTIONS } from "./elementTypes";

interface ElementStylePanelProps {
    element: SectionElement;
    onUpdate: (updates: Partial<SectionElement>) => void;
    onDelete: () => void;
    onClose: () => void;
    anchorRect?: { top: number; left: number; right: number; bottom: number; width: number; height: number };
}

export function ElementStylePanel({ element, onUpdate, onDelete, onClose, anchorRect }: ElementStylePanelProps) {
    const { pages, siteDomain } = useEditor();
    const [activeTab, setActiveTab] = useState<"format" | "colors" | "button">("format");
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);
    const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
    const [showTextStrokeColorPicker, setShowTextStrokeColorPicker] = useState(false);
    const [position, setPosition] = useState<"right" | "left">("right");
    const [verticalPosition, setVerticalPosition] = useState<"top" | "bottom">("top");
    const [mounted, setMounted] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Link type state (internal vs external)
    const [linkType, setLinkType] = useState<"external" | "internal">("external");

    // Initialize link type
    useEffect(() => {
        if (element.href && siteDomain && element.href.includes(`/${siteDomain}/`)) {
            setLinkType("internal");
        }
    }, [element.href, siteDomain]);
    
    const panelWidth = 320;
    const panelGap = 12;

    const handleDelete = () => {
        if (showDeleteConfirm) {
            onDelete();
            setShowDeleteConfirm(false);
        } else {
            setShowDeleteConfirm(true);
            setTimeout(() => setShowDeleteConfirm(false), 3000);
        }
    };

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    
    useEffect(() => {
        if (anchorRect) {
            // Check if there's enough space on the right
            const spaceOnRight = window.innerWidth - anchorRect.right;
            const spaceOnLeft = anchorRect.left;
            
            if (spaceOnRight >= panelWidth + panelGap) {
                setPosition("right");
            } else if (spaceOnLeft >= panelWidth + panelGap) {
                setPosition("left");
            } else {
                setPosition("right");
            }

            // Check vertical space (approx panel height 450px)
            const spaceBelow = window.innerHeight - anchorRect.top;
            // If less than 500px due to keyboard/small screen, and we have space above, flip it
            if (spaceBelow < 500 && anchorRect.top > 500) {
                setVerticalPosition("bottom");
            } else {
                setVerticalPosition("top");
            }
        }
    }, [anchorRect]);
    
    // Calculate panel style based on anchor position
    const getPanelStyle = (): React.CSSProperties => {
        if (!anchorRect) {
            // Fallback: center of screen
            return {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            };
        }
        
        const top = Math.max(10, Math.min(anchorRect.top, window.innerHeight - 400));
        
        const style: React.CSSProperties = {
            position: "fixed",
        };

        // Horizontal Positioning
        if (position === "right") {
            style.left = `${anchorRect.right + panelGap}px`;
        } else {
            style.left = `${anchorRect.left - panelWidth - panelGap}px`;
        }

        // Vertical Positioning
        if (verticalPosition === "bottom") {
            // Align bottom of panel with top of element (or slightly above anchorRect.bottom to keep association?)
            // User requested "above the text". So align bottom of panel to top of element.
            style.bottom = `${window.innerHeight - anchorRect.top + panelGap}px`;
            style.maxHeight = `${anchorRect.top - 20}px`; // Constrain height to space above
        } else {
            // Default top alignment
            style.top = `${top}px`;
            style.maxHeight = `${window.innerHeight - top - 20}px`;
        }

        return style;
    };

    if (!mounted) return null;

    return createPortal(
        <div 
            data-style-panel="true" 
            className="z-[9999]"
            style={{ ...getPanelStyle(), width: `${panelWidth}px` }}
        >
            <div className="bg-slate-800 text-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-700 overflow-hidden max-h-[60vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 sticky top-0 bg-slate-800">
                    <span className="font-semibold text-sm">
                        {element.type === "text" ? "Edit Text" : "Edit Button"}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDelete}
                            className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                                showDeleteConfirm 
                                    ? "bg-red-600 text-white shadow-lg ring-2 ring-red-400 ring-offset-2 ring-offset-slate-800 px-3 w-auto" 
                                    : "text-red-400 hover:bg-red-500/20"
                            }`}
                            title={showDeleteConfirm ? "Click again to confirm" : "Delete"}
                        >
                            {showDeleteConfirm ? (
                                <span className="text-xs font-bold whitespace-nowrap">Confirm?</span>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => setActiveTab("format")}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                            activeTab === "format" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                        }`}
                    >
                        Format
                    </button>
                    <button
                        onClick={() => setActiveTab("colors")}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                            activeTab === "colors" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                        }`}
                    >
                        Colors
                    </button>
                    {element.type === "button" && (
                        <button
                            onClick={() => setActiveTab("button")}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                                activeTab === "button" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Button
                        </button>
                    )}
                </div>

                {/* Tab Content */}
                <div className="p-4">
                    {/* Format Tab */}
                    {activeTab === "format" && (
                        <div className="space-y-4">
                            {/* Font Family & Size */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Font</label>
                                    <select
                                        value={element.fontFamily}
                                        onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                    >
                                        {FONT_OPTIONS.map((font) => (
                                            <option key={font.value} value={font.value}>{font.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Size</label>
                                    <select
                                        value={element.fontSize}
                                        onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                    >
                                        {FONT_SIZE_OPTIONS.map((size) => (
                                            <option key={size} value={size}>{size}px</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Font Weight */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Weight</label>
                                <select
                                    value={element.fontWeight}
                                    onChange={(e) => onUpdate({ fontWeight: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    {FONT_WEIGHT_OPTIONS.map((w) => (
                                        <option key={w.value} value={w.value}>{w.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Style Buttons */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Style</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onUpdate({ fontWeight: element.fontWeight === "700" ? "400" : "700" })}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                                            element.fontWeight === "700" || element.fontWeight === "800"
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        }`}
                                    >
                                        B
                                    </button>
                                    <button
                                        onClick={() => onUpdate({ fontStyle: element.fontStyle === "italic" ? "normal" : "italic" })}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm italic transition-colors ${
                                            element.fontStyle === "italic"
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        }`}
                                    >
                                        I
                                    </button>
                                    <button
                                        onClick={() => onUpdate({ textDecoration: element.textDecoration === "underline" ? "none" : "underline" })}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm underline transition-colors ${
                                            element.textDecoration === "underline"
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        }`}
                                    >
                                        U
                                    </button>
                                    <button
                                        onClick={() => onUpdate({ textDecoration: element.textDecoration === "line-through" ? "none" : "line-through" })}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm line-through transition-colors ${
                                            element.textDecoration === "line-through"
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        }`}
                                    >
                                        S
                                    </button>
                                </div>
                            </div>

                            {/* Alignment */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Alignment</label>
                                <div className="flex gap-2">
                                    {(["left", "center", "right"] as const).map((align) => (
                                        <button
                                            key={align}
                                            onClick={() => onUpdate({ textAlign: align })}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                element.textAlign === align
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                            }`}
                                        >
                                            {align === "left" && (
                                                <svg className="w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
                                                </svg>
                                            )}
                                            {align === "center" && (
                                                <svg className="w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
                                                </svg>
                                            )}
                                            {align === "right" && (
                                                <svg className="w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Text Transform */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Transform</label>
                                <div className="flex gap-2">
                                    {(["none", "uppercase", "lowercase", "capitalize"] as const).map((transform) => (
                                        <button
                                            key={transform}
                                            onClick={() => onUpdate({ textTransform: transform })}
                                            className={`flex-1 px-2 py-2 rounded-lg text-xs transition-colors ${
                                                element.textTransform === transform
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                            }`}
                                        >
                                            {transform === "none" ? "Aa" : transform === "uppercase" ? "AA" : transform === "lowercase" ? "aa" : "Aa"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Colors Tab */}
                    {activeTab === "colors" && (
                        <div className="space-y-4">
                            {/* Text Color */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-2">Text Color</label>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="color"
                                        value={element.textColor}
                                        onChange={(e) => onUpdate({ textColor: e.target.value })}
                                        className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={element.textColor}
                                        onChange={(e) => onUpdate({ textColor: e.target.value })}
                                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm font-mono"
                                    />
                                    <button
                                        onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                                        className="px-2 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs transition-colors"
                                        title="Show presets"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                                        </svg>
                                    </button>
                                </div>
                                {showTextColorPicker && (
                                    <div className="grid grid-cols-7 gap-2 p-2 bg-slate-700 rounded-lg">
                                        {COLOR_PRESETS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => { onUpdate({ textColor: color }); setShowTextColorPicker(false); }}
                                                className="w-8 h-8 rounded-lg border-2 border-slate-500 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Background Color */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-2">Background</label>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="color"
                                        value={element.backgroundColor === "transparent" ? "#ffffff" : element.backgroundColor}
                                        onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                                        className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={element.backgroundColor}
                                        onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm font-mono"
                                    />
                                    <button
                                        onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                                        className="px-2 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs transition-colors"
                                        title="Show presets"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                                        </svg>
                                    </button>
                                </div>
                                {showBgColorPicker && (
                                    <div className="p-2 bg-slate-700 rounded-lg">
                                        <button
                                            onClick={() => { onUpdate({ backgroundColor: "transparent" }); setShowBgColorPicker(false); }}
                                            className="w-full px-3 py-2 mb-2 bg-slate-600 rounded-lg text-sm hover:bg-slate-500"
                                        >
                                            Transparent
                                        </button>
                                        <div className="grid grid-cols-7 gap-2">
                                            {COLOR_PRESETS.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => { onUpdate({ backgroundColor: color }); setShowBgColorPicker(false); }}
                                                    className="w-8 h-8 rounded-lg border-2 border-slate-500 hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Text Outline (Stroke) - Only for Text */}
                            {element.type === "text" && (
                                <div className="pt-4 border-t border-slate-700">
                                    <label className="block text-xs text-slate-400 mb-3 font-semibold">Text Outline</label>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {/* Outline Color */}
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Color</label>
                                            <div className="flex gap-1">
                                                <input
                                                    type="color"
                                                    value={element.textStrokeColor || "#000000"}
                                                    onChange={(e) => {
                                                        const updates: Partial<SectionElement> = { textStrokeColor: e.target.value };
                                                        if (!element.textStrokeWidth) {
                                                            updates.textStrokeWidth = 1;
                                                        }
                                                        onUpdate(updates);
                                                    }}
                                                    className="w-10 h-8 rounded border border-slate-600 cursor-pointer"
                                                />
                                                <button
                                                    onClick={() => setShowTextStrokeColorPicker(!showTextStrokeColorPicker)}
                                                    className="flex-1 h-8 rounded border border-slate-600 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 transition-colors"
                                                >
                                                    <div 
                                                        className="w-4 h-4 rounded-sm border border-slate-500"
                                                        style={{ backgroundColor: element.textStrokeColor || "#000" }}
                                                    />
                                                </button>
                                            </div>
                                                
                                                {showTextStrokeColorPicker && (
                                                    <div className="absolute top-full left-0 mt-2 p-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 w-48">
                                                        <div className="grid grid-cols-5 gap-1">
                                                            {COLOR_PRESETS.map((color) => (
                                                                <button
                                                                    key={color}
                                                                    onClick={() => { 
                                                                        const updates: Partial<SectionElement> = { textStrokeColor: color };
                                                                        // Auto-set width to 1 if it's 0
                                                                        if (!element.textStrokeWidth) {
                                                                            updates.textStrokeWidth = 1;
                                                                        }
                                                                        onUpdate(updates); 
                                                                        setShowTextStrokeColorPicker(false); 
                                                                    }}
                                                                    className="w-6 h-6 rounded border border-slate-600 hover:scale-110 transition-transform"
                                                                    style={{ backgroundColor: color }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                        
                                        {/* Outline Width */}
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">
                                                Width: {element.textStrokeWidth ?? 0}px
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="5"
                                                value={element.textStrokeWidth ?? 0}
                                                onChange={(e) => onUpdate({ textStrokeWidth: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Border Options (Box Border) */}
                            <div className="pt-4 border-t border-slate-700">
                                <label className="block text-xs text-slate-400 mb-3 font-semibold">Box Border</label>
                                
                                {/* Border Color & Width */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="block text-[10px] text-slate-500 mb-1">Color</label>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowBorderColorPicker(!showBorderColorPicker)}
                                                className="w-full h-8 rounded border border-slate-600 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 transition-colors"
                                            >
                                                <div 
                                                    className="w-4 h-4 rounded-sm border border-slate-500"
                                                    style={{ backgroundColor: element.borderColor || "transparent" }}
                                                />
                                                <span className="text-xs text-slate-300">
                                                    {element.borderColor === "transparent" || !element.borderColor ? "None" : ""}
                                                </span>
                                            </button>
                                            
                                            {showBorderColorPicker && (
                                                <div className="absolute top-full left-0 mt-2 p-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 w-48">
                                                    <button
                                                        onClick={() => { onUpdate({ borderColor: "transparent" }); setShowBorderColorPicker(false); }}
                                                        className="w-full px-3 py-1.5 mb-2 bg-slate-700 rounded text-xs hover:bg-slate-600"
                                                    >
                                                        No Border
                                                    </button>
                                                    <div className="grid grid-cols-5 gap-1">
                                                        {COLOR_PRESETS.map((color) => (
                                                            <button
                                                                key={color}
                                                                onClick={() => { 
                                                                    // Auto-set border width to 2 if it's 0 so user sees the change
                                                                    const updates: Partial<SectionElement> = { borderColor: color };
                                                                    if (!element.borderWidth) {
                                                                        updates.borderWidth = 2;
                                                                    }
                                                                    onUpdate(updates); 
                                                                    setShowBorderColorPicker(false); 
                                                                }}
                                                                className="w-6 h-6 rounded border border-slate-600 hover:scale-110 transition-transform"
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] text-slate-500 mb-1">
                                            Width: {element.borderWidth || 0}px
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10"
                                            value={element.borderWidth || 0}
                                            onChange={(e) => onUpdate({ borderWidth: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
                                        />
                                    </div>
                                </div>

                                {/* Border Radius */}
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">
                                        Radius: {element.borderRadius || 0}px
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={element.borderRadius || 0}
                                        onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Button Tab */}
                    {activeTab === "button" && element.type === "button" && (
                        <div className="space-y-4">
                            {/* Link URL */}
                            {/* Link URL */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Link Destination</label>
                                
                                {/* Link Type Toggle */}
                                <div className="flex bg-slate-700 p-1 rounded-lg mb-2">
                                    <button
                                        onClick={() => setLinkType("internal")}
                                        className={`flex-1 py-1 text-xs rounded-md transition-colors ${
                                            linkType === "internal" ? "bg-slate-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                                        }`}
                                    >
                                        Page
                                    </button>
                                    <button
                                        onClick={() => setLinkType("external")}
                                        className={`flex-1 py-1 text-xs rounded-md transition-colors ${
                                            linkType === "external" ? "bg-slate-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                                        }`}
                                    >
                                        Custom URL
                                    </button>
                                </div>

                                {linkType === "internal" ? (
                                    <select
                                        value={element.href?.split('/').pop() || ""} // Try to extract slug
                                        onChange={(e) => {
                                            const slug = e.target.value;
                                            if (slug && siteDomain) {
                                                onUpdate({ href: `/${siteDomain}/${slug}` });
                                            }
                                        }}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select a page...</option>
                                        {pages.map(page => (
                                            <option key={page.id} value={page.slug}>
                                                {page.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={element.href || ""}
                                        onChange={(e) => onUpdate({ href: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </div>

                            {/* Padding */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">
                                        Padding X: {element.paddingX || 0}px
                                    </label>
                                    <input
                                        type="range"
                                        min="4"
                                        max="64"
                                        value={element.paddingX || 24}
                                        onChange={(e) => onUpdate({ paddingX: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">
                                        Padding Y: {element.paddingY || 0}px
                                    </label>
                                    <input
                                        type="range"
                                        min="4"
                                        max="32"
                                        value={element.paddingY || 12}
                                        onChange={(e) => onUpdate({ paddingY: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Border Radius */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    Corner Radius: {element.borderRadius ?? 8}px
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={element.borderRadius ?? 8}
                                    onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Open in New Tab */}
                            <div className="mt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={element.newTab || false}
                                        onChange={(e) => onUpdate({ newTab: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                                    />
                                    <span className="text-sm text-slate-300">Open in new tab</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
