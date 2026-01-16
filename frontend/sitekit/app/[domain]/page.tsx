"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllSites, getPagesBySite, getSections, getUserFromToken } from "@/api";
import { SectionRenderer } from "@/components/renderer/SectionRenderer";
import type { SiteDTO, PageDTO, PageSectionDTO } from "@/api";

export default function SiteViewPage() {
    const params = useParams();
    const router = useRouter();
    // domain can be either the actual domain string or an ID if routing used ID
    const domainOrId = params.domain as string;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [site, setSite] = useState<SiteDTO | null>(null);
    const [sections, setSections] = useState<PageSectionDTO[]>([]);

    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                // Get user for API calls
                const user = getUserFromToken();
                if (!user || !user.userId) {
                    setError("You must be logged in to view this site preview.");
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                
                // 1. Find the site by domain (or ID) within the user's sites
                const res = await getAllSites({ user: { id: user.userId } });
                
                if (res.data) {
                    const found = res.data.find(s => s.domain === domainOrId || s.id?.toString() === domainOrId);
                    if (found) {
                        setSite(found);
                        
                        // 2. Fetch Home Page
                        const pagesRes = await getPagesBySite({ site: { id: found.id!, user: { id: user.userId! } } });
                        
                        if (pagesRes.data) {
                            const homePage = pagesRes.data.find(p => p.slug === "/") || pagesRes.data[0];
                            
                            if (homePage && homePage.id) {
                                // 3. Fetch Sections
                                const sectionsRes = await getSections({ userId: user.userId, pageId: homePage.id });
                                if (sectionsRes.data) {
                                    setSections(sectionsRes.data);
                                }
                            }
                        }
                    } else {
                        setError("Site not found");
                    }
                } else if (res.error) {
                    setError(res.error);
                }
            } catch (err) {
                console.error("Failed to load site", err);
                setError("Failed to load site.");
            } finally {
                setIsLoading(false);
            }
        };

        if (domainOrId) {
            fetchSiteData();
        }
    }, [domainOrId]);


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !site) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-4">
                <h1 className="text-2xl font-bold mb-2">Site Not Found</h1>
                <p className="text-slate-500 mb-6">{error || "We couldn't find the site you're looking for."}</p>
                <button 
                    onClick={() => router.push("/dashboard")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
            <main>
                {sections.length > 0 ? (
                    sections.map((section) => (
                        <SectionRenderer key={section.id} section={section} />
                    ))
                ) : (
                    <div className="py-20 text-center text-slate-500">
                        This site has no content yet.
                    </div>
                )}
            </main>
        </div>
    );
}
