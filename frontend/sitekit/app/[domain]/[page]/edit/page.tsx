"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    getAllSites, 
    getPagesBySite, 
    getSections, 
    getUserFromToken, 
    createPage, 
    // savePage removed
} from "@/api";
import { SectionRenderer } from "@/components/renderer/SectionRenderer";
import { 
    EditorProvider, 
    useEditor, 
    SectionWrapper, 
    AddSectionButton, 
    SectionPicker, 
    SortableSectionList, 
    PageManager 
} from "@/components/editor";
import type { SiteDTO, PageDTO, PageSectionDTO, SectionType } from "@/api";
import { 
    ArrowLeft, 
    Save, 
    Monitor, 
    Tablet, 
    Smartphone, 
    Undo, 
    Redo, 
    Eye,
    Plus 
} from "lucide-react";

// Inner component that uses editor context
function EditorContent({ 
    site, 
    pages,
    currentPage, 
    initialSections,
    onPageChange,
    onPagesChanged,
    domain,
    router 
}: { 
    site: SiteDTO; 
    pages: PageDTO[];
    currentPage: PageDTO | null;
    initialSections: PageSectionDTO[];
    onPageChange: (page: PageDTO) => void;
    onPagesChanged: () => void;
    domain: string;
    router: any;
}) {
    const { 
        isEditMode, 
        setEditMode, 
        sections, 
        setSections, 
        hasPendingChanges, 
        saveAllChanges,
        isSaving: contextIsSaving,
        pendingDeletions,
        markSectionForDeletion,
        moveSection,
        reorderSectionsLocal,
        addSection,
        canUndo,
        undo,
        canRedo,
        redo,
        clearHistory,
        setPages,
        setSiteDomain,
        viewMode,
        setViewMode
    } = useEditor();
    
    // Local processing state
    const [localIsSaving, setLocalIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    
    // Page management state
    const [showPageManager, setShowPageManager] = useState(false);
    const [showPageDropdown, setShowPageDropdown] = useState(false);

    // Initialize sections in context when loaded
    useEffect(() => {
        setSections(initialSections);
    }, [initialSections, setSections]);

    // Sync pages and domain to context
    useEffect(() => {
        setPages(pages);
        setSiteDomain(domain);
    }, [pages, domain, setPages, setSiteDomain]);

    // Handle save
    const handleSave = async () => {
        const pageId = currentPage?.id || 0;
        const user = getUserFromToken();
        const userId = user?.userId || 0;
        
        if (!userId) {
            setSaveMessage({ type: "error", text: "Authentication error: Please log in again." });
            return;
        }

        setLocalIsSaving(true);
        try {
            const result = await saveAllChanges(userId, pageId);
            
            if (result.success) {
                setSaveMessage({ type: "success", text: "Changes saved!" });
            } else {
                setSaveMessage({ type: "error", text: result.error || "Failed to save" });
            }
        } catch (e) {
            setSaveMessage({ type: "error", text: "Failed to save" });
        } finally {
            setLocalIsSaving(false);
            // Clear message after 3 seconds
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    // Handle cancel/discard is implicitly handled by not saving or reloading page
    // Using simple reload for full discard if needed, or just clear history
    const handleDiscard = () => {
        if (confirm("Are you sure you want to discard unsaved changes? This will reload the page.")) {
            window.location.reload();
        }
    };

    // Section picker state
    const [showSectionPicker, setShowSectionPicker] = useState(false);
    const [insertPosition, setInsertPosition] = useState<number>(0);

    // Handle add section
    const handleAddSection = async (sectionType: SectionType, variant: string) => {
        if (!currentPage?.id) {
            setSaveMessage({ type: "error", text: "Error: Page ID not found" });
            return;
        }
        
        let defaultConfig: any = {};
        
        // Basic defaults
        switch (sectionType) {
            case "HERO":
                defaultConfig = {
                    elements: [] // New structure
                };
                break;
            default:
                defaultConfig = { elements: [] };
                break;
        }

        try {
            await addSection(
                sectionType,
                variant,
                currentPage.id, 
                insertPosition,
                defaultConfig 
            );
            
            setInsertPosition(0);
            setSaveMessage({ type: "success", text: "Section added!" });
            setTimeout(() => setSaveMessage(null), 2000);
            
        } catch (error) {
            setSaveMessage({ type: "error", text: "Failed to add section" });
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    // Handle delete section
    const handleDeleteSection = (sectionId: number) => {
        markSectionForDeletion(sectionId);
        setSaveMessage({ type: "success", text: "Section marked for deletion. Click Save to confirm." });
        setTimeout(() => setSaveMessage(null), 3000);
    };

    // Handle drag-and-drop reorder
    const handleDragReorder = (newSections: PageSectionDTO[]) => {
        reorderSectionsLocal(newSections);
    };

    const sortedSections = [...sections]
        .filter(s => s.id && !pendingDeletions.has(s.id))
        .sort((a, b) => (a.position || 0) - (b.position || 0));

    // Canvas width helper
    const getCanvasWidth = () => {
        switch (viewMode) {
            case "mobile": return "100%";
            case "tablet": return "768px";
            default: return "100%";
        }
    };

    const isSaving = localIsSaving || contextIsSaving;

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-inter">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-[99]">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push("/dashboard")}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                    
                    {/* Site/Page Selector */}
                    <div className={isEditMode ? "hidden md:block" : ""}>
                         <div className="relative">
                            <button
                                onClick={() => setShowPageDropdown(!showPageDropdown)}
                                className="flex items-center gap-1 text-sm font-semibold hover:text-blue-600 transition-colors"
                            >
                                <span>{site?.name} / {currentPage?.name || "Home"}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                            </button>
                             {showPageDropdown && (
                            <>
                                <div className="fixed inset-0 z-[199]" onClick={() => setShowPageDropdown(false)} />
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[200]">
                                    {pages.map(p => (
                                        <button 
                                            key={p.id}
                                            onClick={() => { onPageChange(p); setShowPageDropdown(false); }}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                    <div className="border-t border-slate-200 dark:border-slate-700 mt-1 pt-1">
                                        <button 
                                            onClick={() => { setShowPageManager(true); setShowPageDropdown(false); }}
                                            className="w-full text-left px-4 py-2 text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            Manage Pages
                                        </button>
                                    </div>
                                </div>
                            </>
                             )}
                        </div>
                    </div>
                </div>

                {/* Viewport Controls - REMOVED */}


                <div className="flex items-center gap-2">
                    <div className="flex items-center mr-2">
                        <button 
                            onClick={undo} 
                            disabled={!canUndo}
                            className={`p-2 rounded-lg transition-colors ${canUndo ? "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" : "text-slate-300 dark:text-slate-700 cursor-not-allowed"}`}
                            title="Undo"
                        >
                            <Undo className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={redo}
                            disabled={!canRedo}
                            className={`p-2 rounded-lg transition-colors ${canRedo ? "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" : "text-slate-300 dark:text-slate-700 cursor-not-allowed"}`}
                            title="Redo"
                        >
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>

                    <button 
                        onClick={() => setEditMode(!isEditMode)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${!isEditMode 
                            ? "bg-blue-50 border-blue-200 text-blue-700" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                        <Eye className="w-4 h-4" />
                        <span className="hidden md:inline">{isEditMode ? "Preview" : "Editing"}</span>
                    </button>

                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !hasPendingChanges}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                            hasPendingChanges 
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100" 
                                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                        }`}
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>Save</span>
                    </button>
                </div>
            </header>

            {/* Save Message Toast */}
            {saveMessage && (
                <div className={`fixed top-20 right-4 z-[200] px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in ${
                    saveMessage.type === "success" 
                        ? "bg-green-500 text-white" 
                        : "bg-red-500 text-white"
                }`}>
                    {saveMessage.text}
                </div>
            )}

            {/* Canvas Area */}
            <main className="flex-1 bg-slate-100 dark:bg-slate-900 overflow-y-auto overflow-x-hidden relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                <div className="min-h-full flex justify-center perspective-1000">
                    <div 
                        className="bg-white dark:bg-black transition-all duration-300 ease-in-out origin-top"
                        style={{ 
                            width: getCanvasWidth(),
                            minHeight: "800px",
                            marginBottom: 0
                        }}
                    >
                        {/* Add Section at top */}
                        {isEditMode && sortedSections.length > 0 && (
                            <AddSectionButton onClick={() => {
                                setInsertPosition(0);
                                setShowSectionPicker(true);
                            }} />
                        )}

                        {/* Render Sections */}
                        {sortedSections.length > 0 ? (
                            <SortableSectionList sections={sortedSections} onReorder={handleDragReorder}>
                                {(section, index) => (
                                    <React.Fragment key={section.id}>
                                        <SectionWrapper
                                            section={section}
                                            onDelete={handleDeleteSection}
                                            onMoveUp={() => section.id && moveSection(section.id, "up")}
                                            onMoveDown={() => section.id && moveSection(section.id, "down")}
                                            isFirst={index === 0}
                                            isLast={index === sortedSections.length - 1}
                                        >
                                            <SectionRenderer section={section} disableOverlay={true} domain={domain} />
                                        </SectionWrapper>
                                        
                                        {/* Add Section button between sections */}
                                        {isEditMode && index < sortedSections.length - 1 && (
                                            <AddSectionButton onClick={() => {
                                                setInsertPosition(index + 1);
                                                setShowSectionPicker(true);
                                            }} />
                                        )}
                                    </React.Fragment>
                                )}
                            </SortableSectionList>
                        ) : (
                            <div className="py-40 flex flex-col items-center justify-center text-slate-400">
                                <p>Empty Page</p>
                                {isEditMode && (
                                    <button 
                                        onClick={() => {
                                            setInsertPosition(0);
                                            setShowSectionPicker(true);
                                        }}
                                        className="mt-4 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
                                    >
                                        + Add Section
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Add Section at bottom */}
                        {isEditMode && sortedSections.length > 0 && (
                            <AddSectionButton onClick={() => {
                                setInsertPosition(sortedSections.length);
                                setShowSectionPicker(true);
                            }} />
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showSectionPicker && (
                <SectionPicker 
                    onSelect={handleAddSection} 
                    onClose={() => setShowSectionPicker(false)} 
                />
            )}

            {showPageManager && site && (
                <PageManager
                    isOpen={showPageManager}
                    onClose={() => setShowPageManager(false)}
                    site={site}
                    currentPage={currentPage}
                    onPageSelect={onPageChange}
                    onPagesChanged={onPagesChanged}
                />
            )}
        </div>
    );
}

// Main page component
export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const domain = decodeURIComponent(params.domain as string);
    const pageSlug = decodeURIComponent(params.page as string);
    
    // State
    const [site, setSite] = useState<SiteDTO | null>(null);
    const [pages, setPages] = useState<PageDTO[]>([]);
    const [currentPage, setCurrentPage] = useState<PageDTO | null>(null);
    const [sections, setSections] = useState<PageSectionDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSiteData = async () => {
            try {
                const user = getUserFromToken();
                if (!user || !user.userId) {
                    router.push("/login"); 
                    return;
                }

                // 1. Fetch All Sites
                const allSitesRes = await getAllSites({ user: { id: user.userId } });
                if (allSitesRes.error || !allSitesRes.data) throw new Error(allSitesRes.error || "Failed");

                const foundSite = allSitesRes.data.find(s => s.domain === domain);
                if (!foundSite || !foundSite.id) throw new Error("Site not found");
                
                setSite(foundSite);

                // 2. Fetch Pages
                const pagesRes = await getPagesBySite({ site: { id: foundSite.id, user: { id: user.userId } } });
                let targetPage: PageDTO | null = null;
                let allPages = pagesRes.data || [];

                if (allPages.length > 0) {
                    targetPage = allPages.find(p => p.slug === pageSlug) || null;
                    if (!targetPage) {
                        targetPage = allPages[0];
                        if (targetPage.slug) {
                            router.replace(`/${domain}/${targetPage.slug}/edit`);
                            return;
                        }
                    }
                } else {
                    // Create Default
                    const createRes = await createPage({
                        site: { id: foundSite.id, user: { id: user.userId } },
                        name: "Home",
                        slug: "home"
                    });
                    if (createRes.data) {
                        targetPage = createRes.data;
                        allPages = [targetPage];
                        router.replace(`/${domain}/home/edit`);
                        return;
                    }
                }

                if (targetPage) {
                    setPages(allPages);
                    setCurrentPage(targetPage);

                    // 3. Sections
                    if (targetPage.id) {
                        const sectionsRes = await getSections({ userId: user.userId, pageId: targetPage.id });
                        if (sectionsRes.data) setSections(sectionsRes.data);
                    }
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : "Error");
            } finally {
                setIsLoading(false);
            }
        };

        if (domain && pageSlug) loadSiteData();
    }, [domain, pageSlug, router]);

    const handlePageChange = useCallback((page: PageDTO) => {
        if (page.slug) router.push(`/${domain}/${page.slug}/edit`);
    }, [domain, router]);

    const handlePagesChanged = useCallback(async () => {
        if (!site?.id) return;
        const user = getUserFromToken();
        if (!user?.userId) return;
        const pagesRes = await getPagesBySite({ site: { id: site.id, user: { id: user.userId } } });
        if (pagesRes.data) setPages(pagesRes.data);
    }, [site]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
    if (error || !site) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <EditorProvider>
            <EditorContent 
                site={site} 
                pages={pages}
                currentPage={currentPage} 
                initialSections={sections}
                onPageChange={handlePageChange}
                onPagesChanged={handlePagesChanged}
                domain={domain}
                router={router}
            />
        </EditorProvider>
    );
}
