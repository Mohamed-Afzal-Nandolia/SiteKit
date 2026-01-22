"use client";

import React from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageSectionDTO } from "@/api";
import { useEditor } from "./EditorContext";

interface DraggableSectionProps {
    section: PageSectionDTO;
    children: React.ReactNode;
}

// Individual draggable section wrapper
export function DraggableSection({ section, children }: DraggableSectionProps) {
    const { isEditMode } = useEditor();
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: section.id || 0,
        disabled: !isEditMode,
    });

    const isHeader = section.sectionType === "HEADER";

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: "relative" as const,
        zIndex: isDragging ? 100 : (isHeader ? 50 : 1),
    };

    if (!isEditMode) {
        return <>{children}</>;
    }

    return (
        <div ref={setNodeRef} style={style}>
            {/* Drag Handle - z-index must be higher than SectionWrapper's hover z-[9999] */}
            <div
                {...attributes}
                {...listeners}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-[10000] flex items-center justify-center w-8 h-12 bg-slate-900/80 hover:bg-slate-800 rounded-lg cursor-grab active:cursor-grabbing touch-manipulation shadow-lg"
                title="Drag to reorder"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.5" />
                    <circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" />
                    <circle cx="15" cy="18" r="1.5" />
                </svg>
            </div>
            {children}
        </div>
    );
}

interface SortableSectionListProps {
    sections: PageSectionDTO[];
    onReorder: (newOrder: PageSectionDTO[]) => void;
    children: (section: PageSectionDTO, index: number) => React.ReactNode;
}

// Container for sortable sections
export function SortableSectionList({ sections, onReorder, children }: SortableSectionListProps) {
    const { isEditMode } = useEditor();
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required before drag starts
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // 250ms hold before drag starts on touch
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newSections = arrayMove(sections, oldIndex, newIndex);
                // Update positions
                const updatedSections = newSections.map((section, index) => ({
                    ...section,
                    position: index,
                }));
                onReorder(updatedSections);
            }
        }
    };

    if (!isEditMode) {
        // Just render children without drag context when not in edit mode
        return <>{sections.map((section, index) => children(section, index))}</>;
    }

    const sectionIds = sections.map((s) => s.id || 0);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                {sections.map((section, index) => (
                    <DraggableSection key={section.id} section={section}>
                        {children(section, index)}
                    </DraggableSection>
                ))}
            </SortableContext>
        </DndContext>
    );
}
