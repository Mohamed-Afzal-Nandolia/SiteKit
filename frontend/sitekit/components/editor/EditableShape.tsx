"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditor } from "./EditorContext";
import type { DecorativeShape } from "./shapeTypes";

interface EditableShapeProps {
    shape: DecorativeShape;
    onUpdate: (updates: Partial<DecorativeShape>) => void;
    onDelete: () => void;
}

export function EditableShape({ shape, onUpdate, onDelete }: EditableShapeProps) {
    const { isEditMode } = useEditor();
    const [isSelected, setIsSelected] = useState(false);
    const shapeRef = useRef<HTMLDivElement>(null);

    const handleClick = (e: React.MouseEvent) => {
        if (isEditMode) {
            e.stopPropagation();
            setIsSelected(true);
        }
    };

    // Click outside to deselect
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (shapeRef.current && shapeRef.current.contains(target)) return;
            if (target.closest('[data-shape-panel="true"]')) return;
            setIsSelected(false);
        };

        if (isSelected) {
            setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 100);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isSelected]);

    // Get shape-specific styles
    const getShapeClass = () => {
        switch (shape.type) {
            case 'circle':
                return 'rounded-full';
            case 'rounded-rectangle':
                return 'rounded-3xl';
            case 'rectangle':
            default:
                return '';
        }
    };

    const shapeStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${shape.x}%`,
        top: `${shape.y}%`,
        transform: 'translate(-50%, -50%)', // Center on position
        width: `${shape.width}px`,
        height: `${shape.height}px`,
        backgroundColor: shape.color,
        opacity: shape.opacity,
        filter: shape.blur > 0 ? `blur(${shape.blur}px)` : 'none',
        zIndex: isEditMode ? (isSelected ? 50 : 10) : shape.zIndex,
        pointerEvents: isEditMode ? 'auto' : 'none',
    };

    if (!isEditMode) {
        return (
            <div
                className={getShapeClass()}
                style={shapeStyle}
            />
        );
    }

    return (
        <>
            <div
                ref={shapeRef}
                className={`${getShapeClass()} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${isEditMode ? 'hover:ring-2 hover:ring-blue-400/50' : ''} cursor-pointer transition-all`}
                style={shapeStyle}
                onClick={handleClick}
            />
            {isSelected && (
                <ShapePropertiesPanel
                    shape={shape}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onClose={() => setIsSelected(false)}
                />
            )}
        </>
    );
}

// Simple inline properties panel for shapes
interface ShapePropertiesPanelProps {
    shape: DecorativeShape;
    onUpdate: (updates: Partial<DecorativeShape>) => void;
    onDelete: () => void;
    onClose: () => void;
}

function ShapePropertiesPanel({ shape, onUpdate, onDelete, onClose }: ShapePropertiesPanelProps) {
    return (
        <div
            data-shape-panel="true"
            className="fixed top-20 right-4 w-80 bg-slate-800 text-white rounded-2xl shadow-2xl border border-slate-700 z-[9999] max-h-[80vh] overflow-y-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 sticky top-0 bg-slate-800">
                <span className="font-semibold text-sm">Edit Shape</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onDelete}
                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete Shape"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
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

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Shape Type */}
                <div>
                    <label className="block text-xs text-slate-400 mb-2">Shape Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['circle', 'rectangle', 'rounded-rectangle'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => onUpdate({ type })}
                                className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                                    shape.type === type
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                {type === 'circle' ? '●' : type === 'rectangle' ? '▭' : '▢'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Size */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Width: {shape.width}px</label>
                        <input
                            type="range"
                            min="50"
                            max="1000"
                            value={shape.width}
                            onChange={(e) => onUpdate({ width: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Height: {shape.height}px</label>
                        <input
                            type="range"
                            min="50"
                            max="1000"
                            value={shape.height}
                            onChange={(e) => onUpdate({ height: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>

                {/* Color */}
                <div>
                    <label className="block text-xs text-slate-400 mb-2">Color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={shape.color}
                            onChange={(e) => onUpdate({ color: e.target.value })}
                            className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={shape.color}
                            onChange={(e) => onUpdate({ color: e.target.value })}
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm font-mono"
                        />
                    </div>
                </div>

                {/* Opacity */}
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Opacity: {Math.round(shape.opacity * 100)}%</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={shape.opacity * 100}
                        onChange={(e) => onUpdate({ opacity: parseInt(e.target.value) / 100 })}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Blur */}
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Blur: {shape.blur}px</label>
                    <input
                        type="range"
                        min="0"
                        max="200"
                        value={shape.blur}
                        onChange={(e) => onUpdate({ blur: parseInt(e.target.value) })}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">X Position: {shape.x}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={shape.x}
                            onChange={(e) => onUpdate({ x: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Y Position: {shape.y}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={shape.y}
                            onChange={(e) => onUpdate({ y: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
