"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserFromToken, clearAuth, refreshAccessToken } from "@/api";
import type { JwtPayload } from "@/api";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function DashboardPage() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [user, setUser] = useState<JwtPayload | null>(null);

    useEffect(() => {
        // Mark as client-side rendered
        setIsClient(true);
        
        // Initialize theme from localStorage
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        
        // Check authentication with refresh attempt
        const checkAuth = async () => {
            let authenticated = isAuthenticated();
            
            if (!authenticated) {
                // Try to refresh the token first
                console.log("[Dashboard] Token expired, attempting refresh...");
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    console.log("[Dashboard] Token refreshed successfully!");
                    authenticated = true;
                } else {
                    console.log("[Dashboard] Token refresh failed, redirecting to login");
                    router.replace("/login");
                    return;
                }
            }
            
            // Get user from token
            setUser(getUserFromToken());
        };
        
        checkAuth();
    }, [router]);

    const handleLogout = () => {
        clearAuth();
        router.replace("/login");
    };

    // Show loading state until client-side hydration is complete
    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="text-slate-500 dark:text-slate-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center shadow-lg shadow-[#2563eb]/30">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                                SiteKit
                            </span>
                        </div>

                        {/* User Info & Logout */}
                        <div className="flex items-center gap-4">
                            {user && (
                                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="w-8 h-8 rounded-full bg-[#2563eb]/20 flex items-center justify-center">
                                        <span className="text-[#2563eb] font-semibold">
                                            {user.sub?.charAt(0).toUpperCase() || "U"}
                                        </span>
                                    </div>
                                    <span>{user.sub}</span>
                                    {user.role && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-[#2563eb]/10 text-[#2563eb] rounded-full">
                                            {user.role}
                                        </span>
                                    )}
                                </div>
                            )}
                            <ThemeToggle />
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium text-sm"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Card */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/20 p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/50 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-green-100 dark:bg-green-900/30 mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-green-600 dark:text-green-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Welcome to Your Dashboard! 🎉
                    </h1>

                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                        You&apos;re successfully logged in. This is your home page where you&apos;ll
                        manage your websites, templates, and account settings.
                    </p>

                    {user && (
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            <span className="text-sm">Logged in as:</span>
                            <span className="font-semibold text-[#2563eb]">{user.sub}</span>
                        </div>
                    )}
                </div>

                {/* Action Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    {/* My Websites Card - Clickable */}
                    <div
                        onClick={() => router.push("/my-websites")}
                        className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group"
                    >
                        <div className="text-4xl mb-4">🌐</div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            My Websites
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Manage your websites
                        </p>
                    </div>

                    {/* Templates Card */}
                    <div 
                        onClick={() => router.push("/templates")}
                        className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group"
                    >
                        <div className="text-4xl mb-4">📄</div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            Templates
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Browse templates
                        </p>
                    </div>

                    {/* Settings Card */}
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group">
                        <div className="text-4xl mb-4">⚙️</div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            Settings
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Account settings
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
