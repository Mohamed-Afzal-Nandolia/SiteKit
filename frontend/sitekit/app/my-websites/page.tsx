"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
    isAuthenticated, 
    getUserFromToken, 
    refreshAccessToken,
    getAllSites,
    createSite,
    deleteSite,
    updateSite,
} from "@/api";
import type { JwtPayload, SiteDTO } from "@/api";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function MyWebsitesPage() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [user, setUser] = useState<JwtPayload | null>(null);
    
    // Site management state
    const [sites, setSites] = useState<SiteDTO[]>([]);
    const [isLoadingSites, setIsLoadingSites] = useState(true);
    const [sitesError, setSitesError] = useState<string | null>(null);
    
    // Create site modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSiteName, setNewSiteName] = useState("");
    const [newSiteDomain, setNewSiteDomain] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    // Delete confirmation state
    const [siteToDelete, setSiteToDelete] = useState<SiteDTO | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");

    // Dropdown menu state
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Rename modal state
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [siteToRename, setSiteToRename] = useState<SiteDTO | null>(null);
    const [renameName, setRenameName] = useState("");
    const [renameDomain, setRenameDomain] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameError, setRenameError] = useState<string | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Only close if dropdown is open and click is outside
            if (openDropdownId !== null && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [openDropdownId]);



    // Fetch all sites for the user
    const fetchSites = useCallback(async (userId: number) => {
        setIsLoadingSites(true);
        setSitesError(null);
        
        try {
            const response = await getAllSites({ user: { id: userId } });
            if (response.data) {
                setSites(response.data);
            } else if (response.error) {
                setSitesError(response.error);
            }
        } catch (error) {
            setSitesError("Failed to fetch sites");
            console.error("Error fetching sites:", error);
        } finally {
            setIsLoadingSites(false);
        }
    }, []);

    useEffect(() => {
        setIsClient(true);
        
        // Initialize theme
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        
        // Check authentication
        const checkAuth = async () => {
            let authenticated = isAuthenticated();
            
            if (!authenticated) {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    authenticated = true;
                } else {
                    router.replace("/login");
                    return;
                }
            }
            
            const userData = getUserFromToken();
            setUser(userData);
            
            if (userData?.userId) {
                fetchSites(userData.userId);
            }
        };
        
        checkAuth();
    }, [router, fetchSites]);

    // Handle creating a new site
    const handleCreateSite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.userId || !newSiteName.trim()) return;

        setIsCreating(true);
        setCreateError(null);

        try {
            const response = await createSite({
                user: { id: user.userId },
                name: newSiteName.trim(),
                domain: newSiteDomain.trim(),
            });

            if (response.data) {
                await fetchSites(user.userId);
                setShowCreateModal(false);
                setNewSiteName("");
                setNewSiteDomain("");
            } else if (response.error) {
                setCreateError(response.error);
            }
        } catch (error) {
            setCreateError("Failed to create site");
            console.error("Error creating site:", error);
        } finally {
            setIsCreating(false);
        }
    };

    // Handle deleting a site
    const handleDeleteSite = async () => {
        if (!user?.userId || !siteToDelete?.id) return;

        setIsDeleting(true);

        try {
            const response = await deleteSite({
                user: { id: user.userId },
                id: siteToDelete.id,
            });

            if (response.data) {
                await fetchSites(user.userId);
                setSiteToDelete(null);
            }
        } catch (error) {
            console.error("Error deleting site:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle updating a site
    const handleUpdateSite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.userId || !siteToRename?.id || !renameName.trim() || !renameDomain.trim()) return;

        setIsRenaming(true);
        setRenameError(null);

        try {
            const response = await updateSite({
                user: { id: user.userId },
                id: siteToRename.id,
                name: renameName.trim(),
                domain: renameDomain.trim(),
            });

            if (response.data) {
                await fetchSites(user.userId);
                setShowRenameModal(false);
                setSiteToRename(null);
                setRenameName("");
                setRenameDomain("");
            } else if (response.error) {
                setRenameError(response.error);
            }
        } catch (error) {
            setRenameError("Failed to update site");
            console.error("Error updating site:", error);
        } finally {
            setIsRenaming(false);
        }
    };

    // Open rename modal
    const handleRenameClick = (site: SiteDTO) => {
        setSiteToRename(site);
        setRenameName(site.name || "");
        setRenameDomain(site.domain || "");
        setShowRenameModal(true);
        setOpenDropdownId(null);
    };

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Get status badge color
    const getStatusColor = (status?: string) => {
        switch (status) {
            case "PUBLISHED":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "ARCHIVED":
                return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
            default:
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        }
    };

    // Filter sites based on search query
    const filteredSites = sites.filter(site => 
        site.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.domain?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isClient) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-slate-500 dark:text-slate-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo & Back */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Back to Dashboard"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                                </svg>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-[#2563eb] flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                        <path d="M2 17l10 5 10-5" />
                                        <path d="M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <span className="text-lg font-semibold text-slate-900 dark:text-white hidden sm:block">
                                    SiteKit
                                </span>
                            </div>
                        </div>

                        {/* User & Theme */}
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            {user && (
                                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="w-8 h-8 rounded-full bg-[#2563eb]/20 flex items-center justify-center">
                                        <span className="text-[#2563eb] font-semibold text-sm">
                                            {user.sub?.charAt(0).toUpperCase() || "U"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                            Sites
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            View and manage all your websites in one place.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563eb] text-white font-medium hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-[#2563eb]/25 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Create New Site
                    </button>
                </div>

                {/* Sites Table Container */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {filteredSites.length} site{filteredSites.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] text-sm"
                            />
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoadingSites ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading sites...
                            </div>
                        </div>
                    ) : sitesError ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="text-red-500 dark:text-red-400 mb-2">{sitesError}</div>
                                <button
                                    onClick={() => user?.userId && fetchSites(user.userId)}
                                    className="text-[#2563eb] hover:underline text-sm cursor-pointer"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    ) : filteredSites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <line x1="3" y1="9" x2="21" y2="9" />
                                    <line x1="9" y1="21" x2="9" y2="9" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                {searchQuery ? "No sites found" : "No sites yet"}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                                {searchQuery ? "Try a different search term" : "Create your first site to get started"}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors cursor-pointer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Create New Site
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Last Updated
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {filteredSites.map((site) => (
                                            <tr 
                                                key={site.id} 
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                            {site.name?.charAt(0).toUpperCase() || "S"}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-slate-900 dark:text-white truncate">
                                                                {site.name}
                                                            </div>
                                                            {site.domain && (
                                                                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                                    {site.domain}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(site.siteStatus)}`}>
                                                        {site.siteStatus || "DRAFT"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {formatDate(site.lastUpdatedOn)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {formatDate(site.createdOn)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="relative inline-block" ref={openDropdownId === site.id ? dropdownRef : null}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenDropdownId(openDropdownId === site.id ? null : site.id!);
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
                                                            title="Options"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                                <circle cx="12" cy="5" r="2" />
                                                                <circle cx="12" cy="12" r="2" />
                                                                <circle cx="12" cy="19" r="2" />
                                                            </svg>
                                                        </button>
                                                        
                                                        {/* Dropdown Menu */}
                                                        {openDropdownId === site.id && (
                                                            <div 
                                                                className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRenameClick(site);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                                    </svg>
                                                                    Rename
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSiteToDelete(site);
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <polyline points="3 6 5 6 21 6" />
                                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                                    </svg>
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredSites.map((site) => (
                                    <div 
                                        key={site.id}
                                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                    {site.name?.charAt(0).toUpperCase() || "S"}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-slate-900 dark:text-white truncate">
                                                        {site.name}
                                                    </div>
                                                    {site.domain && (
                                                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                            {site.domain}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(site.siteStatus)}`}>
                                                            {site.siteStatus || "DRAFT"}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            {formatDate(site.lastUpdatedOn)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative" ref={openDropdownId === site.id ? dropdownRef : null}>
                                                <button
                                                    onClick={() => setOpenDropdownId(openDropdownId === site.id ? null : site.id!)}
                                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg cursor-pointer"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                        <circle cx="12" cy="5" r="2" />
                                                        <circle cx="12" cy="12" r="2" />
                                                        <circle cx="12" cy="19" r="2" />
                                                    </svg>
                                                </button>
                                                
                                                {openDropdownId === site.id && (
                                                    <div 
                                                        className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRenameClick(site);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                            Rename
                                                        </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSiteToDelete(site);
                                                                    setOpenDropdownId(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <polyline points="3 6 5 6 21 6" />
                                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                                </svg>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Rename Site Modal */}
            {showRenameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            Rename Site
                        </h2>
                        
                        <form onSubmit={handleUpdateSite}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Site Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={renameName}
                                        onChange={(e) => setRenameName(e.target.value)}
                                        placeholder="My Awesome Website"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb]"
                                        required
                                        autoFocus
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Domain *
                                    </label>
                                    <input
                                        type="text"
                                        value={renameDomain}
                                        onChange={(e) => setRenameDomain(e.target.value)}
                                        placeholder="mywebsite.com"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb]"
                                        required
                                    />
                                </div>

                                {renameError && (
                                    <div className="text-sm text-red-500 dark:text-red-400">
                                        {renameError}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRenameModal(false);
                                        setSiteToRename(null);
                                        setRenameName("");
                                        setRenameDomain("");
                                        setRenameError(null);
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRenaming || !renameName.trim() || !renameDomain.trim()}
                                    className="flex-1 px-4 py-3 rounded-xl bg-[#2563eb] text-white font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isRenaming ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Site Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            Create New Site
                        </h2>
                        
                        <form onSubmit={handleCreateSite}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Site Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newSiteName}
                                        onChange={(e) => setNewSiteName(e.target.value)}
                                        placeholder="My Awesome Website"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb]"
                                        required
                                        autoFocus
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Domain *
                                    </label>
                                    <input
                                        type="text"
                                        value={newSiteDomain}
                                        onChange={(e) => setNewSiteDomain(e.target.value)}
                                        placeholder="mywebsite.com"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb]"
                                        required
                                    />
                                </div>

                                {createError && (
                                    <div className="text-sm text-red-500 dark:text-red-400">
                                        {createError}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewSiteName("");
                                        setNewSiteDomain("");
                                        setCreateError(null);
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || !newSiteName.trim() || !newSiteDomain.trim()}
                                    className="flex-1 px-4 py-3 rounded-xl bg-[#2563eb] text-white font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isCreating ? "Creating..." : "Create Site"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {siteToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>
                        
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
                            Delete Site?
                        </h2>
                        
                        <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                            Are you sure you want to delete <strong>&quot;{siteToDelete?.name}&quot;</strong>? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setSiteToDelete(null)}
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteSite}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
