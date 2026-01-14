"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { PageSectionDTO } from "@/api";
import { updateSection, deleteSection } from "@/api";

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
    
    // Check if there are any pending changes (config updates or deletions)
    hasPendingChanges: boolean;
    
    // Save functionality
    saveAllChanges: (userId: number) => Promise<{ success: boolean; error?: string }>;
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
    
    // Pending changes map: sectionId -> updated config
    const [pendingChanges, setPendingChanges] = useState<Map<number, Record<string, unknown>>>(new Map());
    
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
        // Clear pending changes and deletions when new sections are loaded
        setPendingChanges(new Map());
        setPendingDeletions(new Set());
    }, []);

    // Mark a section for deletion (soft delete - only removes from UI)
    const markSectionForDeletion = useCallback((sectionId: number) => {
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

    // Get section config (with pending changes applied)
    const getSectionConfig = useCallback((sectionId: number): Record<string, unknown> | null => {
        const section = sections.find(s => s.id === sectionId);
        if (!section) return null;

        // Check for pending changes first
        const pending = pendingChanges.get(sectionId);
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

    // Save all pending changes (config updates AND deletions) to backend
    const saveAllChanges = useCallback(async (userId: number): Promise<{ success: boolean; error?: string }> => {
        setIsSaving(true);

        try {
            const allPromises: Promise<any>[] = [];
            const errors: string[] = [];

            // 1. Handle config updates (skip sections that are pending deletion)
            pendingChanges.forEach((config, sectionId) => {
                // Don't update config for sections that will be deleted
                if (pendingDeletions.has(sectionId)) return;

                const section = sections.find(s => s.id === sectionId);
                if (section) {
                    const configString = JSON.stringify(config);
                    allPromises.push(
                        updateSection({
                            id: sectionId,
                            userId: userId,
                            pageId: section.pageId,
                            sectionType: section.sectionType,
                            variant: section.variant,
                            position: section.position,
                            config: configString,
                            configJson: configString,
                        }).catch(err => {
                            errors.push(`Failed to update section ${sectionId}`);
                            return { error: err };
                        })
                    );
                }
            });

            // 2. Handle deletions (call delete API for each)
            pendingDeletions.forEach((sectionId) => {
                allPromises.push(
                    deleteSection({ userId, id: sectionId }).catch(err => {
                        errors.push(`Failed to delete section ${sectionId}`);
                        return { error: err };
                    })
                );
            });

            // Wait for all operations
            await Promise.all(allPromises);

            if (errors.length > 0) {
                console.error("Some operations failed:", errors);
                return { success: false, error: errors.join(", ") };
            }

            // Clear pending changes and deletions on success
            setPendingChanges(new Map());
            
            // Remove deleted sections from local state
            if (pendingDeletions.size > 0) {
                setSectionsState(prev => prev.filter(s => s.id && !pendingDeletions.has(s.id)));
            }
            setPendingDeletions(new Set());

            return { success: true };

        } catch (error) {
            console.error("Failed to save changes:", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        } finally {
            setIsSaving(false);
        }
    }, [pendingChanges, pendingDeletions, sections]);

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
        hasPendingChanges: pendingChanges.size > 0 || pendingDeletions.size > 0,
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
