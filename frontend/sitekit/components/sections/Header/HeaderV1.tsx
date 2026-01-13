import Link from "next/link";
import React from "react";

export interface HeaderV1Config {
    logoText?: string;
    logoImage?: string;
    navLinks?: { label: string; href: string }[];
    actionButton?: { label: string; href: string; variant?: "primary" | "secondary" | "outline" };
}

export function HeaderV1({ config }: { config: HeaderV1Config }) {
    const { 
        logoText = "Brand", 
        navLinks = [], 
        actionButton 
    } = config || {};

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex-shrink-0 font-bold text-xl text-slate-900 dark:text-white">
                    {logoText}
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link, idx) => (
                        <Link 
                            key={idx} 
                            href={link.href}
                            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Action Button */}
                <div className="flex items-center gap-4">
                    {actionButton && (
                        <Link
                            href={actionButton.href}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                actionButton.variant === "outline" 
                                    ? "border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
                            }`}
                        >
                            {actionButton.label}
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
