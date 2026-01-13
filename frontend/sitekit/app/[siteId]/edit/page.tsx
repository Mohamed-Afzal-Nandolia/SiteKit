"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSiteById, getPagesBySite, getSections, getUserFromToken } from "@/api";
import { SectionRenderer } from "@/components/renderer/SectionRenderer";
import type { SiteDTO, PageDTO, PageSectionDTO } from "@/api";

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const siteId = Number(params.siteId);
    
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

                // 1. Fetch Site Info
                const siteRes = await getSiteById({ id: siteId, user: { id: user.userId } });
                if (siteRes.error || !siteRes.data) {
                    throw new Error(siteRes.error || "Failed to load site");
                }
                setSite(siteRes.data);

                // 2. Fetch Pages (to find Home)
                const pagesRes = await getPagesBySite({ site: { id: siteId, user: { id: user.userId } } });
                if (pagesRes.data && pagesRes.data.length > 0) {
                    // Default to first page (usually Home)
                    const homePage = pagesRes.data[0];
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

        if (siteId) {
            loadSiteData();
        }
    }, [siteId, router]);

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

    if (error) {
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

    // Sort sections
    const sortedSections = [...sections].sort((a, b) => (a.position || 0) - (b.position || 0));

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
                    <div>
                        <h1 className="font-semibold text-sm">{site?.name}</h1>
                        <p className="text-xs text-slate-400">Home</p> 
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                        <button className="p-1.5 bg-slate-700 rounded text-blue-400" title="Desktop"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg></button>
                        <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Tablet"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg></button>
                        <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Mobile"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg></button>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded text-sm font-semibold transition-colors">
                        Save
                    </button>
                </div>
            </header>

            {/* Canvas Area */}
            <main className="flex-1 bg-slate-100 dark:bg-slate-900 overflow-y-auto relative">
                <div className="min-h-full bg-white dark:bg-black shadow-2xl mx-auto transition-all duration-300 w-full" style={{ maxWidth: '100%' }}>
                     {/* Render Sections */}
                    {sortedSections.length > 0 ? (
                        sortedSections.map((section) => (
                            <SectionRenderer key={section.id} section={section} />
                        ))
                    ) : (
                        <div className="py-40 flex flex-col items-center justify-center text-slate-400">
                            <p>Empty Page</p>
                            <button className="mt-4 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors">
                                + Add Section
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
