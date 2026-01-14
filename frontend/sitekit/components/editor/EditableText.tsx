"use client";

import React, { useRef, useState, useEffect, KeyboardEvent } from "react";
import { useEditor } from "./EditorContext";

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
}

export function EditableText({
    value,
    onUpdate,
    as: Component = "span",
    className = "",
    placeholder = "Click to edit...",
    multiline = false,
}: EditableTextProps) {
    const { isEditMode } = useEditor();
    const elementRef = useRef<HTMLElement>(null);
    const [isEditing, setIsEditing] = useState(false);
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
    const handleClick = () => {
        if (isEditMode && !isEditing) {
            setIsEditing(true);
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
    };

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
            <Component className={className}>
                {value || placeholder}
            </Component>
        );
    }

    // Edit mode styles
    const editModeClass = `
        ${className}
        ${isEditing ? "outline outline-2 outline-blue-500 outline-offset-2 rounded" : ""}
        ${!isEditing ? "hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400/50 hover:outline-offset-2 hover:rounded cursor-text" : ""}
        transition-all duration-150
    `.trim().replace(/\s+/g, " ");

    // Use dangerouslySetInnerHTML for initial render, then let DOM handle edits
    // This prevents React from resetting cursor position on re-renders
    return (
        <Component
            ref={elementRef as React.RefObject<any>}
            className={editModeClass}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onClick={handleClick}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{ minWidth: "20px", display: "inline-block" }}
            dangerouslySetInnerHTML={{ __html: value || placeholder }}
        />
    );
}

// Helper component for editable links/buttons
interface EditableLinkProps {
    label: string;
    href: string;
    onUpdate: (newLabel: string, newHref: string) => void;
    className?: string;
    as?: "a" | "button";
}

export function EditableLink({
    label,
    href,
    onUpdate,
    className = "",
    as: Component = "a",
}: EditableLinkProps) {
    const { isEditMode } = useEditor();
    const [isEditingHref, setIsEditingHref] = useState(false);
    const [localHref, setLocalHref] = useState(href);

    useEffect(() => {
        setLocalHref(href);
    }, [href]);

    const handleLabelUpdate = (newLabel: string) => {
        onUpdate(newLabel, localHref);
    };

    // In edit mode, clicking should not navigate
    const handleClick = (e: React.MouseEvent) => {
        if (isEditMode) {
            e.preventDefault();
        }
    };

    // Show href editor popup on right-click in edit mode
    const handleContextMenu = (e: React.MouseEvent) => {
        if (isEditMode) {
            e.preventDefault();
            const newHref = window.prompt("Edit link URL:", localHref);
            if (newHref !== null) {
                setLocalHref(newHref);
                onUpdate(label, newHref);
            }
        }
    };

    if (!isEditMode) {
        return Component === "a" ? (
            <a href={href} className={className}>
                {label}
            </a>
        ) : (
            <button className={className}>{label}</button>
        );
    }

    return (
        <span
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            className="relative group"
        >
            <EditableText
                value={label}
                onUpdate={handleLabelUpdate}
                className={className}
            />
            {/* URL indicator on hover in edit mode */}
            <span className="absolute -bottom-6 left-0 text-xs bg-slate-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                🔗 Right-click to edit URL
            </span>
        </span>
    );
}
