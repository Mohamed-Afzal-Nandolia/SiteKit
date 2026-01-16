"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllSiteTemplates, createSite, createPage, addSection, getUserFromToken, getPagesBySite } from "@/api";
import { SectionRenderer } from "@/components/renderer/SectionRenderer";
import type { TemplateDTO, PageSectionDTO } from "@/api";

export default function TemplatePreviewPage() {
    const params = useParams();
    const router = useRouter();
    const templateId = Number(params.templateId);
    
    const [template, setTemplate] = useState<TemplateDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use Template State
    const [isUsingTemplate, setIsUsingTemplate] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [newSiteName, setNewSiteName] = useState("");
    const [creationStatus, setCreationStatus] = useState<string | null>(null);

    useEffect(() => {
        const fetchTemplateData = async () => {
             try {
                 setIsLoading(true);
                 // Fetch ALL templates with sections (since we don't have getTemplateById)
                 const res = await getAllSiteTemplates();
                 
                 if (res.data) {
                     const found = res.data.find(t => t.id === templateId);
                     if (found) {
                         setTemplate(found);
                     } else {
                         setError("Template not found");
                     }
                 } else if (res.error) {
                     setError(res.error);
                 }
             } catch (err) {
                 console.error("Failed to load template", err);
                 setError("Failed to load template");
             } finally {
                 setIsLoading(false);
             }
        };

        if (templateId) {
            fetchTemplateData();
        }
    }, [templateId]);

    // Helper to slugify domain - allows dots, hyphens, underscores
    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')       // Replace spaces with -
            .replace(/[^\w\-\.]+/g, '') // Remove all non-word chars (except . and -)
            .replace(/\-\-+/g, '-')     // Replace multiple - with single -
            .replace(/^[-_.]+/, '')     // Trim -, _, . from start
            .replace(/[-_.]+$/, '');    // Trim -, _, . from end
    };
    
    // Domain validation - allows simple identifiers without TLD
    // e.g. "mysite", "my-site", "my_site", "my.site" are all valid
    const isValidDomain = (domain: string) => {
        if (!domain) return false;
        // Allow single alphanumeric character
        if (domain.length === 1) {
            return /^[A-Za-z0-9]$/.test(domain);
        }
        // Allows: alphanumeric, hyphens, underscores, dots
        // Cannot start or end with special chars (-, _, .)
        // Length: 2-63 characters
        const domainRegex = /^(?![-_.])(?!.*[-_.]$)[A-Za-z0-9][A-Za-z0-9._-]{0,61}[A-Za-z0-9]$/;
        return domainRegex.test(domain);
    };

    const handleUseTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSiteName.trim() || !template) return;

        const user = getUserFromToken();
        if (!user || !user.userId) {
            alert("Please log in to create a site");
            router.push("/login");
            return;
        }

        const finalDomain = slugify(newSiteName.trim());
        
        if (!isValidDomain(finalDomain)) {
            alert("Invalid domain name. Please use only letters, numbers, hyphens, underscores, or dots.");
            return;
        }

        setIsUsingTemplate(true);
        setCreationStatus("Creating site...");

        try {
            // 1. Create Site
            const siteRes = await createSite({
                user: { id: user.userId },
                name: newSiteName,
                domain: finalDomain,
            });

            let newSiteId: number | undefined;

            if (siteRes.data?.id) {
                newSiteId = Number(siteRes.data.id);
            } else {
                // FALLBACK: If backend doesn't return ID (older version running), fetch all sites and find the specific one
                console.warn("Site created but ID not returned. Fetching latest site...");
                // Dynamically import or assume it's available via api barrel
                const { getAllSites } = await import("@/api"); 
                const sitesRes = await getAllSites({ user: { id: user.userId } });
                
                if (sitesRes.data && sitesRes.data.length > 0) {
                    // Sort by id descending (assuming higher ID is newer) or createdOn
                    const latestSite = sitesRes.data.sort((a, b) => (b.id || 0) - (a.id || 0))[0];
                    newSiteId = latestSite.id;
                }
            }

            if (!newSiteId) {
                 throw new Error("Site created but could not retrieve its ID.");
            }

            setCreationStatus("Creating pages...");

            // 2. Create Home Page (or fetch if auto-created)
            let homePageId: number;
            const pagesRes = await getPagesBySite({ site: { id: newSiteId, user: { id: user.userId } } });

            if (pagesRes.data && pagesRes.data.length > 0) {
                 homePageId = pagesRes.data[0].id!;
                 // Optional: might want to clear existing sections if any
            } else {
                const pageRes = await createPage({
                    site: { id: newSiteId, user: { id: user.userId } },
                    name: "Home",
                    slug: "/",
                });
                if (!pageRes.data?.id) throw new Error("Failed to create home page");
                homePageId = pageRes.data.id;
            }

            setCreationStatus("Applying template sections...");

            // 3. Clone Sections
            if (template.allSections && template.allSections.length > 0) {
                // Sort to ensure order
                const sortedSections = [...template.allSections].sort((a, b) => (a.position || 0) - (b.position || 0));

                for (const section of sortedSections) {
                    // Prepare config: parse if string, keep if object
                    let configObj = section.config;
                    if (section.configJson) {
                         try { configObj = JSON.parse(section.configJson); } catch {}
                    } else if (typeof section.config === 'string') {
                         try { configObj = JSON.parse(section.config); } catch {}
                    }

                    await addSection({
                        userId: user.userId,
                        pageId: homePageId,
                        sectionType: section.sectionType!,
                        variant: section.variant,
                        config: configObj as Record<string, unknown>,
                    });
                }
            }

            setCreationStatus("Done! Redirecting...");
            router.push(`/${finalDomain}/edit`);

        } catch (err) {
            console.error(err);
            alert("Failed to use template: " + (err instanceof Error ? err.message : "Unknown error"));
            setIsUsingTemplate(false);
            setCreationStatus(null);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 text-white">Loading template...</div>;
    if (error || !template) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 text-red-500">{error || "Not found"}</div>;

    // Sort sections by position
    const sortedSections = template.allSections 
        ? [...template.allSections].sort((a, b) => (a.position || 0) - (b.position || 0)) 
        : [];
        
    // Prepare sections for Renderer (handle configJson)
    const hydratedSections: PageSectionDTO[] = sortedSections.map(section => ({
        ...section,
        config: section.configJson ? JSON.parse(section.configJson) : section.config
    }));

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 relative">
             {/* Sticky Preview Header */}
            <div className="fixed top-0 left-0 right-0 z-[100] bg-slate-900 text-white px-4 h-12 flex items-center justify-between text-sm shadow-md">
                <div className="flex items-center gap-4">
                     <button 
                        onClick={() => router.back()}
                        className="opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                        <span>&larr;</span> <span className="hidden sm:inline">Back to Templates</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                    <div className="h-4 w-px bg-white/20 hidden sm:block"></div>
                    <span className="font-medium hidden sm:block">Preview: {template.name}</span>
                </div>
                
                <button 
                    onClick={() => setShowNameModal(true)}
                    className="px-3 sm:px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors shadow-lg hover:shadow-blue-500/25 whitespace-nowrap"
                >
                    Use <span className="hidden sm:inline">This Template</span>
                    <span className="sm:hidden">Template</span>
                </button>
            </div>

            {/* Main Content */}
            <main className="pt-12">
                {hydratedSections.length > 0 ? (
                    hydratedSections.map((section) => (
                        <SectionRenderer key={section.id} section={section} />
                    ))
                ) : (
                    <div className="py-20 text-center text-slate-500">
                        This template has no sections.
                    </div>
                )}
            </main>

            {/* Name Modal */}
            {showNameModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Start with {template.name}</h2>
                        <form onSubmit={handleUseTemplate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Name your new site
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="My Awesome Site"
                                    value={newSiteName}
                                    onChange={(e) => setNewSiteName(e.target.value)}
                                    autoFocus
                                    disabled={isUsingTemplate}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowNameModal(false)}
                                    disabled={isUsingTemplate}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={!newSiteName.trim() || isUsingTemplate}
                                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isUsingTemplate ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {creationStatus || "Creating..."}
                                        </>
                                    ) : (
                                        "Create Site"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
