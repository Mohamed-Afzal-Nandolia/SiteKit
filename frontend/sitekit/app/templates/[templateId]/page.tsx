"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllSiteTemplates } from "@/api";
import { SectionRenderer } from "@/components/renderer/SectionRenderer";
import type { TemplateDTO, PageSectionDTO } from "@/api";

export default function TemplatePreviewPage() {
    const params = useParams();
    const router = useRouter();
    const templateId = Number(params.templateId);
    
    const [template, setTemplate] = useState<TemplateDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !template) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-red-500">
                {error || "Template not found"}
            </div>
        );
    }

    // Sort sections by position
    const sortedSections = template.allSections 
        ? [...template.allSections].sort((a, b) => (a.position || 0) - (b.position || 0)) 
        : [];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 relative">
             {/* Sticky Preview Header */}
            <div className="fixed top-0 left-0 right-0 z-[100] bg-slate-900 text-white px-4 h-12 flex items-center justify-between text-sm shadow-md">
                <div className="flex items-center gap-4">
                     <button 
                        onClick={() => router.back()}
                        className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                        &larr; Back to Templates
                    </button>
                    <div className="h-4 w-px bg-white/20"></div>
                    <span className="font-medium">Preview: {template.name}</span>
                </div>
                
                <button 
                    disabled
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Use This Template
                </button>
            </div>

            {/* Main Content (Padded for header) */}
            <main className="pt-12">
                {sortedSections.length > 0 ? (
                    sortedSections.map((section) => (
                        <SectionRenderer key={section.id} section={section} />
                    ))
                ) : (
                    <div className="py-20 text-center text-slate-500">
                        This template has no sections.
                    </div>
                )}
            </main>
        </div>
    );
}
