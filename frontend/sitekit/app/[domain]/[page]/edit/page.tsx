"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllSites, getPagesBySite, getSections, getUserFromToken, createPage } from "@/api";
import { SectionRenderer } from "@/components/renderer/SectionRenderer";
import { EditorProvider, useEditor, SectionWrapper, AddSectionButton, SectionPicker, SortableSectionList, PageManager } from "@/components/editor";
import type { SiteDTO, PageDTO, PageSectionDTO, SectionType } from "@/api";

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
        isSaving,
        pendingDeletions,
        markSectionForDeletion,
        moveSection,
        addSection,
        canUndo,
        undo,
        clearHistory,
        setPages,
        setSiteDomain
    } = useEditor();
    
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

    // Get user ID for save operations
    const user = getUserFromToken();
    const userId = user?.userId || 0;

    // Handle save - pass both userId and pageId for reorder API
    const handleSave = async () => {
        const pageId = currentPage?.id || 0;
        
        if (!userId) {
            setSaveMessage({ type: "error", text: "Authentication error: Please log in again." });
            return;
        }

        const result = await saveAllChanges(userId, pageId);
        if (result.success) {
            setSaveMessage({ type: "success", text: "Changes saved!" });
        } else {
            setSaveMessage({ type: "error", text: result.error || "Failed to save" });
        }
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
    };

    // Handle cancel - discard all pending changes
    const handleCancel = () => {
        setSections(initialSections);
        clearHistory(); // Clear undo history when canceling
        setSaveMessage({ type: "success", text: "Changes discarded" });
        setTimeout(() => setSaveMessage(null), 2000);
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
        
        // Define default configurations for each section type
        let defaultConfig: any = {};
        
        switch (sectionType) {
            case "HERO":
                defaultConfig = {
                    headline: "Welcome to Your Site",
                    subheadline: "This is a perfect place to introduce your brand and what you do. Click to edit this text.",
                    primaryCta: { label: "Get Started", href: "#" },
                    secondaryCta: { label: "Learn More", href: "#" },
                    alignment: "center"
                };
                break;
            case "HEADER":
                defaultConfig = {
                    logoText: "My Brand",
                    navLinks: [
                        { label: "Home", href: "/" },
                        { label: "About", href: "/about" },
                        { label: "Contact", href: "/contact" }
                    ],
                    actionButton: { label: "Get Started", href: "/signup", variant: "primary" }
                };
                break;
            case "CONTENT":
                defaultConfig = {
                    title: "Our Features",
                    description: "Discover what makes us unique and why you should choose our services.",
                    layout: "grid",
                    features: [
                        { title: "Feature One", description: "Description for feature one. Highlight key benefits here." },
                        { title: "Feature Two", description: "Description for feature two. Explain how it solves problems." },
                        { title: "Feature Three", description: "Description for feature three. Showcase your value proposition." }
                    ]
                };
                break;
            case "CTA":
                defaultConfig = {
                    title: "Ready to Get Started?",
                    description: "Join thousands of satisfied customers and take your business to the next level today.",
                    buttonText: "Start Free Trial",
                    buttonLink: "#"
                };
                break;
            case "FOOTER":
                defaultConfig = {
                    brandName: "My Brand",
                    description: "Making the world a better place through innovation and design.",
                    copyrightText: "© 2024 My Brand Inc. All rights reserved.",
                    columns: [
                        {
                            title: "Product",
                            links: [
                                { label: "Features", href: "#" },
                                { label: "Pricing", href: "#" }
                            ]
                        },
                        {
                            title: "Company",
                            links: [
                                { label: "About", href: "#" },
                                { label: "Careers", href: "#" }
                            ]
                        },
                        {
                            title: "Legal",
                            links: [
                                { label: "Privacy", href: "#" },
                                { label: "Terms", href: "#" }
                            ]
                        }
                    ]
                };
                break;
            default:
                defaultConfig = { title: "New Section" };
                break;
        }

        try {
            // Optimistic update via context
            await addSection(
                sectionType,
                variant,
                currentPage.id, // Pass pageId
                insertPosition,
                defaultConfig // Use the default config
            );
            
            // Reset insert position
            setInsertPosition(0);
            
            setSaveMessage({ type: "success", text: "Section added!" });
            setTimeout(() => setSaveMessage(null), 2000);
            
        } catch (error) {
            setSaveMessage({ type: "error", text: "Failed to add section" });
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    // Handle delete section - SOFT DELETE (just mark for deletion, don't call API yet)
    const handleDeleteSection = (sectionId: number) => {
        markSectionForDeletion(sectionId);
        setSaveMessage({ type: "success", text: "Section marked for deletion. Click Save to confirm." });
        setTimeout(() => setSaveMessage(null), 3000);
    };

    // Handle drag-and-drop reorder
    const handleDragReorder = (newSections: PageSectionDTO[]) => {
        // Update sections with new positions
        setSections(newSections.map((section, index) => ({
            ...section,
            position: index,
        })));
    };

    // Sort sections by position and filter out pending deletions
    const sortedSections = [...sections]
        .filter(s => s.id && !pendingDeletions.has(s.id))
        .sort((a, b) => (a.position || 0) - (b.position || 0));

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans">
            {/* Editor Header */}
            <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-4 shadow-md sticky top-0 z-[100]">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push("/my-websites")}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        title="Back to Sites"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                    </button>
                    <div className="h-6 w-px bg-white/20"></div>
                    {/* Site name and Page selector */}
                    <div className={isEditMode ? "hidden md:block" : ""}>
                        <h1 className="font-semibold text-sm">{site?.name}</h1>
                        {/* Page Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowPageDropdown(!showPageDropdown)}
                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                <span>{currentPage?.name || "Home"}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                            
                            {/* Page Dropdown Menu */}
                            {showPageDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50">
                                    <div className="max-h-60 overflow-y-auto">
                                        {pages.map((page) => (
                                            <button
                                                key={page.id}
                                                onClick={() => {
                                                    onPageChange(page);
                                                    setShowPageDropdown(false);
                                                }}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center justify-between ${
                                                    currentPage?.id === page.id ? "bg-blue-600/20 text-blue-400" : "text-white"
                                                }`}
                                            >
                                                <span>{page.name}</span>
                                                {currentPage?.id === page.id && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="border-t border-slate-700">
                                        <button
                                            onClick={() => {
                                                setShowPageDropdown(false);
                                                setShowPageManager(true);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 5v14M5 12h14" />
                                            </svg>
                                            Manage Pages
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Exit Edit Mode Button - only show when in edit mode */}
                    {isEditMode && (
                        <button 
                            onClick={() => setEditMode(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white transition-all"
                            title="Exit Edit Mode"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                            Exit
                        </button>
                    )}

                    {/* Edit Mode Toggle */}
                    <button 
                        onClick={() => setEditMode(!isEditMode)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isEditMode 
                                ? "bg-green-600 text-white" 
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                        title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
                    >
                        {isEditMode ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Editing
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                            </>
                        )}
                    </button>

                    {/* Unsaved Changes Indicator */}
                    {hasPendingChanges && (
                        <span className="flex items-center gap-1 text-xs text-amber-400">
                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                            Unsaved
                        </span>
                    )}

                    {/* Viewport Size Buttons */}
                    <div className="hidden md:flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                        <button className="p-1.5 bg-slate-700 rounded text-blue-400" title="Desktop">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                        </button>
                        <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Tablet">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>
                        </button>
                        <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Mobile">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>
                        </button>
                    </div>

                    {/* Undo Button - only show when there are undoable actions */}
                    {isEditMode && canUndo && (
                        <button 
                            onClick={undo}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white transition-colors cursor-pointer"
                            title="Undo last action"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 7v6h6" />
                                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                            </svg>
                            Undo
                        </button>
                    )}

                    {/* Cancel Button - only show when there are pending changes */}
                    {hasPendingChanges && (
                        <button 
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="px-3 py-1.5 rounded text-sm font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    )}

                    {/* Save Button - Always enabled in edit mode */}
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !isEditMode}
                        className={`px-4 py-1.5 rounded text-sm font-semibold transition-all ${
                            isEditMode 
                                ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:shadow-lg active:scale-95" 
                                : "bg-slate-700 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                        {isSaving ? "Saving..." : "Save"}
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

            {/* Edit Mode Banner */}
            {isEditMode && (
                <div className="bg-green-600 text-white text-center py-2 text-sm font-medium">
                    <span className="mr-2">✏️</span>
                    Edit Mode Active — Click on any text to edit it. Changes are saved when you click "Save".
                </div>
            )}

            {/* Canvas Area */}
            <main className="flex-1 bg-slate-100 dark:bg-slate-900 overflow-y-auto relative">
                <div className="min-h-full bg-white dark:bg-black shadow-2xl mx-auto transition-all duration-300 w-full" style={{ maxWidth: '100%' }}>
                    {/* Add Section at top */}
                    {isEditMode && sortedSections.length > 0 && (
                        <AddSectionButton onClick={() => {
                            setInsertPosition(0);
                            setShowSectionPicker(true);
                        }} />
                    )}

                    {/* Render Sections with Drag-and-Drop */}
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
            </main>

            {/* Section Picker Modal */}
            {showSectionPicker && (
                <SectionPicker 
                    onSelect={handleAddSection} 
                    onClose={() => setShowSectionPicker(false)} 
                />
            )}

            {/* Page Manager Modal */}
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

            {/* Click outside handler for dropdown */}
            {showPageDropdown && (
                <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPageDropdown(false)}
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

                // 1. Fetch All Sites to find by domain
                const allSitesRes = await getAllSites({ user: { id: user.userId } });
                if (allSitesRes.error || !allSitesRes.data) {
                    throw new Error(allSitesRes.error || "Failed to load sites");
                }

                const foundSite = allSitesRes.data.find(s => s.domain === domain);
                if (!foundSite || !foundSite.id) {
                    throw new Error("Site not found");
                }
                
                setSite(foundSite);

                // 2. Fetch Pages and find by slug
                const pagesRes = await getPagesBySite({ site: { id: foundSite.id, user: { id: user.userId } } });
                
                let targetPage: PageDTO | null = null;
                let allPages: PageDTO[] = [];

                if (pagesRes.data && pagesRes.data.length > 0) {
                    allPages = pagesRes.data;
                    // Find page by slug from URL
                    targetPage = allPages.find(p => p.slug === pageSlug) || null;
                    
                    if (!targetPage) {
                        // Page slug not found, redirect to first page
                        targetPage = allPages[0];
                        if (targetPage.slug) {
                            router.replace(`/${domain}/${targetPage.slug}/edit`);
                            return;
                        }
                    }
                } else {
                    // No pages found - Create Default 'Home' Page
                    const createRes = await createPage({
                        site: { id: foundSite.id, user: { id: user.userId } },
                        name: "Home",
                        slug: "home"
                    });
                    if (createRes.data) {
                        targetPage = createRes.data;
                        allPages = [targetPage];
                        // Redirect to home page
                        router.replace(`/${domain}/home/edit`);
                        return;
                    } else {
                        throw new Error(createRes.error || "Failed to create default page");
                    }
                }

                if (targetPage) {
                    setPages(allPages);
                    setCurrentPage(targetPage);

                    // 3. Fetch Sections for target Page
                    if (targetPage.id) {
                        const sectionsRes = await getSections({ userId: user.userId, pageId: targetPage.id });
                        if (sectionsRes.data) {
                            setSections(sectionsRes.data);
                        }
                    }
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        if (domain && pageSlug) {
            loadSiteData();
        }
    }, [domain, pageSlug, router]);

    // Handle page change - navigate to the new page URL
    const handlePageChange = useCallback((page: PageDTO) => {
        if (!page.slug) return;
        router.push(`/${domain}/${page.slug}/edit`);
    }, [domain, router]);

    // Handle pages changed (refresh pages list)
    const handlePagesChanged = useCallback(async () => {
        if (!site?.id) return;
        
        const user = getUserFromToken();
        if (!user?.userId) return;
        
        const pagesRes = await getPagesBySite({ site: { id: site.id, user: { id: user.userId } } });
        if (pagesRes.data) {
            setPages(pagesRes.data);
        }
    }, [site?.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="text-slate-500">Loading editor...</p>
                </div>
            </div>
        );
    }

    if (error || !site) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center text-red-500">
                    <h2 className="text-xl font-bold mb-2">Error Loading Site</h2>
                    <p>{error}</p>
                    <button 
                        onClick={() => router.push("/dashboard")}
                        className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

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
