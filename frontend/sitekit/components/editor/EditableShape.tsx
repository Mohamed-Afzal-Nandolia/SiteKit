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
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, shapeX: 0, shapeY: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, centerX: 0, centerY: 0 });
    
    // Local state for smooth dragging/resizing (only update parent on mouse up)
    const [localPosition, setLocalPosition] = useState({ x: shape.x, y: shape.y });
    const [localSize, setLocalSize] = useState({ width: shape.width, height: shape.height });
    
    const shapeRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync local state when shape prop changes
    useEffect(() => {
        if (!isDragging && !isResizing) {
            setLocalPosition({ x: shape.x, y: shape.y });
            setLocalSize({ width: shape.width, height: shape.height });
        }
    }, [shape.x, shape.y, shape.width, shape.height, isDragging, isResizing]);

    const handleClick = (e: React.MouseEvent) => {
        if (isEditMode && !isDragging && !isResizing) {
            e.stopPropagation();
            setIsSelected(true);
        }
    };

    // Mouse down on shape body (for dragging)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isEditMode || !isSelected) return;
        
        e.stopPropagation();
        e.preventDefault();
        
        const container = shapeRef.current?.parentElement;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        setIsDragging(true);
        setDragStart({
            x: e.clientX,
            y: e.clientY,
            shapeX: shape.x,
            shapeY: shape.y
        });
    };

    // Mouse down on resize handle
    const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
        if (!isEditMode) return;
        
        e.stopPropagation();
        e.preventDefault();
        
        setIsResizing(true);
        setResizeHandle(handle);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: shape.width,
            height: shape.height,
            centerX: shape.x,
            centerY: shape.y
        });
    };

    // Mouse move (handle both drag and resize)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const container = shapeRef.current?.parentElement;
            if (!container) return;
            const rect = container.getBoundingClientRect();

            if (isDragging) {
                const deltaX = e.clientX - dragStart.x;
                const deltaY = e.clientY - dragStart.y;
                
                // Convert pixel delta to percentage
                const deltaXPercent = (deltaX / rect.width) * 100;
                const deltaYPercent = (deltaY / rect.height) * 100;
                
                const newX = Math.max(0, Math.min(100, dragStart.shapeX + deltaXPercent));
                const newY = Math.max(0, Math.min(100, dragStart.shapeY + deltaYPercent));
                
                // Update local state only (no parent re-render)
                setLocalPosition({ x: newX, y: newY });
            } else if (isResizing && resizeHandle) {
                const deltaX = e.clientX - resizeStart.x;
                const deltaY = e.clientY - resizeStart.y;
                
                let newWidth = resizeStart.width;
                let newHeight = resizeStart.height;
                
                // Calculate new dimensions based on resize handle
                if (resizeHandle.includes('e')) {
                    newWidth = Math.max(50, resizeStart.width + deltaX * 2);
                }
                if (resizeHandle.includes('w')) {
                    newWidth = Math.max(50, resizeStart.width - deltaX * 2);
                }
                if (resizeHandle.includes('s')) {
                    newHeight = Math.max(50, resizeStart.height + deltaY * 2);
                }
                if (resizeHandle.includes('n')) {
                    newHeight = Math.max(50, resizeStart.height - deltaY * 2);
                }
                
                // For circle, keep width and height equal
                if (shape.type === 'circle') {
                    const avgSize = (newWidth + newHeight) / 2;
                    newWidth = avgSize;
                    newHeight = avgSize;
                }
                
                // Update local state only (no parent re-render)
                setLocalSize({ 
                    width: Math.round(newWidth), 
                    height: Math.round(newHeight)
                });
            }
        };

        const handleMouseUp = () => {
            // On mouse up, update parent with final values
            if (isDragging) {
                onUpdate({ x: localPosition.x, y: localPosition.y });
            }
            if (isResizing) {
                onUpdate({ width: localSize.width, height: localSize.height });
            }
            
            setIsDragging(false);
            setIsResizing(false);
            setResizeHandle(null);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, dragStart, resizeStart, shape, onUpdate, resizeHandle, localPosition, localSize]);

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

    const shapeStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${localPosition.x}%`,
        top: `${localPosition.y}%`,
        transform: 'translate(-50%, -50%)',
        width: `${localSize.width}px`,
        height: `${localSize.height}px`,
        backgroundColor: shape.color,
        opacity: shape.opacity,
        filter: shape.blur > 0 ? `blur(${shape.blur}px)` : 'none',
        borderRadius: `${shape.borderRadius ?? 0}px`,
        zIndex: isEditMode ? (isSelected ? 50 : 10) : shape.zIndex,
        pointerEvents: isEditMode ? 'auto' : 'none',
        cursor: isDragging ? 'grabbing' : (isSelected ? 'grab' : 'pointer'),
        transition: isDragging || isResizing ? 'none' : 'all 0.15s ease-out',
    };

    if (!isEditMode) {
        return (
            <div
                style={shapeStyle}
            />
        );
    }

    return (
        <>
            <div
                ref={shapeRef}
                className={`${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${isEditMode && !isSelected ? 'hover:ring-2 hover:ring-blue-400/50' : ''} transition-all`}
                style={shapeStyle}
                onClick={handleClick}
                onMouseDown={handleMouseDown}
            >
                {/* Resize Handles - only show when selected */}
                {isSelected && (
                    <>
                        {/* Corner handles */}
                        <div
                            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                            className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize hover:scale-125 transition-transform"
                            style={{ pointerEvents: 'auto' }}
                        />
                        <div
                            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                            className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize hover:scale-125 transition-transform"
                            style={{ pointerEvents: 'auto' }}
                        />
                        <div
                            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                            className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize hover:scale-125 transition-transform"
                            style={{ pointerEvents: 'auto' }}
                        />
                        <div
                            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                            className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize hover:scale-125 transition-transform"
                            style={{ pointerEvents: 'auto' }}
                        />
                        
                        {/* Edge handles */}
                        <div
                            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
                            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-n-resize hover:scale-125 transition-transform"
                            style={{ pointerEvents: 'auto' }}
                        />
                        <div
                            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-s-resize hover:scale-125 transition-transform"
                            style={{ pointerEvents: 'auto' }}
                        />
                        <div
                            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
                            className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-w-resize hover:scale-125 transition-transform"
                            style={{ pointerEvents: 'auto' }}
                        />
                        <div
                            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
                            className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-e-resize hover:scale-125 transition-transform"
                            style={{ pointerEvents: 'auto' }}
                        />
                    </>
                )}
            </div>
            
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
                <div className="text-xs text-slate-400 bg-slate-700/50 p-2 rounded">
                    💡 Tip: Drag to move • Drag corners to resize
                </div>

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

                {/* Border Radius */}
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Corner Radius: {shape.borderRadius ?? 0}px</label>
                    <input
                        type="range"
                        min="0"
                        max="500"
                        value={shape.borderRadius ?? 0}
                        onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value) })}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">X Position: {shape.x.toFixed(1)}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={shape.x}
                            onChange={(e) => onUpdate({ x: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Y Position: {shape.y.toFixed(1)}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={shape.y}
                            onChange={(e) => onUpdate({ y: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
