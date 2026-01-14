"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllSiteTemplates } from "@/api"; // Use endpoint that returns sections
import type { TemplateDTO } from "@/api";
import { TemplateCardPreview } from "@/components/previews/TemplateCardPreview";

export default function TemplatesPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<TemplateDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                // Fetch ALL templates with sections so we can render previews
                const res = await getAllSiteTemplates();
                if (res.data) {
                    setTemplates(res.data);
                } else if (res.error) {
                    setError(res.error);
                }
            } catch (err) {
                console.error("Failed to load templates", err);
                setError("Failed to load templates");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
             {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                         <button 
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors cursor-pointer group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Templates</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">
                        {error}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        No templates found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {templates.map((template) => (
                            <div key={template.id} className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                {/* Live Preview Area */}
                                <div className="aspect-video bg-slate-100 dark:bg-slate-900 relative overflow-hidden group-hover:opacity-100 transition-opacity border-b border-slate-100 dark:border-slate-800">
                                    <TemplateCardPreview sections={template.allSections} />
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        {template.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md font-medium">
                                            {template.category}
                                        </span>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <Link 
                                            href={`/templates/${template.id}`}
                                            className="flex-1 py-2.5 px-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-sm text-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            View Full Preview
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
