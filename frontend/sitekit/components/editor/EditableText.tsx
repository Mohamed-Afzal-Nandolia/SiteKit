"use client";

import React, { useRef, useState, useEffect, KeyboardEvent } from "react";
import { useEditor } from "./EditorContext";
import { ElementStylePanel } from "./ElementStylePanel";
import type { SectionElement } from "./elementTypes";

interface EditableTextProps {
    // The text value to display/edit
    value: string;
    // Callback when text is updated
    onUpdate: (newValue: string) => void;
    // Element type to render (default: span)
    as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";
    // Additional className
    className?: string;
    // Placeholder text when empty
    placeholder?: string;
    // Allow multiline editing (for p, div)
    multiline?: boolean;
    // CSS styles
    styles?: React.CSSProperties;
    // Callback when styles are updated
    onStyleUpdate?: (newStyles: React.CSSProperties) => void;
    // Element ID (optional, used for selection tracking if needed)
    id?: string;
}

export function EditableText({
    value,
    onUpdate,
    as: Component = "span",
    className = "",
    placeholder = "Click to edit...",
    multiline = false,
    styles = {},
    onStyleUpdate,
    id = "editable-text",
}: EditableTextProps) {
    const { isEditMode } = useEditor();
    const elementRef = useRef<HTMLElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [anchorRect, setAnchorRect] = useState<{ top: number; left: number; right: number; bottom: number; width: number; height: number } | undefined>(undefined);
    // Track if we've initialized the content
    const isInitialized = useRef(false);

    // Set initial content only once when entering edit mode or on mount
    useEffect(() => {
        if (elementRef.current && !isInitialized.current) {
            elementRef.current.innerText = value || placeholder;
            isInitialized.current = true;
        }
    }, [value, placeholder]);

    // Update content when value changes from parent (but not during editing)
    useEffect(() => {
        if (elementRef.current && !isEditing) {
            elementRef.current.innerText = value || placeholder;
        }
    }, [value, placeholder, isEditing]);

    // Handle entering edit mode
    const handleClick = (e: React.MouseEvent) => {
        if (!isEditMode) return;
        
        e.stopPropagation();
        
        if (!isEditing && !isSelected) {
            setIsSelected(true);
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (isEditMode && !isEditing) {
            e.stopPropagation();
            setIsEditing(true);
            setIsSelected(true);
            // Focus the element after state update
            setTimeout(() => {
                if (elementRef.current) {
                    elementRef.current.focus();
                    // Move cursor to end instead of selecting all
                    const range = document.createRange();
                    const selection = window.getSelection();
                    range.selectNodeContents(elementRef.current);
                    range.collapse(false); // false = collapse to end
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                }
            }, 0);
        }
    }

    // Handle click outside to deselect
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            
            // Check if click is inside the element
            if (elementRef.current && elementRef.current.contains(target)) {
                return; 
            }
            
            // Check if click is inside the style panel
            if (target.closest('[data-style-panel="true"]')) {
                return;
            }
            
            setIsSelected(false);
            if (isEditing) {
                // Blur handling is done in onBlur
                setIsEditing(false); // Force close edit on outside click if blur didn't catch it
                if (elementRef.current) elementRef.current.blur();
            }
        };

        if (isSelected) {
             // Add listener with slight delay to avoid immediate trigger
            const timeoutId = setTimeout(() => {
                document.addEventListener("mousedown", handleClickOutside);
            }, 100);
            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [isSelected, isEditing]);

    // Use JSON string for dependency to avoid loop from new object references
    const stylesJSON = JSON.stringify(styles);

    // Update anchor rect
    useEffect(() => {
        if (isSelected && elementRef.current) {
            const updateRect = () => {
                const rect = elementRef.current?.getBoundingClientRect();
                if (rect) {
                    setAnchorRect((prev) => {
                        // Only update if values substantially changed (ignore sub-pixel/jitter)
                        if (prev && 
                            Math.abs(prev.top - rect.top) < 0.5 &&
                            Math.abs(prev.left - rect.left) < 0.5 &&
                            Math.abs(prev.width - rect.width) < 0.5 &&
                            Math.abs(prev.height - rect.height) < 0.5
                        ) {
                            return prev;
                        }
                        return {
                            top: rect.top,
                            left: rect.left,
                            right: rect.right,
                            bottom: rect.bottom,
                            width: rect.width,
                            height: rect.height
                        };
                    });
                }
            };
            updateRect();
            window.addEventListener('scroll', updateRect, true);
            window.addEventListener('resize', updateRect);
            return () => {
                window.removeEventListener('scroll', updateRect, true);
                window.removeEventListener('resize', updateRect);
            };
        }
    }, [isSelected, stylesJSON]); // Re-calc when styles change (content change uses JSON)

    // Handle blur - save changes
    const handleBlur = () => {
        setIsEditing(false);
        if (elementRef.current) {
            const newText = elementRef.current.innerText;
            if (newText !== value) {
                onUpdate(newText);
            }
        }
    };

    // Helper to map style updates back
    const handleStyleUpdate = (updates: Partial<SectionElement>) => {
        if (!onStyleUpdate) return;
        
        // Map SectionElement properties back to React.CSSProperties
        const newStyles: any = { ...styles };

        if (updates.textColor) newStyles.color = updates.textColor;
        if (updates.backgroundColor) newStyles.backgroundColor = updates.backgroundColor;
        if (updates.fontSize) newStyles.fontSize = `${updates.fontSize}px`;
        if (updates.fontWeight) newStyles.fontWeight = updates.fontWeight;
        if (updates.fontStyle) newStyles.fontStyle = updates.fontStyle;
        if (updates.textDecoration) newStyles.textDecoration = updates.textDecoration;
        if (updates.textAlign) newStyles.textAlign = updates.textAlign;
        if (updates.fontFamily) newStyles.fontFamily = updates.fontFamily;
        if (updates.textTransform) newStyles.textTransform = updates.textTransform;
        
        // Text stroke/shadow
        if (updates.textStrokeColor || updates.textStrokeWidth !== undefined) {
             const strokeColor = updates.textStrokeColor !== undefined ? updates.textStrokeColor : (styles as any).textStrokeColor;
             const strokeWidth = updates.textStrokeWidth !== undefined ? updates.textStrokeWidth : (styles as any).textStrokeWidth;
             
             // Persist these as custom props if possible, or just calculate shadow
             newStyles.textStrokeColor = strokeColor;
             newStyles.textStrokeWidth = strokeWidth;

             if (strokeWidth > 0 && strokeColor) {
                 newStyles.textShadow = Array.from({ length: 8 }, (_, i) => {
                    const angle = (i * 45) * (Math.PI / 180);
                    const x = Math.round(Math.cos(angle) * (strokeWidth || 1));
                    const y = Math.round(Math.sin(angle) * (strokeWidth || 1));
                    return `${x}px ${y}px 0 ${strokeColor}`;
                 }).join(", ");
             } else {
                 newStyles.textShadow = "none";
             }
        }

        // Border
        if (updates.borderColor) newStyles.borderColor = updates.borderColor;
        if (updates.borderWidth !== undefined) newStyles.borderWidth = `${updates.borderWidth}px`;
        if (updates.borderRadius !== undefined) newStyles.borderRadius = `${updates.borderRadius}px`;
        if (updates.borderColor || updates.borderWidth) newStyles.borderStyle = "solid";

        onStyleUpdate(newStyles);
    };

    // Construct ephemeral element for panel
    const ephemeralElement: SectionElement = {
        id: id,
        type: "text",
        content: value,
        x: 0, 
        y: 0,
        // Map styles to element props
        textColor: (styles?.color as string) || "#000000",
        backgroundColor: (styles?.backgroundColor as string) || "transparent",
        fontSize: parseInt((styles?.fontSize as string) || "16"),
        fontWeight: (styles?.fontWeight as string) || "400",
        fontStyle: (styles?.fontStyle as any) || "normal",
        textDecoration: (styles?.textDecoration as any) || "none",
        textAlign: (styles?.textAlign as any) || "left",
        fontFamily: (styles?.fontFamily as string) || "Inter",
        textTransform: (styles?.textTransform as any) || "none",
        borderWidth: parseInt((styles?.borderWidth as string) || "0"),
        borderColor: (styles?.borderColor as string) || "transparent",
        borderRadius: parseInt((styles?.borderRadius as string) || "0"),
        textStrokeColor: (styles as any)?.textStrokeColor,
        textStrokeWidth: (styles as any)?.textStrokeWidth,
        // Ensure all required props are present
        lineHeight: (styles?.lineHeight as any) || 1.6,
        letterSpacing: (styles?.letterSpacing as any) || 0,
        paddingX: 0,
        paddingY: 0,
    };

    // Handle keyboard events
    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Escape") {
            // Cancel editing, restore original value
            if (elementRef.current) {
                elementRef.current.innerText = value;
            }
            setIsEditing(false);
            elementRef.current?.blur();
        } else if (e.key === "Enter" && !multiline) {
            // Save on Enter for single-line fields
            e.preventDefault();
            elementRef.current?.blur();
        }
    };

    // If not in edit mode, render normally
    if (!isEditMode) {
        return (
            <Component className={className} style={styles}>
                {value || placeholder}
            </Component>
        );
    }

    // Edit mode styles
    const editModeClass = `
        ${className}
        ${isEditing ? "outline outline-2 outline-blue-500 outline-offset-2 rounded" : ""}
        ${!isEditing ? "hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400/50 hover:outline-offset-2 hover:rounded cursor-text" : ""}
        ${isSelected && !isEditing ? "ring-2 ring-blue-500 ring-offset-2" : ""}
        transition-all duration-150
    `.trim().replace(/\s+/g, " ");

    // Use dangerouslySetInnerHTML for initial render, then let DOM handle edits
    // This prevents React from resetting cursor position on re-renders
    return (
        <>
            <Component
                ref={elementRef as React.RefObject<any>}
                className={editModeClass}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                style={{ ...styles, minWidth: "20px", display: "inline-block" }}
                dangerouslySetInnerHTML={{ __html: value || placeholder }}
            />
            {isSelected && !isEditing && onStyleUpdate && (
                <ElementStylePanel 
                    element={ephemeralElement}
                    onUpdate={handleStyleUpdate}
                    onDelete={() => {}} // No delete for native elements
                    onClose={() => setIsSelected(false)}
                    anchorRect={anchorRect}
                />
            )}
        </>
    );
}

// Helper component for editable links/buttons
interface EditableLinkProps {
    label: string;
    href: string;
    onUpdate: (newLabel: string, newHref: string) => void;
    className?: string;
    as?: "a" | "button";
    styles?: React.CSSProperties;
    onStyleUpdate?: (newStyles: React.CSSProperties) => void;
}

export function EditableLink({
    label,
    href,
    onUpdate,
    className = "",
    as: Component = "a",
    styles = {},
    onStyleUpdate,
}: EditableLinkProps) {
    const { isEditMode } = useEditor();
    const [isEditingHref, setIsEditingHref] = useState(false);
    const [localHref, setLocalHref] = useState(href);
    const [isEditingText, setIsEditingText] = useState(false);
    const [localLabel, setLocalLabel] = useState(label);
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        setLocalHref(href);
    }, [href]);

    useEffect(() => {
        setLocalLabel(label);
    }, [label]);

    const handleLabelUpdate = (newLabel: string) => {
        onUpdate(newLabel, localHref);
    };

    // Show href editor popup on right-click in edit mode
    const handleContextMenu = (e: React.MouseEvent) => {
        if (isEditMode) {
            e.preventDefault();
            const newHref = window.prompt("Edit link URL:", localHref);
            if (newHref !== null) {
                setLocalHref(newHref);
                onUpdate(localLabel, newHref);
            }
        }
    };

    if (!isEditMode) {
        return Component === "a" ? (
            <a href={href} className={className} style={styles}>
                {label}
            </a>
        ) : (
            <button className={className} style={styles}>{label}</button>
        );
    }
    
    // For EditableLink in edit mode, we want the WRAPPER to handle styles/selection like a button
    
    const [isSelected, setIsSelected] = useState(false);
    const elementRef = useRef<HTMLElement>(null);
    const [anchorRect, setAnchorRect] = useState<any>(undefined);

    const handleClick = (e: React.MouseEvent) => {
        if (isEditMode && !isEditingText) {
            e.preventDefault();
            e.stopPropagation();
            setIsSelected(true);
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (isEditMode) {
            e.preventDefault();
            e.stopPropagation();
            setIsEditingText(true);
            setIsSelected(false);
            setTimeout(() => {
                if (textRef.current) {
                    textRef.current.focus();
                    const range = document.createRange();
                    const selection = window.getSelection();
                    range.selectNodeContents(textRef.current);
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                }
            }, 0);
        }
    };

    const handleTextBlur = () => {
        setIsEditingText(false);
        if (textRef.current) {
            const newText = textRef.current.innerText;
            if (newText !== localLabel) {
                setLocalLabel(newText);
                onUpdate(newText, localHref);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            textRef.current?.blur();
        } else if (e.key === "Escape") {
            if (textRef.current) {
                textRef.current.innerText = localLabel;
            }
            setIsEditingText(false);
            textRef.current?.blur();
        }
    };
    
    const handleStyleUpdate = (updates: Partial<SectionElement>) => {
        if (!onStyleUpdate) return;
        
        const newStyles: any = { ...styles };
        
        // Button Props Mapping
        if (updates.backgroundColor) newStyles.backgroundColor = updates.backgroundColor;
        if (updates.textColor) newStyles.color = updates.textColor;
        if (updates.fontSize) newStyles.fontSize = `${updates.fontSize}px`;
        if (updates.fontWeight) newStyles.fontWeight = updates.fontWeight;
        if (updates.borderRadius !== undefined) newStyles.borderRadius = `${updates.borderRadius}px`;
        if (updates.paddingX !== undefined) {
             newStyles.paddingLeft = `${updates.paddingX}px`;
             newStyles.paddingRight = `${updates.paddingX}px`;
        }
        if (updates.paddingY !== undefined) {
             newStyles.paddingTop = `${updates.paddingY}px`;
             newStyles.paddingBottom = `${updates.paddingY}px`;
        }
        if (updates.borderColor) newStyles.borderColor = updates.borderColor;
        if (updates.borderWidth !== undefined) newStyles.borderWidth = `${updates.borderWidth}px`;
        if (updates.borderColor || updates.borderWidth) newStyles.borderStyle = "solid";

        onStyleUpdate(newStyles);
    };

    // Ephemeral button element
    const ephemeralElement: SectionElement = {
        id: "link-btn",
        type: "button",
        content: localLabel,
        x: 0, y: 0,
        href: href,
        backgroundColor: (styles?.backgroundColor as string) || "transparent",
        textColor: (styles?.color as string) || "inherit",
        fontSize: parseInt((styles?.fontSize as string) || "16"),
        fontWeight: (styles?.fontWeight as string) || "400",
        borderRadius: parseInt((styles?.borderRadius as string) || "0"),
        paddingX: parseInt((styles?.paddingLeft as string) || "0"),
        paddingY: parseInt((styles?.paddingTop as string) || "0"),
        borderWidth: parseInt((styles?.borderWidth as string) || "0"),
        borderColor: (styles?.borderColor as string) || "transparent",
        // Default text styles for button
        fontFamily: (styles?.fontFamily as string) || "Inter",
        fontStyle: (styles?.fontStyle as any) || "normal",
        textDecoration: (styles?.textDecoration as any) || "none",
        textAlign: "center",
        textTransform: (styles?.textTransform as any) || "none",
        lineHeight: 1.5,
        letterSpacing: 0,
    };

    // Click outside logic 
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
             const target = e.target as HTMLElement;
             if (elementRef.current && elementRef.current.contains(target)) return;
             if (target.closest('[data-style-panel="true"]')) return;
             setIsSelected(false);
        };
        if (isSelected && !isEditingText) {
            setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 100);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isSelected, isEditingText]);
    
    // Anchor update
    useEffect(() => {
        if (isSelected && elementRef.current) {
             const rect = elementRef.current.getBoundingClientRect();
             setAnchorRect((prev: any) => {
                 if (prev && 
                     Math.abs(prev.top - rect.top) < 0.5 &&
                     Math.abs(prev.left - rect.left) < 0.5 &&
                     Math.abs(prev.width - rect.width) < 0.5 &&
                     Math.abs(prev.height - rect.height) < 0.5
                 ) {
                     return prev;
                 }
                 return rect;
             });
        }
    }, [isSelected, JSON.stringify(styles)]);

    // Separate text styles from layout/wrapper styles
    const textStyles: React.CSSProperties = {
        color: styles?.color,
        fontSize: styles?.fontSize,
        fontWeight: styles?.fontWeight,
        fontFamily: styles?.fontFamily,
        fontStyle: styles?.fontStyle,
        textDecoration: styles?.textDecoration,
        textTransform: styles?.textTransform,
        letterSpacing: styles?.letterSpacing,
        lineHeight: styles?.lineHeight,
    };

    const wrapperStyles: React.CSSProperties = {
        backgroundColor: styles?.backgroundColor,
        padding: styles?.padding,
        paddingLeft: styles?.paddingLeft,
        paddingRight: styles?.paddingRight,
        paddingTop: styles?.paddingTop,
        paddingBottom: styles?.paddingBottom,
        borderRadius: styles?.borderRadius,
        borderWidth: styles?.borderWidth,
        borderColor: styles?.borderColor,
        borderStyle: styles?.borderStyle,
        margin: styles?.margin,
        display: 'inline-block',
    };

    return (
        <span
            ref={elementRef as any}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            className={`relative group ${isSelected && !isEditingText ? "ring-2 ring-blue-500 ring-offset-2 rounded" : ""} ${isEditMode && !isEditingText ? "hover:ring-2 hover:ring-blue-400/50 hover:ring-offset-1 rounded" : ""} ${isEditingText ? "ring-2 ring-blue-500 ring-offset-2 rounded" : ""}`}
            style={wrapperStyles} 
        >
            <span 
                ref={textRef}
                contentEditable={isEditingText}
                suppressContentEditableWarning={true}
                onBlur={handleTextBlur}
                onKeyDown={handleKeyDown}
                className={className}
                style={{ 
                    ...textStyles,
                    pointerEvents: isEditingText ? 'auto' : 'none', 
                    display: 'inline-block',
                    outline: 'none',
                    cursor: 'pointer'
                }}
            >
                {localLabel}
            </span>
            {/* URL indicator on hover in edit mode */}
            {!isEditingText && (
                <span className="absolute -bottom-6 left-0 text-xs bg-slate-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                    🔗 Right-click to edit URL | Double-click to edit text
                </span>
            )}

            {isSelected && !isEditingText && onStyleUpdate && (
                <ElementStylePanel 
                    element={ephemeralElement}
                    onUpdate={handleStyleUpdate}
                    onDelete={() => {}} 
                    onClose={() => setIsSelected(false)}
                    anchorRect={anchorRect}
                />
            )}
        </span>
    );
}
