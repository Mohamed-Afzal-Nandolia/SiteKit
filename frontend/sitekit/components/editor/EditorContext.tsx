"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { PageSectionDTO } from "@/api";
import { updateSection, deleteSection, reorderSections } from "@/api";

// Editor Context State
interface EditorContextState {
    // Edit mode
    isEditMode: boolean;
    setEditMode: (value: boolean) => void;
    
    // Section selection
    selectedSectionId: number | null;
    selectSection: (sectionId: number | null) => void;
    
    // Sections data (local copy for editing)
    sections: PageSectionDTO[];
    setSections: (sections: PageSectionDTO[]) => void;
    
    // Config updates
    updateSectionConfig: (sectionId: number, newConfig: Record<string, unknown>) => void;
    getSectionConfig: (sectionId: number) => Record<string, unknown> | null;
    
    // Pending changes tracking
    pendingChanges: Map<number, Record<string, unknown>>;
    
    // Pending deletions tracking (soft delete)
    pendingDeletions: Set<number>;
    markSectionForDeletion: (sectionId: number) => void;
    restoreSection: (sectionId: number) => void;
    
    // Reordering
    moveSection: (sectionId: number, direction: "up" | "down") => void;
    hasReorderChanges: boolean;
    
    // Add a new section locally (with negative temp ID)
    addSection: (sectionType: any, variant: string, pageId: number, position?: number, config?: Record<string, unknown>) => void;

    // Check if there are any pending changes (config updates, deletions, reorders, or additions)
    hasPendingChanges: boolean;
    
    // Save functionality
    saveAllChanges: (userId: number, pageId: number) => Promise<{ success: boolean; error?: string }>;
    isSaving: boolean;
}

// Default context value
const defaultContextValue: EditorContextState = {
    isEditMode: false,
    setEditMode: () => {},
    selectedSectionId: null,
    selectSection: () => {},
    sections: [],
    setSections: () => {},
    updateSectionConfig: () => {},
    getSectionConfig: () => null,
    pendingChanges: new Map(),
    pendingDeletions: new Set(),
    markSectionForDeletion: () => {},
    restoreSection: () => {},
    moveSection: () => {},
    addSection: () => {},
    hasReorderChanges: false,
    hasPendingChanges: false,
    saveAllChanges: async () => ({ success: false }),
    isSaving: false,
};

// Create context
const EditorContext = createContext<EditorContextState>(defaultContextValue);

// Provider component
export function EditorProvider({ children }: { children: ReactNode }) {
    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Selection state
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    
    // Sections data (local copy)
    const [sections, setSectionsState] = useState<PageSectionDTO[]>([]);
    
    // Original section order (to detect reorder changes)
    const [originalOrder, setOriginalOrder] = useState<number[]>([]);
    
    // Pending changes map: sectionId -> updated config
    const [pendingChanges, setPendingChanges] = useState<Map<number, Record<string, unknown>>>(new Map());
    const pendingChangesRef = React.useRef<Map<number, Record<string, unknown>>>(new Map());
    
    // Pending deletions set: section IDs marked for deletion (soft delete)
    const [pendingDeletions, setPendingDeletions] = useState<Set<number>>(new Set());
    
    // Saving state
    const [isSaving, setIsSaving] = useState(false);

    // Set edit mode
    const setEditMode = useCallback((value: boolean) => {
        setIsEditMode(value);
        if (!value) {
            // When exiting edit mode, clear selection
            setSelectedSectionId(null);
        }
    }, []);

    // Select a section
    const selectSection = useCallback((sectionId: number | null) => {
        if (isEditMode) {
            setSelectedSectionId(sectionId);
        }
    }, [isEditMode]);

    // Set sections (used when loading from API)
    const setSections = useCallback((newSections: PageSectionDTO[]) => {
        setSectionsState(newSections);
        // Store original order for detecting reorder changes
        setOriginalOrder(newSections.map(s => s.id!).filter(Boolean));
        
        // IMPORTANT: We DO NOT clear pending changes/deletions here anymore.
        // This is because setSections is called when adding a new section,
        // and we don't want to lose unsaved changes in other sections.
    }, []);

    // Add a new section locally
    const addSection = useCallback((sectionType: any, variant: string, pageId: number, position?: number, config: Record<string, unknown> = {}) => {
        const tempId = -Date.now(); // Negative ID for temp sections
        
        const newSection: PageSectionDTO = {
            id: tempId,
            pageId,
            sectionType,
            variant,
            config: config,
            configJson: JSON.stringify(config),
            position: position || 0,
        };

        setSectionsState(prev => {
            const sorted = [...prev].sort((a, b) => (a.position || 0) - (b.position || 0));
            
            // If position is provided, insert there. Otherwise append.
            const insertIndex = position !== undefined 
                ? Math.min(Math.max(0, position), sorted.length)
                : sorted.length;
                
            const newSections = [...sorted];
            newSections.splice(insertIndex, 0, newSection);
            
            // Re-index positions
            return newSections.map((s, idx) => ({
                ...s,
                position: idx
            }));
        });
    }, []);

    // Mark a section for deletion (soft delete - only removes from UI)
    const markSectionForDeletion = useCallback((sectionId: number) => {
        // If it's a temp section (negative ID), just remove it completely from state
        if (sectionId < 0) {
            setSectionsState(prev => prev.filter(s => s.id !== sectionId));
            return;
        }

        setPendingDeletions(prev => {
            const updated = new Set(prev);
            updated.add(sectionId);
            return updated;
        });
    }, []);

    // Restore a section (undo soft delete)
    const restoreSection = useCallback((sectionId: number) => {
        setPendingDeletions(prev => {
            const updated = new Set(prev);
            updated.delete(sectionId);
            return updated;
        });
    }, []);

    // Move a section up or down
    const moveSection = useCallback((sectionId: number, direction: "up" | "down") => {
        setSectionsState(prev => {
            const sorted = [...prev].sort((a, b) => (a.position || 0) - (b.position || 0));
            const currentIndex = sorted.findIndex(s => s.id === sectionId);
            
            if (currentIndex === -1) return prev;
            
            const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
            
            if (targetIndex < 0 || targetIndex >= sorted.length) return prev;
            
            // Swap positions
            const newSections = [...sorted];
            [newSections[currentIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[currentIndex]];
            
            // Update position values
            return newSections.map((section, index) => ({
                ...section,
                position: index,
            }));
        });
    }, []);

    // Check if order has changed from original
    const hasReorderChanges = React.useMemo(() => {
        const currentOrder = [...sections]
            .filter(s => s.id && !pendingDeletions.has(s.id))
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map(s => s.id!);
        
        const filteredOriginal = originalOrder.filter(id => !pendingDeletions.has(id));
        
        if (currentOrder.length !== filteredOriginal.length) return false;
        
        return !currentOrder.every((id, index) => id === filteredOriginal[index]);
    }, [sections, originalOrder, pendingDeletions]);

    // Check if there are any added sections
    const hasAddedSections = React.useMemo(() => {
        return sections.some(s => (s.id || 0) < 0);
    }, [sections]);

    // Get section config (with pending changes applied)
    const getSectionConfig = useCallback((sectionId: number): Record<string, unknown> | null => {
        const section = sections.find(s => s.id === sectionId);
        if (!section) return null;

        // Check for pending changes first (use Ref for latest sync data)
        const pending = pendingChangesRef.current.get(sectionId) || pendingChanges.get(sectionId);
        if (pending) return pending;

        // Parse existing config
        if (section.configJson) {
            try {
                return JSON.parse(section.configJson);
            } catch {
                return {};
            }
        }
        if (typeof section.config === "string") {
            try {
                return JSON.parse(section.config);
            } catch {
                return {};
            }
        }
        return section.config || {};
    }, [sections, pendingChanges]);

    // Update section config locally
    const updateSectionConfig = useCallback((sectionId: number, newConfig: Record<string, unknown>) => {
        // Update ref immediately for synchronous access in saveAllChanges
        if (pendingChangesRef.current) {
            pendingChangesRef.current.set(sectionId, newConfig);
        }

        setPendingChanges(prev => {
            const updated = new Map(prev);
            updated.set(sectionId, newConfig);
            return updated;
        });

        // Also update the local sections array for immediate visual feedback
        setSectionsState(prev => prev.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    config: newConfig,
                    configJson: JSON.stringify(newConfig),
                };
            }
            return section;
        }));
    }, []);

    // Save all pending changes to backend
    // Order: Add sections → Update configs → Delete sections → Reorder (LAST)
    const saveAllChanges = useCallback(async (userId: number, pageId: number): Promise<{ success: boolean; error?: string }> => {
        setIsSaving(true);
        console.log("Saving changes...", { 
            pendingUpdates: pendingChangesRef.current.size, 
            pendingDeletions: pendingDeletions.size, 
            hasReorder: hasReorderChanges 
        });
        
        const tempToRealId = new Map<number, number>();

        try {
            const errors: string[] = [];

            // 0. Handle New Sections (Negative IDs)
            const newSections = sections.filter(s => (s.id || 0) < 0);
            
            // Import addSection here to avoid circular dependency issues if declared at top with useEditor
             const { addSection: apiAddSection } = await import("@/api");

            for (const section of newSections) {
                if (!section.id || !section.sectionType) continue;
                
                // Get latest config (from pending or current state)
                const config = getSectionConfig(section.id) || {};
                
                console.log("Saving NEW section", section.sectionType);
                
                try {
                    const result = await apiAddSection({
                        userId,
                        pageId: pageId,
                        sectionType: section.sectionType,
                        variant: section.variant,
                        config: config,
                    });
                    
                    if (result.data && result.data.id) {
                        tempToRealId.set(section.id, result.data.id);
                    } else {
                        errors.push(`Failed to create section ${section.sectionType}: ${result.error}`);
                    }
                } catch (err) {
                    errors.push(`Failed to create section ${section.sectionType}`);
                }
            }

            // 1. Handle config updates (skip sections that are pending deletion OR were just added)
            const updatePromises: Promise<any>[] = [];
            pendingChangesRef.current.forEach((config, sectionId) => {
                // Don't update config for sections that will be deleted
                if (pendingDeletions.has(sectionId)) return;
                
                // Don't update config for sections we just added (their config was sent in addSection)
                if (sectionId < 0) return;

                const section = sections.find(s => s.id === sectionId);
                if (section) {
                    console.log(`Updating section ${sectionId} with config:`, config);
                    const configString = JSON.stringify(config);
                    
                    updatePromises.push(
                        updateSection({
                            id: sectionId,
                            userId: userId,
                            pageId: section.pageId,
                            sectionType: section.sectionType,
                            variant: section.variant,
                            position: section.position,
                            config: configString, // Revert to string as backend likely expects it
                        }).then(res => {
                            console.log(`Update section ${sectionId} response:`, res);
                            if (res.error) throw new Error(res.error);
                            return res;
                        }).catch(err => {
                            console.error(`Failed to update section ${sectionId}:`, err);
                            errors.push(`Failed to update section ${sectionId}`);
                            return { error: err };
                        })
                    );
                }
            });

            // Wait for updates to complete
            if (updatePromises.length > 0) {
                console.log(`Waiting for ${updatePromises.length} updates to complete...`);
                await Promise.all(updatePromises);
                console.log("All updates completed.");
            }

            // 2. Handle deletions
            const deletePromises: Promise<any>[] = [];
            pendingDeletions.forEach((sectionId) => {
                // If it's a temp ID, we already handled it by not creating it
                if (sectionId < 0) return; 

                deletePromises.push(
                    deleteSection({ userId, id: sectionId }).catch(err => {
                        errors.push(`Failed to delete section ${sectionId}`);
                        return { error: err };
                    })
                );
            });

            // Wait for deletes to complete
            if (deletePromises.length > 0) {
                await Promise.all(deletePromises);
            }

            // 3. Handle reorder LAST
            const orderedSectionIds: number[] = [];
            const sortedCurrentSections = [...sections]
                .filter(s => s.id && !pendingDeletions.has(s.id))
                .sort((a, b) => (a.position || 0) - (b.position || 0));
                
            for (const s of sortedCurrentSections) {
                if (!s.id) continue;
                
                if (s.id < 0) {
                    // It's a new section, get the real ID
                    const realId = tempToRealId.get(s.id);
                    if (realId) {
                        orderedSectionIds.push(realId);
                    } else {
                         console.warn("Skipping section in reorder because it has no real ID:", s.id);
                    }
                } else {
                    // Existing section
                    orderedSectionIds.push(s.id);
                }
            }

            if (orderedSectionIds.length > 0) {
                // Only call reorder if we actually have reorder changes OR added new sections (which implies order change)
                const shouldReorder = hasReorderChanges || newSections.length > 0;
                
                if (shouldReorder) {
                    console.log("Reordering sections:", orderedSectionIds);
                    try {
                        await reorderSections({
                            userId,
                            pageId,
                            orderedSectionIds,
                        });
                    } catch (err) {
                        console.error("Failed to reorder sections:", err);
                        errors.push("Failed to reorder sections");
                    }
                } else {
                    console.log("Skipping reorder - order unchanged and no new sections");
                }
            }

            if (errors.length > 0) {
                console.error("Some operations failed:", errors);
                return { success: false, error: errors.join(", ") };
            }

            // SUCCESS!
            console.log("Save completed successfully");
            
            // Update local state to reflect the saves
            setPendingChanges(new Map());
            pendingChangesRef.current = new Map();
             setPendingDeletions(new Set());
             
            // Update sections with their real IDs
            setSectionsState(prev => {
                const newSections = prev
                     .filter(s => s.id && !pendingDeletions.has(s.id)) // Remove deleted
                     .map(s => {
                         if (s.id && s.id < 0 && tempToRealId.has(s.id)) {
                             return { ...s, id: tempToRealId.get(s.id) };
                         }
                         return s;
                     })
                     .sort((a, b) => (a.position || 0) - (b.position || 0));
                     
                // Reset original order to this new clean state
                setOriginalOrder(newSections.map(s => s.id!).filter(Boolean));
                
                return newSections;
            });

            return { success: true };

        } catch (error) {
            console.error("Failed to save changes:", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        } finally {
            setIsSaving(false);
        }
    }, [pendingChanges, pendingDeletions, sections, hasReorderChanges]);

    // Context value
    const value: EditorContextState = {
        isEditMode,
        setEditMode,
        selectedSectionId,
        selectSection,
        sections,
        setSections,
        updateSectionConfig,
        getSectionConfig,
        pendingChanges,
        pendingDeletions,
        markSectionForDeletion,
        restoreSection,
        moveSection,
        addSection, // Export the new function
        hasReorderChanges,
        hasPendingChanges: pendingChanges.size > 0 || pendingDeletions.size > 0 || hasReorderChanges || hasAddedSections,
        saveAllChanges,
        isSaving,
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
}

// Hook to use editor context
export function useEditor() {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error("useEditor must be used within an EditorProvider");
    }
    return context;
}

// Export context for advanced use cases
export { EditorContext };
