"use client";

import React, { useState, useRef, useEffect } from "react";
import type { SectionElement } from "./elementTypes";
import { ElementStylePanel } from "./ElementStylePanel";

interface DraggableElementProps {
    element: SectionElement;
    sectionRef: React.RefObject<HTMLElement | null>;
    isEditMode: boolean;
    onUpdate: (elementId: string, updates: Partial<SectionElement>) => void;
    onDelete: (elementId: string) => void;
}

export function DraggableElement({
    element,
    sectionRef,
    isEditMode,
    onUpdate,
    onDelete,
}: DraggableElementProps) {
    const [isSelected, setIsSelected] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });

    // Handle content editing
    const handleContentBlur = () => {
        setIsEditing(false);
        if (contentRef.current) {
            const newContent = contentRef.current.innerText;
            if (newContent !== element.content) {
                onUpdate(element.id, { content: newContent });
            }
        }
    };

    // Start dragging
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isEditMode || isEditing) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        dragStartPos.current = {
            x: clientX,
            y: clientY,
            elementX: element.x,
            elementY: element.y,
        };
        
        setIsDragging(true);
        setIsSelected(true);
    };

    // Handle dragging
    useEffect(() => {
        if (!isDragging || !sectionRef.current) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            
            const sectionRect = sectionRef.current!.getBoundingClientRect();
            
            // Calculate delta as percentage of section size
            const deltaX = ((clientX - dragStartPos.current.x) / sectionRect.width) * 100;
            const deltaY = ((clientY - dragStartPos.current.y) / sectionRect.height) * 100;
            
            // Calculate new position
            let newX = dragStartPos.current.elementX + deltaX;
            let newY = dragStartPos.current.elementY + deltaY;
            
            // Clamp to section bounds (with some padding)
            newX = Math.max(5, Math.min(95, newX));
            newY = Math.max(5, Math.min(95, newY));
            
            onUpdate(element.id, { x: newX, y: newY });
        };

        const handleEnd = () => {
            setIsDragging(false);
        };

        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleEnd);
        document.addEventListener("touchmove", handleMove, { passive: false });
        document.addEventListener("touchend", handleEnd);

        return () => {
            document.removeEventListener("mousemove", handleMove);
            document.removeEventListener("mouseup", handleEnd);
            document.removeEventListener("touchmove", handleMove);
            document.removeEventListener("touchend", handleEnd);
        };
    }, [isDragging, element.id, onUpdate, sectionRef]);

    // Handle click outside to deselect
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            
            // Check if click is inside the element
            if (elementRef.current && elementRef.current.contains(target)) {
                return; // Don't close if clicking the element itself
            }
            
            // Check if click is inside the style panel (has data-style-panel attribute or is inside one)
            if (target.closest('[data-style-panel="true"]')) {
                return; // Don't close if clicking the style panel
            }
            
            setIsSelected(false);
            setIsEditing(false);
        };

        if (isSelected) {
            // Use setTimeout to avoid the initial click triggering this
            const timeoutId = setTimeout(() => {
                document.addEventListener("mousedown", handleClickOutside);
            }, 100);
            
            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSelected]);

    // Element styles
    const elementStyles: React.CSSProperties = {
        position: "absolute",
        left: `${element.x}%`,
        top: `${element.y}%`,
        transform: "translate(-50%, -50%)",
        fontFamily: element.fontFamily,
        fontSize: `${element.fontSize}px`,
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle,
        textDecoration: element.textDecoration,
        color: element.textColor,
        backgroundColor: element.backgroundColor,
        textAlign: element.textAlign,
        lineHeight: element.lineHeight,
        letterSpacing: `${element.letterSpacing}px`,
        textTransform: element.textTransform,
        cursor: isEditMode 
            ? (isDragging ? "grabbing" : "grab") 
            : (element.type === "button" ? "pointer" : "default"),
        userSelect: isEditMode ? (isEditing ? "text" : "none") : "auto",
        zIndex: isSelected ? 100 : 60,
        boxShadow: isEditMode ? "0 2px 10px rgba(0,0,0,0.1)" : "none",
        // Button-specific styles
        ...(element.type === "button" && {
            borderRadius: `${element.borderRadius || 8}px`,
            paddingLeft: `${element.paddingX || 24}px`,
            paddingRight: `${element.paddingX || 24}px`,
            paddingTop: `${element.paddingY || 12}px`,
            paddingBottom: `${element.paddingY || 12}px`,
            borderWidth: `${element.borderWidth || 0}px`,
            borderStyle: "solid",
            borderColor: element.borderColor || "transparent",
            display: "inline-block",
        }),
        // Text-specific styles
        ...(element.type === "text" && {
            padding: "8px 16px",
            minWidth: "100px",
            borderRadius: `${element.borderRadius !== undefined ? element.borderRadius : 4}px`,
            borderWidth: `${element.borderWidth || 0}px`,
            borderStyle: "solid",
            borderColor: element.borderColor || "transparent",
            // Use text-shadow to simulate text stroke as it's more widely supported than -webkit-text-stroke
            // Default to the previous black outline if no stroke color is set, OR if user explicitly sets it
            textShadow: element.textStrokeWidth 
                ? Array.from({ length: 8 }, (_, i) => {
                    const angle = (i * 45) * (Math.PI / 180);
                    const x = Math.round(Math.cos(angle) * (element.textStrokeWidth || 1));
                    const y = Math.round(Math.sin(angle) * (element.textStrokeWidth || 1));
                    return `${x}px ${y}px 0 ${element.textStrokeColor || "#000"}`;
                  }).join(", ")
                : (element.textStrokeColor ? `1px 1px 0 ${element.textStrokeColor}, -1px -1px 0 ${element.textStrokeColor}, 1px -1px 0 ${element.textStrokeColor}, -1px 1px 0 ${element.textStrokeColor}` : "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000"),
        }),
    };

    // Handle element click
    const handleClick = (e: React.MouseEvent) => {
        if (!isEditMode) {
            // In view mode, buttons should navigate
            if (element.type === "button" && element.href) {
                window.location.href = element.href;
            }
            return;
        }
        
        e.stopPropagation();
        if (!isDragging) {
            setIsSelected(true);
        }
    };

    // Handle double-click to edit content
    const handleDoubleClick = (e: React.MouseEvent) => {
        if (!isEditMode) return;
        e.stopPropagation();
        setIsEditing(true);
        setTimeout(() => {
            if (contentRef.current) {
                contentRef.current.focus();
                // Select all text
                const range = document.createRange();
                range.selectNodeContents(contentRef.current);
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
        }, 0);
    };

    // State for panel positioning
    const [anchorRect, setAnchorRect] = useState<{ top: number; left: number; right: number; bottom: number; width: number; height: number } | undefined>(undefined);

    // Update anchor rect when selected or moved
    useEffect(() => {
        if (isSelected && elementRef.current) {
            const updateRect = () => {
                const rect = elementRef.current?.getBoundingClientRect();
                if (rect) {
                    setAnchorRect({
                        top: rect.top,
                        left: rect.left,
                        right: rect.right,
                        bottom: rect.bottom,
                        width: rect.width,
                        height: rect.height
                    });
                }
            };

            updateRect();
            // Update on scroll or resize just in case
            window.addEventListener('scroll', updateRect, true);
            window.addEventListener('resize', updateRect);
            
            return () => {
                window.removeEventListener('scroll', updateRect, true);
                window.removeEventListener('resize', updateRect);
            };
        }
    }, [isSelected, element.x, element.y, element.content, element.fontSize, element.paddingX, element.paddingY]); // Re-calculate when position/size changes

    return (
        <>
            <div
                ref={elementRef}
                style={elementStyles}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                className={`transition-shadow ${
                    isEditMode && isSelected 
                        ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg" 
                        : isEditMode 
                            ? "hover:ring-2 hover:ring-blue-400/50 hover:ring-offset-1" 
                            : ""
                }`}
            >
                <div
                    ref={contentRef}
                    contentEditable={isEditMode && isEditing}
                    suppressContentEditableWarning
                    onBlur={handleContentBlur}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            setIsEditing(false);
                            contentRef.current?.blur();
                        }
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            setIsEditing(false);
                            contentRef.current?.blur();
                        }
                    }}
                    className="outline-none whitespace-nowrap"
                >
                    {element.content}
                </div>
            </div>

            {/* Style Panel */}
            {isEditMode && isSelected && !isDragging && (
                <ElementStylePanel
                    element={element}
                    onUpdate={(updates) => onUpdate(element.id, updates)}
                    onDelete={() => onDelete(element.id)}
                    onClose={() => setIsSelected(false)}
                    anchorRect={anchorRect}
                />
            )}
        </>
    );
}

// Element Overlay - Container for all elements in a section
interface ElementOverlayProps {
    elements: SectionElement[];
    sectionRef: React.RefObject<HTMLElement | null>;
    isEditMode: boolean;
    onUpdateElement: (elementId: string, updates: Partial<SectionElement>) => void;
    onDeleteElement: (elementId: string) => void;
}

export function ElementOverlay({
    elements,
    sectionRef,
    isEditMode,
    onUpdateElement,
    onDeleteElement,
}: ElementOverlayProps) {
    if (!elements || elements.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 50 }}>
            {elements.map((element) => (
                <div key={element.id} className="pointer-events-auto">
                    <DraggableElement
                        element={element}
                        sectionRef={sectionRef}
                        isEditMode={isEditMode}
                        onUpdate={onUpdateElement}
                        onDelete={onDeleteElement}
                    />
                </div>
            ))}
        </div>
    );
}
