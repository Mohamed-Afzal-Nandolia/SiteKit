"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllSites, getPagesBySite, getSections, getUserFromToken, deleteSection, reorderSections, createPage } from "@/api";
import { SectionRenderer } from "@/components/renderer/SectionRenderer";
import { EditorProvider, useEditor, SectionWrapper, AddSectionButton, SectionPicker, SortableSectionList } from "@/components/editor";
import type { SiteDTO, PageDTO, PageSectionDTO, SectionType } from "@/api";

// Inner component that uses editor context
function EditorContent({ 
    site, 
    currentPage, 
    initialSections,
    router 
}: { 
    site: SiteDTO; 
    currentPage: PageDTO | null;
    initialSections: PageSectionDTO[];
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
        addSection
    } = useEditor();
    
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Initialize sections in context when loaded
    useEffect(() => {
        setSections(initialSections);
    }, [initialSections, setSections]);

    // Get user ID for save operations
    const user = getUserFromToken();
    const userId = user?.userId || 0;

    // Handle save - pass both userId and pageId for reorder API
    const handleSave = async () => {
        const pageId = currentPage?.id || 0;
        console.log("handleSave initiated", { userId, pageId, hasPendingChanges });
        
        if (!userId) {
            console.error("No userId found in handleSave aborting");
            setSaveMessage({ type: "error", text: "Authentication error: Please log in again." });
            return;
        }

        const result = await saveAllChanges(userId, pageId);
        if (result.success) {
            setSaveMessage({ type: "success", text: "Changes saved!" });
        } else {
            console.error("Save failed result:", result);
            setSaveMessage({ type: "error", text: result.error || "Failed to save" });
        }
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
    };

    // Handle cancel - discard all pending changes
    const handleCancel = () => {
        setSections(initialSections);
        setSaveMessage({ type: "success", text: "Changes discarded" });
        setTimeout(() => setSaveMessage(null), 2000);
    };

    // Section picker state
    const [showSectionPicker, setShowSectionPicker] = useState(false);
    const [insertPosition, setInsertPosition] = useState<number>(0);

    // Handle add section
    const handleAddSection = async (sectionType: SectionType, variant: string) => {
        console.log("handleAddSection called with:", { sectionType, variant, currentPageId: currentPage?.id });

        if (!currentPage?.id) {
            console.error("Missing currentPage.id");
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
                console.warn(`Unknown section type: ${sectionType}, using empty config`);
                // Try to provide minimal valid config based on type? 
                defaultConfig = { title: "New Section" };
                break;
        }

        console.log("Generated defaultConfig:", defaultConfig);
        console.log("Calling addSection context method...");

        try {
            // Optimistic update via context
            await addSection(
                sectionType,
                variant,
                currentPage.id, // Pass pageId
                insertPosition,
                defaultConfig // Use the default config
            );
            
            console.log("addSection returned (async/sync)");

            // Reset insert position
            setInsertPosition(0);
            
            // Scroll to bottom if we added at the end, or find a way to scroll to new section
            // For now, just show success message
            setSaveMessage({ type: "success", text: "Section added!" });
            setTimeout(() => setSaveMessage(null), 2000);
            
        } catch (error) {
            console.error("Failed to add section:", error);
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
                    {/* Hide site name on mobile when in edit mode to reduce clutter */}
                    <div className={isEditMode ? "hidden md:block" : ""}>
                        <h1 className="font-semibold text-sm">{site?.name}</h1>
                        <p className="text-xs text-slate-400">Home</p> 
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
                                        <SectionRenderer section={section} />
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
        </div>
    );
}

// Main page component
export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const domain = decodeURIComponent(params.domain as string);
    
    // State
    const [site, setSite] = useState<SiteDTO | null>(null);
    const [currentPage, setCurrentPage] = useState<PageDTO | null>(null);
    const [sections, setSections] = useState<PageSectionDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSiteData = async () => {
            try {
                const user = getUserFromToken();
                if (!user ||!user.userId) {
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

                // 2. Fetch Pages (to find Home) or Create if none
                const pagesRes = await getPagesBySite({ site: { id: foundSite.id, user: { id: user.userId } } });
                
                let homePage: PageDTO | null = null;

                if (pagesRes.data && pagesRes.data.length > 0) {
                    // Default to first page (usually Home)
                    homePage = pagesRes.data[0];
                } else {
                    // No pages found - Create Default 'Home' Page
                    console.log("No pages found, creating default Home page...");
                    const createParams = {
                        site: { id: foundSite.id, user: { id: user.userId } },
                        name: "Home",
                        slug: "home"
                    };
                    
                    const createRes = await createPage(createParams);
                    if (createRes.data) {
                        homePage = createRes.data;
                        console.log("Created default Home page:", homePage);
                    } else {
                        throw new Error(createRes.error || "Failed to create default page");
                    }
                }

                if (homePage) {
                    setCurrentPage(homePage);

                    // 3. Fetch Sections for Home Page
                    if (homePage.id) {
                        const sectionsRes = await getSections({ userId: user.userId, pageId: homePage.id });
                        if (sectionsRes.data) {
                            setSections(sectionsRes.data);
                        }
                    }
                }

            } catch (err) {
                console.error("Failed to load editor", err);
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        if (domain) {
            loadSiteData();
        }
    }, [domain, router]);

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
// ...

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
                currentPage={currentPage} 
                initialSections={sections}
                router={router}
            />
        </EditorProvider>
    );
}
