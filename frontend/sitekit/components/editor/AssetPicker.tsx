"use client";

import React, { useState } from "react";
import { AssetManager } from "./AssetManager";
import type { AssetDTO, AssetType } from "@/api";
import { getAssetTypeIcon } from "@/api";

interface AssetPickerProps {
    value?: string; // Current URL/value
    onChange: (url: string, asset?: AssetDTO) => void;
    filterType?: AssetType;
    siteId?: number;
    label?: string;
    placeholder?: string;
}

/**
 * AssetPicker - A button/input that opens the AssetManager for selection
 * Use this component in section editors to select assets
 */
export function AssetPicker({
    value,
    onChange,
    filterType,
    siteId,
    label,
    placeholder = "Select an asset...",
}: AssetPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (asset: AssetDTO) => {
        // If asset has file data, create a data URL
        if (asset.fileData) {
            const dataUrl = `data:${asset.mimeType || "application/octet-stream"};base64,${asset.fileData}`;
            onChange(dataUrl, asset);
        } else if (asset.url) {
            onChange(asset.url, asset);
        }
    };

    return (
        <div>
            {label && (
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
            )}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm transition-colors flex items-center gap-1"
                    title="Open Asset Manager"
                >
                    <span>{filterType ? getAssetTypeIcon(filterType) : "📁"}</span>
                </button>
            </div>

            <AssetManager
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSelect={handleSelect}
                filterType={filterType}
                siteId={siteId}
            />
        </div>
    );
}

/**
 * ImagePicker - Specialized picker for images with preview
 */
interface ImagePickerProps {
    value?: string;
    onChange: (url: string, asset?: AssetDTO) => void;
    siteId?: number;
    label?: string;
}

export function ImagePicker({
    value,
    onChange,
    siteId,
    label = "Image",
}: ImagePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (asset: AssetDTO) => {
        if (asset.fileData) {
            const dataUrl = `data:${asset.mimeType || "image/png"};base64,${asset.fileData}`;
            onChange(dataUrl, asset);
        } else if (asset.url) {
            onChange(asset.url, asset);
        }
    };

    return (
        <div>
            <label className="block text-xs text-slate-400 mb-1">{label}</label>

            {/* Preview */}
            <div
                className="w-full aspect-video bg-slate-700 rounded-lg border border-slate-600 overflow-hidden mb-2 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => setIsOpen(true)}
            >
                {value ? (
                    <img
                        src={value}
                        alt="Selected"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <span className="text-2xl mb-1">🖼️</span>
                        <span className="text-xs">Click to select image</span>
                    </div>
                )}
            </div>

            {/* URL Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Image URL..."
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition-colors"
                >
                    Browse
                </button>
            </div>

            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="mt-2 text-xs text-red-400 hover:text-red-300"
                >
                    Remove image
                </button>
            )}

            <AssetManager
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSelect={handleSelect}
                filterType="IMAGE"
                siteId={siteId}
            />
        </div>
    );
}
