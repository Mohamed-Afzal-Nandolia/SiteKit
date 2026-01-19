"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import type { AssetDTO, AssetType } from "@/api";
import {
    getAllAssets,
    createAsset,
    deleteAsset,
    fileToBase64,
    detectAssetType,
    getAssetTypeIcon,
    getUserFromToken,
} from "@/api";

interface AssetManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect?: (asset: AssetDTO) => void;
    filterType?: AssetType;
    siteId?: number;
}

type FilterTab = "ALL" | AssetType;

const FILTER_TABS: { label: string; value: FilterTab }[] = [
    { label: "All", value: "ALL" },
    { label: "Images", value: "IMAGE" },
    { label: "Videos", value: "VIDEO" },
    { label: "PDFs", value: "PDF" },
    { label: "Documents", value: "WORD" },
    { label: "Links", value: "LINK" },
];

export function AssetManager({
    isOpen,
    onClose,
    onSelect,
    filterType,
    siteId,
}: AssetManagerProps) {
    const [mounted, setMounted] = useState(false);
    const [assets, setAssets] = useState<AssetDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [activeFilter, setActiveFilter] = useState<FilterTab>(filterType || "ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadName, setUploadName] = useState("");
    const [uploadUrl, setUploadUrl] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delete state
    const [assetToDelete, setAssetToDelete] = useState<AssetDTO | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Fetch assets
    const fetchAssets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const user = getUserFromToken();
            if (!user || user.userId === undefined) {
                setError("Not authenticated");
                return;
            }
            const userId = user.userId;
            const response = await getAllAssets({ user: { id: userId } });
            if (response.data) {
                setAssets(response.data);
            } else if (response.error) {
                setError(response.error);
            }
        } catch {
            setError("Failed to load assets");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchAssets();
        }
    }, [isOpen, fetchAssets]);

    // Filter assets
    const filteredAssets = assets.filter((asset) => {
        const matchesType = activeFilter === "ALL" || asset.assetType === activeFilter;
        const matchesSearch = !searchQuery ||
            asset.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    // Handle file upload
    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        setUploadError(null);

        try {
            const user = getUserFromToken();
            if (!user || user.userId === undefined) {
                setUploadError("Not authenticated");
                setIsUploading(false);
                return;
            }
            const userId = user.userId;
            const base64 = await fileToBase64(file);
            const assetType = detectAssetType(file.type);

            const response = await createAsset({
                user: { id: userId },
                name: file.name,
                assetType,
                fileData: base64,
                fileSize: file.size,
                mimeType: file.type,
                siteId,
            });

            if (response.data) {
                await fetchAssets();
                setShowUploadForm(false);
            } else {
                setUploadError(response.error || "Upload failed");
            }
        } catch {
            setUploadError("Failed to upload file");
        } finally {
            setIsUploading(false);
        }
    };

    // Handle URL-based asset
    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadName.trim() || !uploadUrl.trim()) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const user = getUserFromToken();
            if (!user || user.userId === undefined) {
                setUploadError("Not authenticated");
                setIsUploading(false);
                return;
            }
            const userId = user.userId;
            const response = await createAsset({
                user: { id: userId },
                name: uploadName.trim(),
                assetType: "LINK",
                url: uploadUrl.trim(),
                siteId,
            });

            if (response.data) {
                await fetchAssets();
                setShowUploadForm(false);
                setUploadName("");
                setUploadUrl("");
            } else {
                setUploadError(response.error || "Failed to add link");
            }
        } catch {
            setUploadError("Failed to add link");
        } finally {
            setIsUploading(false);
        }
    };

    // Handle drag and drop
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!assetToDelete?.id) return;

        setIsDeleting(true);
        try {
            const user = getUserFromToken();
            if (!user || user.userId === undefined) {
                setIsDeleting(false);
                setAssetToDelete(null);
                return;
            }
            const userId = user.userId;
            const response = await deleteAsset({ user: { id: userId }, id: assetToDelete.id });
            if (response.data) {
                await fetchAssets();
            }
        } catch {
            // Silently fail
        } finally {
            setIsDeleting(false);
            setAssetToDelete(null);
        }
    };

    // Handle asset selection
    const handleSelect = (asset: AssetDTO) => {
        if (onSelect) {
            // Call onSelect first to ensure state updates happen before modal closes
            onSelect(asset);
        }
        onClose();
    };

    // Format file size
    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Get asset preview
    const getAssetPreview = (asset: AssetDTO) => {
        if (asset.assetType === "IMAGE" && asset.fileData) {
            return `data:${asset.mimeType || "image/png"};base64,${asset.fileData}`;
        }
        if (asset.assetType === "IMAGE" && asset.url) {
            return asset.url;
        }
        return null;
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-slate-800 text-white rounded-2xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                    <h2 className="text-xl font-semibold">
                        {onSelect ? "Select Asset" : "Manage Assets"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-6 py-4 border-b border-slate-700 bg-slate-800/50">
                    {/* Filter Tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0 flex-shrink-0">
                        {FILTER_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveFilter(tab.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === tab.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 min-w-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={() => setShowUploadForm(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Asset
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center gap-3 text-slate-400">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading assets...
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button
                                onClick={fetchAssets}
                                className="text-blue-400 hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    ) : filteredAssets.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="M21 15l-5-5L5 21" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">
                                {searchQuery ? "No assets found" : "No assets yet"}
                            </h3>
                            <p className="text-slate-400 text-sm">
                                {searchQuery ? "Try a different search" : "Upload your first asset to get started"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {filteredAssets.map((asset) => (
                                <div
                                    key={asset.id}
                                    className={`group relative bg-slate-700 rounded-xl overflow-hidden border border-slate-600 hover:border-blue-500 transition-all ${onSelect ? "cursor-pointer" : ""
                                        }`}
                                    onClick={() => onSelect && handleSelect(asset)}
                                >
                                    {/* Preview */}
                                    <div className="aspect-square bg-slate-800 flex items-center justify-center overflow-hidden">
                                        {getAssetPreview(asset) ? (
                                            <img
                                                src={getAssetPreview(asset)!}
                                                alt={asset.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-4xl">
                                                {getAssetTypeIcon(asset.assetType)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <p className="text-sm font-medium text-white truncate" title={asset.name}>
                                            {asset.name}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {asset.assetType} {asset.fileSize ? `• ${formatFileSize(asset.fileSize)}` : ""}
                                        </p>
                                    </div>

                                    {/* Actions overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {onSelect && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelect(asset);
                                                }}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Select
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAssetToDelete(asset);
                                            }}
                                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadForm && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Add Asset</h3>

                        {/* Drag & Drop Zone */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-4 ${dragActive
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-slate-600 hover:border-slate-500"
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*,video/*,application/pdf,.doc,.docx"
                            />
                            <div className="text-4xl mb-2">📁</div>
                            <p className="text-slate-300">
                                Drag & drop a file here, or{" "}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-blue-400 hover:underline"
                                >
                                    browse
                                </button>
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                                Images, Videos, PDFs, Documents
                            </p>
                        </div>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-800 text-slate-400">or add a link</span>
                            </div>
                        </div>

                        {/* URL Form */}
                        <form onSubmit={handleUrlSubmit}>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Asset name"
                                    value={uploadName}
                                    onChange={(e) => setUploadName(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={uploadUrl}
                                    onChange={(e) => setUploadUrl(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {uploadError && (
                                <p className="text-red-400 text-sm mt-3">{uploadError}</p>
                            )}

                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUploadForm(false);
                                        setUploadName("");
                                        setUploadUrl("");
                                        setUploadError(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading || !uploadName.trim() || !uploadUrl.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                                >
                                    {isUploading ? "Adding..." : "Add Link"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {assetToDelete && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-sm p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Delete Asset</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Are you sure you want to delete &quot;{assetToDelete.name}&quot;? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAssetToDelete(null)}
                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
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
