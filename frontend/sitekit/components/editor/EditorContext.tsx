"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { PageSectionDTO } from "@/api";
import { updateSection } from "@/api";

// Types for pending changes
interface PendingChange {
    sectionId: number;
    config: Record<string, unknown>;
}

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
        // Clear pending changes when new sections are loaded
        setPendingChanges(new Map());
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

    // Save all pending changes to backend
    const saveAllChanges = useCallback(async (userId: number): Promise<{ success: boolean; error?: string }> => {
        if (pendingChanges.size === 0) {
            return { success: true };
        }

        setIsSaving(true);

        try {
            const savePromises: Promise<any>[] = [];

            pendingChanges.forEach((config, sectionId) => {
                const section = sections.find(s => s.id === sectionId);
                if (section) {
                    const configString = JSON.stringify(config);
                    savePromises.push(
                        updateSection({
                            id: sectionId,
                            userId: userId,
                            pageId: section.pageId,
                            sectionType: section.sectionType,
                            variant: section.variant,
                            position: section.position,
                            // Send both config and configJson as strings to cover both backend paths
                            config: configString,
                            configJson: configString,
                        })
                    );
                }
            });

            const results = await Promise.all(savePromises);

            // Check for errors
            const errors = results.filter(r => r.error);
            if (errors.length > 0) {
                console.error("Some sections failed to save:", errors);
                return { success: false, error: "Some sections failed to save" };
            }

            // Clear pending changes on success
            setPendingChanges(new Map());
            return { success: true };

        } catch (error) {
            console.error("Failed to save changes:", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        } finally {
            setIsSaving(false);
        }
    }, [pendingChanges, sections]);

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
        hasPendingChanges: pendingChanges.size > 0,
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
