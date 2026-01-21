"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { PageDTO, SiteDTO } from "@/api";
import {
    getPagesBySite,
    createPage,
    deletePage,
    getUserFromToken,
} from "@/api";

interface PageManagerProps {
    isOpen: boolean;
    onClose: () => void;
    site: SiteDTO;
    currentPage: PageDTO | null;
    onPageSelect: (page: PageDTO) => void;
    onPagesChanged: () => void;
}

export function PageManager({
    isOpen,
    onClose,
    site,
    currentPage,
    onPageSelect,
    onPagesChanged,
}: PageManagerProps) {
    const [mounted, setMounted] = useState(false);
    const [pages, setPages] = useState<PageDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create page state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPageName, setNewPageName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    // Delete state
    const [pageToDelete, setPageToDelete] = useState<PageDTO | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Fetch pages
    const fetchPages = useCallback(async () => {
        if (!site?.id) return;

        setIsLoading(true);
        setError(null);

        try {
            const user = getUserFromToken();
            if (!user || user.userId === undefined) {
                setError("Not authenticated");
                return;
            }

            const response = await getPagesBySite({
                site: { id: site.id, user: { id: user.userId } }
            });

            if (response.data) {
                setPages(response.data);
            } else if (response.error) {
                setError(response.error);
            }
        } catch {
            setError("Failed to load pages");
        } finally {
            setIsLoading(false);
        }
    }, [site?.id]);

    useEffect(() => {
        if (isOpen) {
            fetchPages();
        }
    }, [isOpen, fetchPages]);

    // Auto-generate slug from name
    const generateSlug = (name: string): string => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    };

    // Handle create page
    const handleCreatePage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPageName.trim() || !site?.id) return;

        setIsCreating(true);
        setCreateError(null);

        try {
            const user = getUserFromToken();
            if (!user || user.userId === undefined) {
                setCreateError("Not authenticated");
                setIsCreating(false);
                return;
            }

            const slug = generateSlug(newPageName);

            // Check if slug already exists
            const existingPage = pages.find(p => p.slug === slug);
            if (existingPage) {
                setCreateError(`A page with slug "${slug}" already exists`);
                setIsCreating(false);
                return;
            }

            const response = await createPage({
                site: { id: site.id, user: { id: user.userId } },
                name: newPageName.trim(),
                slug: slug,
            });

            if (response.data) {
                await fetchPages();
                setNewPageName("");
                setShowCreateForm(false);
                onPagesChanged();
            } else {
                setCreateError(response.error || "Failed to create page");
            }
        } catch {
            setCreateError("Failed to create page");
        } finally {
            setIsCreating(false);
        }
    };

    // Handle delete page
    const handleDeletePage = async () => {
        if (!pageToDelete?.id) return;

        // Prevent deleting the last page
        if (pages.length <= 1) {
            setPageToDelete(null);
            return;
        }

        setIsDeleting(true);

        try {
            const user = getUserFromToken();
            if (!user || user.userId === undefined) {
                setIsDeleting(false);
                setPageToDelete(null);
                return;
            }

            const response = await deletePage({
                site: { user: { id: user.userId } },
                id: pageToDelete.id,
            });

            if (response.data) {
                await fetchPages();
                onPagesChanged();

                // If deleted the current page, switch to first available
                if (currentPage?.id === pageToDelete.id) {
                    const remaining = pages.filter(p => p.id !== pageToDelete.id);
                    if (remaining.length > 0) {
                        onPageSelect(remaining[0]);
                    }
                }
            }
        } catch {
            // Silently fail
        } finally {
            setIsDeleting(false);
            setPageToDelete(null);
        }
    };

    // Handle page selection
    const handleSelectPage = (page: PageDTO) => {
        onPageSelect(page);
        onClose();
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Manage Pages
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Create New Page Section */}
                    {!showCreateForm ? (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add New Page
                        </button>
                    ) : (
                        <form onSubmit={handleCreatePage} className="mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Page Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newPageName}
                                        onChange={(e) => setNewPageName(e.target.value)}
                                        placeholder="e.g., About Us"
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                </div>
                                {newPageName && (
                                    <p className="text-xs text-slate-500">
                                        Slug: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{generateSlug(newPageName)}</code>
                                    </p>
                                )}
                                {createError && (
                                    <p className="text-sm text-red-500">{createError}</p>
                                )}
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewPageName("");
                                        setCreateError(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || !newPageName.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    {isCreating ? "Creating..." : "Create Page"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Pages List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-3 text-slate-500">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading pages...
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-500 mb-2">{error}</p>
                            <button onClick={fetchPages} className="text-blue-500 hover:underline text-sm">
                                Try again
                            </button>
                        </div>
                    ) : pages.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No pages found. Create your first page above.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pages.map((page) => (
                                <div
                                    key={page.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                                        currentPage?.id === page.id
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                                    }`}
                                    onClick={() => handleSelectPage(page)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {page.name}
                                            </span>
                                            {currentPage?.id === page.id && (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                                                    Current
                                                </span>
                                            )}
                                            {page.status && (
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                    page.status === "PUBLISHED"
                                                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                                        : page.status === "DRAFT"
                                                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                                }`}>
                                                    {page.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            /{page.slug}
                                        </p>
                                    </div>
                                    {pages.length > 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPageToDelete(page);
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete page"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-xs text-slate-500 text-center">
                        Click on a page to switch to it
                    </p>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {pageToDelete && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Delete Page</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                            Are you sure you want to delete &quot;{pageToDelete.name}&quot;? All sections in this page will be deleted. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPageToDelete(null)}
                                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePage}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
}
