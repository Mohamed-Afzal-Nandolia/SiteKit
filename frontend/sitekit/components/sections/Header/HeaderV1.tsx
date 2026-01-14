"use client";

import Link from "next/link";
import React, { useState } from "react";

export interface HeaderV1Config {
    logoText?: string;
    logoImage?: string;
    navLinks?: { label: string; href: string }[];
    actionButton?: { label: string; href: string; variant?: "primary" | "secondary" | "outline" };
}

export function HeaderV1({ config }: { config: HeaderV1Config }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
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

                {/* Desktop Action & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
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

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle menu"
                    >
                         {isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                         ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                         )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-4 shadow-xl">
                    <nav className="flex flex-col space-y-4">
                        {navLinks.map((link, idx) => (
                            <Link 
                                key={idx} 
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="block text-base font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    
                    {actionButton && (
                         <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                             <Link
                                href={actionButton.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block w-full text-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                    actionButton.variant === "outline" 
                                        ? "border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            >
                                {actionButton.label}
                            </Link>
                         </div>
                    )}
                </div>
            )}
        </header>
    );
}
