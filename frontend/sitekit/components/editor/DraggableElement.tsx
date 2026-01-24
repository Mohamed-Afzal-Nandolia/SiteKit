"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import type { SectionElement } from "./elementTypes";
import { ElementStylePanel } from "./ElementStylePanel";
import { useEditor } from "./EditorContext";

interface DraggableElementProps {
    element: SectionElement;
    sectionRef: React.RefObject<HTMLElement | null>;
    isEditMode: boolean;
    onUpdate: (elementId: string, updates: Partial<SectionElement>) => void;
    onDelete: (elementId: string) => void;
    isFirst?: boolean;
    otherElements?: SectionElement[];
}

export function DraggableElement({
    element,
    sectionRef,
    isEditMode,
    onUpdate,
    onDelete,
    isFirst = false,
    otherElements = [],
}: DraggableElementProps) {
    const { viewMode } = useEditor();

    // Compute responsive element (merge desktop + mobile overrides)
    const responsiveElement = useMemo(() => {
        // Use true mobile status from viewport, or explicit viewMode if we bring it back
        if (viewMode === "mobile") {
            const mobile = element.mobile || {};
            const merged = { ...element, ...mobile };

            // Auto-scale font size for mobile if not explicitly overridden
            if (!mobile.fontSize && element.fontSize) {
                // Smarter scaling: Large text needs to scale down MORE to fit mobile width
                if (element.fontSize > 32) {
                    // Large headings: 45% scale
                    merged.fontSize = Math.max(20, Math.round(element.fontSize * 0.45));
                } else if (element.fontSize > 20) {
                    // Medium text: 60% scale
                    merged.fontSize = Math.max(16, Math.round(element.fontSize * 0.6));
                } else {
                    // Small text: 80% scale (keep readable)
                    merged.fontSize = Math.max(12, Math.round(element.fontSize * 0.8));
                }
            }
            // Auto-scale padding if not overridden (buttons)
            if (element.type === "button") {
                if (!mobile.paddingX && element.paddingX) merged.paddingX = Math.max(8, Math.round(element.paddingX * 0.6));
                if (!mobile.paddingY && element.paddingY) merged.paddingY = Math.max(6, Math.round(element.paddingY * 0.6));
                // Ensure buttons fit on screen width
                merged.maxWidth = "85vw";
            }

            // Ensure text doesn't overflow
            if (element.type === "text") {
                merged.maxWidth = "85vw";
            }

            return merged;
        }
        return element;
    }, [element, viewMode]);

    // Intercept updates to handle mobile overrides
    const handleUpdate = (id: string, updates: Partial<SectionElement>) => {
        if (viewMode === "mobile") {
            const mobileUpdates: any = {};
            const globalUpdates: any = {};

            // Separate updates
            Object.entries(updates).forEach(([key, value]) => {
                // Properties that should always be global/shared
                if (["content", "href", "src", "type", "id", "newTab", "fileType", "fileName"].includes(key)) {
                    globalUpdates[key] = value;
                } else {
                    mobileUpdates[key] = value;
                }
            });

            const finalUpdates: any = { ...globalUpdates };

            if (Object.keys(mobileUpdates).length > 0) {
                finalUpdates.mobile = {
                    ...(element.mobile || {}),
                    ...mobileUpdates
                };
            }

            onUpdate(id, finalUpdates);
        } else {
            onUpdate(id, updates);
        }
    };

    const [isSelected, setIsSelected] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null>(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });
    const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, width: 0, height: 0 });
    const rotateStartRef = useRef({ mouseX: 0, mouseY: 0, startRotation: 0, centerX: 0, centerY: 0 });

    // Guides state: store the specific % position to draw the line at, or null if hidden
    const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

    // Fix: Stale closure in debounce logic
    // We must track the latest handleUpdate function to avoid using an old one captured in the debounce closure
    const handleUpdateRef = useRef(handleUpdate);
    useEffect(() => {
        handleUpdateRef.current = handleUpdate;
    });

    const [localContent, setLocalContent] = useState(responsiveElement.content || "");

    // Sync local content when prop changes
    useEffect(() => {
        setLocalContent(responsiveElement.content || "");
    }, [responsiveElement.content]);

    // Debounced update function
    const debouncedUpdateRef = useRef<((content: string) => void) | null>(null);

    useEffect(() => {
        const handler = (content: string) => {
            if (content !== responsiveElement.content) {
                // Use the ref to get the latest handleUpdate that has the fresh closure over elements/config
                handleUpdateRef.current(responsiveElement.id, { content });
            }
        };
        // Simple debounce implementation
        let timeout: NodeJS.Timeout;
        debouncedUpdateRef.current = (content: string) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => handler(content), 500);
        };
        return () => clearTimeout(timeout);
    }, [responsiveElement.id, responsiveElement.content]);

    // Restore content when entering edit mode
    useEffect(() => {
        if (isEditing && contentRef.current) {
            // We use innerText to match the input handler's behavior
            contentRef.current.innerText = localContent;

            // Focus and place cursor at end
            contentRef.current.focus();
            try {
                const range = document.createRange();
                range.selectNodeContents(contentRef.current);
                range.collapse(false);
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
            } catch (e) {
                // Ignore selection errors
            }
        }
    }, [isEditing]);


    // Handle content editing
    const handleContentBlur = () => {
        // Delay disabling edit mode slightly to ensure other events (like clicks) fire
        setIsEditing(false);
        if (contentRef.current) {
            const newContent = contentRef.current.innerText;
            setLocalContent(newContent); // Optimistic update

            // Immediate update on blur
            if (newContent !== responsiveElement.content) {
                // handleUpdate is safe here as it's from current scope
                handleUpdate(responsiveElement.id, { content: newContent });
            }
        }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const newText = e.currentTarget.innerText;
        setLocalContent(newText); // Update local state immediately

        if (debouncedUpdateRef.current) {
            debouncedUpdateRef.current(newText);
        }
    };

    // Start dragging
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isEditMode || isEditing || isResizing) return;

        e.preventDefault();
        e.stopPropagation();

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        dragStartPos.current = {
            x: clientX,
            y: clientY,
            elementX: responsiveElement.x,
            elementY: responsiveElement.y,
        };

        setIsDragging(true);
        setIsSelected(true);
        setGuides({ x: null, y: null });
    };

    // Start resizing (for image elements)
    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w') => {
        if (!isEditMode || responsiveElement.type !== 'image') return;

        e.preventDefault();
        e.stopPropagation();

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        resizeStartRef.current = {
            mouseX: clientX,
            mouseY: clientY,
            width: responsiveElement.width || 30,
            height: responsiveElement.height || 40,
        };

        setResizeHandle(handle);
        setIsResizing(true);
        setIsSelected(true);
    };

    // Start rotating (for image elements)
    const handleRotateStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isEditMode || responsiveElement.type !== 'image' || !elementRef.current) return;

        e.preventDefault();
        e.stopPropagation();

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        // Get element center
        const rect = elementRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        rotateStartRef.current = {
            mouseX: clientX,
            mouseY: clientY,
            startRotation: responsiveElement.rotation || 0,
            centerX,
            centerY,
        };

        setIsRotating(true);
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

            // Snap to center logic & neighbors
            const SNAP_THRESHOLD = 1.5; // 1.5% threshold
            let snapX: number | null = null;
            let snapY: number | null = null;

            // --- X Axis Snapping (Vertical Lines) ---
            // 1. Center of section
            if (Math.abs(newX - 50) < SNAP_THRESHOLD) {
                newX = 50;
                snapX = 50;
            }
            // 2. Center of other elements
            else {
                // Find closest neighbor
                for (const neighbor of otherElements) {
                    if (Math.abs(newX - neighbor.x) < SNAP_THRESHOLD) {
                        newX = neighbor.x;
                        snapX = neighbor.x;
                        break; // Found one, snap and stop (prevent jitter between multiple close targets)
                    }
                }
            }

            // --- Y Axis Snapping (Horizontal Lines) ---
            // 1. Center of section
            if (Math.abs(newY - 50) < SNAP_THRESHOLD) {
                newY = 50;
                snapY = 50;
            }
            // 2. Center of other elements
            else {
                for (const neighbor of otherElements) {
                    if (Math.abs(newY - neighbor.y) < SNAP_THRESHOLD) {
                        newY = neighbor.y;
                        snapY = neighbor.y;
                        break;
                    }
                }
            }

            // --- Grid Snapping (12 Cols) ---
            const colWidth = 100 / 12;
            if (snapX === null) {
                const closestCol = Math.round(newX / colWidth);
                const gridX = closestCol * colWidth;
                if (Math.abs(newX - gridX) < SNAP_THRESHOLD) {
                    newX = gridX;
                    snapX = gridX;
                }
            }

            // --- Row Snapping (25%) ---
            if (snapY === null) {
                const closestRow = Math.round(newY / 25);
                const gridY = closestRow * 25;
                if (Math.abs(newY - gridY) < SNAP_THRESHOLD) {
                    newY = gridY;
                    snapY = gridY;
                }
            }

            // Clamp to section bounds (with some padding)
            newX = Math.max(5, Math.min(95, newX));
            newY = Math.max(5, Math.min(95, newY));

            setGuides({ x: snapX, y: snapY });
            handleUpdate(responsiveElement.id, { x: newX, y: newY });
        };

        const handleEnd = () => {
            setIsDragging(false);
            setGuides({ x: null, y: null });
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
    }, [isDragging, responsiveElement.id, handleUpdate, sectionRef]);

    // Handle resizing
    useEffect(() => {
        if (!isResizing || !sectionRef.current || !resizeHandle) return;

        const handleResizeMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const sectionRect = sectionRef.current!.getBoundingClientRect();

            // Calculate delta as percentage of section size
            const deltaX = ((clientX - resizeStartRef.current.mouseX) / sectionRect.width) * 100;
            const deltaY = ((clientY - resizeStartRef.current.mouseY) / sectionRect.height) * 100;

            let newWidth = resizeStartRef.current.width;
            let newHeight = resizeStartRef.current.height;

            // Adjust based on which handle is being dragged
            // Corner handles (proportional resize)
            if (resizeHandle === 'se') {
                newWidth = resizeStartRef.current.width + deltaX;
                newHeight = resizeStartRef.current.height + deltaY;
            } else if (resizeHandle === 'sw') {
                newWidth = resizeStartRef.current.width - deltaX;
                newHeight = resizeStartRef.current.height + deltaY;
            } else if (resizeHandle === 'ne') {
                newWidth = resizeStartRef.current.width + deltaX;
                newHeight = resizeStartRef.current.height - deltaY;
            } else if (resizeHandle === 'nw') {
                newWidth = resizeStartRef.current.width - deltaX;
                newHeight = resizeStartRef.current.height - deltaY;
            }
            // Edge handles (stretch in one direction only)
            else if (resizeHandle === 'n') {
                newHeight = resizeStartRef.current.height - deltaY;
            } else if (resizeHandle === 's') {
                newHeight = resizeStartRef.current.height + deltaY;
            } else if (resizeHandle === 'e') {
                newWidth = resizeStartRef.current.width + deltaX;
            } else if (resizeHandle === 'w') {
                newWidth = resizeStartRef.current.width - deltaX;
            }

            // Clamp dimensions to reasonable bounds
            newWidth = Math.max(5, Math.min(100, newWidth));
            newHeight = Math.max(5, Math.min(100, newHeight));

            handleUpdate(responsiveElement.id, { width: newWidth, height: newHeight });
        };

        const handleResizeEnd = () => {
            setIsResizing(false);
            setResizeHandle(null);
        };

        document.addEventListener("mousemove", handleResizeMove);
        document.addEventListener("mouseup", handleResizeEnd);
        document.addEventListener("touchmove", handleResizeMove, { passive: false });
        document.addEventListener("touchend", handleResizeEnd);

        return () => {
            document.removeEventListener("mousemove", handleResizeMove);
            document.removeEventListener("mouseup", handleResizeEnd);
            document.removeEventListener("touchmove", handleResizeMove);
            document.removeEventListener("touchend", handleResizeEnd);
        };
    }, [isResizing, resizeHandle, responsiveElement.id, handleUpdate, sectionRef]);

    // Handle rotation
    useEffect(() => {
        if (!isRotating) return;

        const handleRotateMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const { centerX, centerY, startRotation } = rotateStartRef.current;

            // Calculate angle from center to current mouse position
            const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
            // Calculate angle from center to initial mouse position
            const startAngle = Math.atan2(
                rotateStartRef.current.mouseY - centerY,
                rotateStartRef.current.mouseX - centerX
            ) * (180 / Math.PI);

            // Calculate rotation delta
            let newRotation = startRotation + (angle - startAngle);

            // Normalize to 0-360
            newRotation = ((newRotation % 360) + 360) % 360;

            // Snap to 15 degree increments when close
            const snapAngle = Math.round(newRotation / 15) * 15;
            if (Math.abs(newRotation - snapAngle) < 5) {
                newRotation = snapAngle;
            }

            handleUpdate(responsiveElement.id, { rotation: newRotation });
        };

        const handleRotateEnd = () => {
            setIsRotating(false);
        };

        document.addEventListener("mousemove", handleRotateMove);
        document.addEventListener("mouseup", handleRotateEnd);
        document.addEventListener("touchmove", handleRotateMove, { passive: false });
        document.addEventListener("touchend", handleRotateEnd);

        return () => {
            document.removeEventListener("mousemove", handleRotateMove);
            document.removeEventListener("mouseup", handleRotateEnd);
            document.removeEventListener("touchmove", handleRotateMove);
            document.removeEventListener("touchend", handleRotateEnd);
        };
    }, [isRotating, responsiveElement.id, handleUpdate]);

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

            // Check if click is inside Asset Manager (portal)
            if (target.closest('[data-asset-manager="true"]')) {
                return; // Don't close if interacting with asset manager
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
    }, [isSelected, responsiveElement.x, responsiveElement.y, responsiveElement.content, responsiveElement.fontSize, responsiveElement.paddingX, responsiveElement.paddingY]); // Re-calculate when position/size changes

    // Element styles
    const rotation = responsiveElement.type === 'image' ? (responsiveElement.rotation || 0) : 0;
    const elementStyles: React.CSSProperties = {
        position: "absolute",
        left: `${responsiveElement.x}%`,
        top: `${responsiveElement.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(var(--element-scale, 1))`,
        transformOrigin: "center center",
        maxWidth: "100%",
        fontFamily: responsiveElement.fontFamily,
        fontSize: `${responsiveElement.fontSize}px`,
        fontWeight: responsiveElement.fontWeight,
        fontStyle: responsiveElement.fontStyle,
        textDecoration: responsiveElement.textDecoration,
        color: responsiveElement.textColor,
        backgroundColor: responsiveElement.backgroundColor,
        textAlign: responsiveElement.textAlign,
        lineHeight: responsiveElement.lineHeight,
        letterSpacing: `${responsiveElement.letterSpacing}px`,
        textTransform: responsiveElement.textTransform,
        cursor: isEditMode
            ? (isDragging ? "grabbing" : "grab")
            : (responsiveElement.type === "button" ? "pointer" : "default"),
        userSelect: isEditMode ? (isEditing ? "text" : "none") : "auto",
        zIndex: isSelected ? 100 : 60,
        boxShadow: isEditMode ? "0 2px 10px rgba(0,0,0,0.1)" : "none",
        // Button-specific styles
        ...(responsiveElement.type === "button" && {
            borderRadius: `${responsiveElement.borderRadius || 8}px`,
            paddingLeft: `${responsiveElement.paddingX || 24}px`,
            paddingRight: `${responsiveElement.paddingX || 24}px`,
            paddingTop: `${responsiveElement.paddingY || 12}px`,
            paddingBottom: `${responsiveElement.paddingY || 12}px`,
            borderWidth: `${responsiveElement.borderWidth || 0}px`,
            borderStyle: "solid",
            borderColor: responsiveElement.borderColor || "transparent",
            display: "inline-block",
        }),
        // Text-specific styles
        ...(responsiveElement.type === "text" && {
            padding: "4px 8px", // Reduced padding
            minWidth: "auto",   // Remove fixed minimum width to fit short text
            // Use fit-content to wrap nicely but allow growth
            width: "fit-content",
            maxWidth: "100%",
            borderRadius: `${responsiveElement.borderRadius !== undefined ? responsiveElement.borderRadius : 4}px`,
            borderWidth: `${responsiveElement.borderWidth || 0}px`,
            borderStyle: "solid",
            borderColor: responsiveElement.borderColor || "transparent",
            // Ensure long text wraps only if it exceeds max-width
            wordBreak: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
            // Use text-shadow to simulate text stroke as it's more widely supported than -webkit-text-stroke
            // Default to the previous black outline if no stroke color is set, OR if user explicitly sets it
            textShadow: responsiveElement.textStrokeWidth
                ? Array.from({ length: 8 }, (_, i) => {
                    const angle = (i * 45) * (Math.PI / 180);
                    const x = Math.round(Math.cos(angle) * (responsiveElement.textStrokeWidth || 1));
                    const y = Math.round(Math.sin(angle) * (responsiveElement.textStrokeWidth || 1));
                    return `${x}px ${y}px 0 ${responsiveElement.textStrokeColor || "#000"}`;
                }).join(", ")
                : (responsiveElement.textStrokeColor ? `1px 1px 0 ${responsiveElement.textStrokeColor}, -1px -1px 0 ${responsiveElement.textStrokeColor}, 1px -1px 0 ${responsiveElement.textStrokeColor}, -1px 1px 0 ${responsiveElement.textStrokeColor}` : "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000"),
        }),
        // Image-specific styles
        ...(responsiveElement.type === "image" && {
            padding: 0,
            width: responsiveElement.width ? `${responsiveElement.width}%` : "auto",
            height: responsiveElement.height ? `${responsiveElement.height}%` : "auto",
            backgroundColor: "transparent",
        }),
    };

    // Handle element click
    const handleClick = (e: React.MouseEvent) => {
        if (!isEditMode) {
            // In view mode, buttons and text with links should navigate
            if ((responsiveElement.type === "button" || responsiveElement.type === "text") && responsiveElement.href) {
                // Check if it's a data URL (file attachment)
                if (responsiveElement.href.startsWith("data:") && responsiveElement.fileType) {
                    try {
                        const base64Data = responsiveElement.href.split(",")[1];
                        const byteCharacters = atob(base64Data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: responsiveElement.fileType });
                        const blobUrl = URL.createObjectURL(blob);

                        // Open in new tab (browser handles download/view)
                        window.open(blobUrl, responsiveElement.newTab ? "_blank" : "_self");

                        // Cleanup
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
                        return;
                    } catch (e) {
                        console.error("Failed to open file", e);
                    }
                }

                if (responsiveElement.newTab) {
                    window.open(responsiveElement.href, '_blank', 'noopener,noreferrer');
                } else {
                    // Check if we are in the editor and this is an internal link
                    // This prevents leaving the editor layout when testing navigation
                    if (responsiveElement.href.startsWith("/") && window.location.pathname.endsWith("/edit")) {
                        const target = responsiveElement.href;
                        // Avoid double appending if link already has /edit (unlikely but safe)
                        if (!target.endsWith("/edit")) {
                            window.location.href = `${target}/edit`;
                            return;
                        }
                    }
                    window.location.href = responsiveElement.href;
                }
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

    // Helper to render grid lines
    const renderGrid = () => {
        if (!isDragging) return null;

        // 12 Column Grid
        const cols = 12;
        const colWidth = 100 / cols;
        const gridLines = [];

        for (let i = 1; i < cols; i++) {
            gridLines.push(
                <div
                    key={`col-${i}`}
                    className="absolute top-0 bottom-0 border-r border-indigo-500/10 pointer-events-none"
                    style={{ left: `${i * colWidth}%`, width: '1px' }}
                />
            );
        }

        // Horizontal Rows (4 rows / 25%)
        for (let i = 1; i < 4; i++) {
            gridLines.push(
                <div
                    key={`row-${i}`}
                    className="absolute left-0 right-0 border-b border-indigo-500/10 pointer-events-none"
                    style={{ top: `${i * 25}%`, height: '1px' }}
                />
            );
        }

        return (
            <div className="absolute inset-0 z-[40] pointer-events-none">
                {gridLines}
            </div>
        );
    };

    return (
        <>
            {renderGrid()}
            {/* Alignment Guides */}
            {guides.x !== null && (
                <div
                    className="absolute top-0 bottom-0 border-l border-pink-500 z-[150] pointer-events-none"
                    style={{ left: `${guides.x}%` }}
                />
            )}
            {guides.y !== null && (
                <div
                    className="absolute left-0 right-0 border-t border-pink-500 z-[150] pointer-events-none"
                    style={{ top: `${guides.y}%` }}
                />
            )}
            <div
                ref={elementRef}
                style={elementStyles}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                className={`transition-shadow ${isEditMode && isSelected
                    ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg"
                    : isEditMode
                        ? "hover:ring-2 hover:ring-blue-400/50 hover:ring-offset-1"
                        : ""
                    }`}
            >
                {/* Render content based on element type */}
                {responsiveElement.type === "image" && responsiveElement.src ? (
                    <>
                        <img
                            src={responsiveElement.src}
                            alt="Asset"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: responsiveElement.objectFit || "fill",
                                pointerEvents: "none",
                            }}
                            draggable={false}
                        />
                        {/* Resize handles for images */}
                        {isEditMode && isSelected && (
                            <>
                                {/* Corner handles */}
                                {/* NW Handle */}
                                <div
                                    onMouseDown={(e) => handleResizeStart(e, 'nw')}
                                    onTouchStart={(e) => handleResizeStart(e, 'nw')}
                                    className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize z-[200] hover:bg-blue-100 shadow-md"
                                    style={{ touchAction: 'none' }}
                                />
                                {/* NE Handle */}
                                <div
                                    onMouseDown={(e) => handleResizeStart(e, 'ne')}
                                    onTouchStart={(e) => handleResizeStart(e, 'ne')}
                                    className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize z-[200] hover:bg-blue-100 shadow-md"
                                    style={{ touchAction: 'none' }}
                                />
                                {/* SW Handle */}
                                <div
                                    onMouseDown={(e) => handleResizeStart(e, 'sw')}
                                    onTouchStart={(e) => handleResizeStart(e, 'sw')}
                                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize z-[200] hover:bg-blue-100 shadow-md"
                                    style={{ touchAction: 'none' }}
                                />
                                {/* SE Handle */}
                                <div
                                    onMouseDown={(e) => handleResizeStart(e, 'se')}
                                    onTouchStart={(e) => handleResizeStart(e, 'se')}
                                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize z-[200] hover:bg-blue-100 shadow-md"
                                    style={{ touchAction: 'none' }}
                                />

                                {/* Edge handles (stretch) */}
                                {/* N Handle */}
                                <div
                                    onMouseDown={(e) => handleResizeStart(e, 'n')}
                                    onTouchStart={(e) => handleResizeStart(e, 'n')}
                                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ns-resize z-[200] hover:bg-blue-100 shadow-md"
                                    style={{ touchAction: 'none' }}
                                />
                                {/* S Handle */}
                                <div
                                    onMouseDown={(e) => handleResizeStart(e, 's')}
                                    onTouchStart={(e) => handleResizeStart(e, 's')}
                                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ns-resize z-[200] hover:bg-blue-100 shadow-md"
                                    style={{ touchAction: 'none' }}
                                />
                                {/* E Handle */}
                                <div
                                    onMouseDown={(e) => handleResizeStart(e, 'e')}
                                    onTouchStart={(e) => handleResizeStart(e, 'e')}
                                    className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-6 bg-white border-2 border-blue-500 rounded-full cursor-ew-resize z-[200] hover:bg-blue-100 shadow-md"
                                    style={{ touchAction: 'none' }}
                                />
                                {/* W Handle */}
                                <div
                                    onMouseDown={(e) => handleResizeStart(e, 'w')}
                                    onTouchStart={(e) => handleResizeStart(e, 'w')}
                                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-6 bg-white border-2 border-blue-500 rounded-full cursor-ew-resize z-[200] hover:bg-blue-100 shadow-md"
                                    style={{ touchAction: 'none' }}
                                />

                                {/* Rotation handle - above the element */}
                                <div
                                    className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-[200]"
                                >
                                    {/* Line connecting to element */}
                                    <div className="w-0.5 h-4 bg-blue-500" />
                                    {/* Rotate button */}
                                    <div
                                        onMouseDown={handleRotateStart}
                                        onTouchStart={handleRotateStart}
                                        className="w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-grab hover:bg-blue-100 shadow-md flex items-center justify-center"
                                        style={{ touchAction: 'none' }}
                                        title={`Rotation: ${Math.round(responsiveElement.rotation || 0)}°`}
                                    >
                                        <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 12a9 9 0 11-9-9" />
                                            <path d="M12 3l3 3-3 3" />
                                        </svg>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div
                        ref={contentRef}
                        contentEditable={isEditMode && isEditing && responsiveElement.type !== "image"}
                        suppressContentEditableWarning
                        onBlur={handleContentBlur}
                        onInput={handleInput}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") {
                                setIsEditing(false);
                                contentRef.current?.blur();
                            }
                            // Allow processing Enter if Shift is pressed (multiline)
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                setIsEditing(false);
                                contentRef.current?.blur();
                            }
                        }}
                        className="outline-none whitespace-pre-wrap min-h-[1em] min-w-[1em]"
                        dangerouslySetInnerHTML={!isEditing ? { __html: localContent || "" } : undefined}
                    />
                )}
            </div>

            {/* Style Panel */}
            {isEditMode && isSelected && !isDragging && (
                <ElementStylePanel
                    element={responsiveElement}
                    onUpdate={(updates) => handleUpdate(responsiveElement.id, updates)}
                    onDelete={() => onDelete(responsiveElement.id)}
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
    isFirst?: boolean;
}

export function ElementOverlay({
    elements,
    sectionRef,
    isEditMode,
    onUpdateElement,
    onDeleteElement,
    isFirst = false,
}: ElementOverlayProps) {
    if (!elements || elements.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 50 }}>
            {elements.map((element) => (
                <div key={element.id} className="pointer-events-auto">
                    <DraggableElement
                        element={element}
                        otherElements={elements.filter(e => e.id !== element.id)}
                        sectionRef={sectionRef}
                        isEditMode={isEditMode}
                        onUpdate={onUpdateElement}
                        onDelete={onDeleteElement}
                        isFirst={isFirst}
                    />
                </div>
            ))}
        </div>
    );
}
