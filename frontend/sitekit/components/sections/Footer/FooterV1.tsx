import Link from "next/link";
import React from "react";

export interface FooterLink {
    label: string;
    href: string;
}

export interface FooterColumn {
    title: string;
    links: FooterLink[];
}

export interface FooterV1Config {
    brandName?: string;
    description?: string;
    columns?: FooterColumn[];
    copyrightText?: string;
}

export function FooterV1({ config }: { config: FooterV1Config }) {
    const {
        brandName = "SiteKit",
        description = "Building the web, one block at a time.",
        columns = [],
        copyrightText = "© 2024 SiteKit. All rights reserved."
    } = config || {};

    return (
        <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="font-bold text-xl text-slate-900 dark:text-white mb-4">
                            {brandName}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            {description}
                        </p>
                    </div>

                    {columns.map((col, idx) => (
                        <div key={idx} className="col-span-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{col.title}</h3>
                            <ul className="space-y-3">
                                {col.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link 
                                            href={link.href}
                                            className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
                    {copyrightText}
                </div>
            </div>
        </footer>
    );
}
