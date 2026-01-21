"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllSites, getPagesBySite, getUserFromToken, createPage } from "@/api";

// This page redirects to the correct page-specific URL for public view
// /domain -> /domain/home
export default function SiteRedirectPage() {
    const params = useParams();
    const router = useRouter();
    const domain = decodeURIComponent(params.domain as string);

    useEffect(() => {
        const redirect = async () => {
            try {
                const user = getUserFromToken();
                if (!user?.userId) {
                    router.push("/login");
                    return;
                }

                // Get site by domain
                const allSitesRes = await getAllSites({ user: { id: user.userId } });
                if (!allSitesRes.data) {
                    router.push("/my-websites");
                    return;
                }

                const site = allSitesRes.data.find(s => s.domain === domain);
                if (!site?.id) {
                    router.push("/my-websites");
                    return;
                }

                // Get pages for site
                const pagesRes = await getPagesBySite({ site: { id: site.id, user: { id: user.userId } } });
                
                let targetSlug = "home";
                
                if (pagesRes.data && pagesRes.data.length > 0) {
                    // Prioritize "home" page, otherwise use first page
                    const homePage = pagesRes.data.find(p => p.slug === "home");
                    if (homePage) {
                        targetSlug = "home";
                    } else {
                        // No "home" page found, use first page
                        targetSlug = pagesRes.data[0].slug || "home";
                    }
                } else {
                    // Create home page if none exist
                    const createRes = await createPage({
                        site: { id: site.id, user: { id: user.userId } },
                        name: "Home",
                        slug: "home"
                    });
                    if (createRes.data?.slug) {
                        targetSlug = createRes.data.slug;
                    }
                }

                // Redirect to the page-specific URL
                router.replace(`/${domain}/${targetSlug}`);
            } catch {
                router.push("/my-websites");
            }
        };

        redirect();
    }, [domain, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-slate-500">Loading site...</p>
            </div>
        </div>
    );
}
