"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, refreshAccessToken } from "@/api";

interface AuthGuardProps {
    children: React.ReactNode;
    /** If true, redirect authenticated users to dashboard (for login/signup pages) */
    redirectIfAuthenticated?: boolean;
    /** If true, redirect unauthenticated users to login (for protected pages) */
    requireAuth?: boolean;
}

/**
 * AuthGuard component for handling auth-based redirects
 * Use redirectIfAuthenticated for login/signup pages
 * Use requireAuth for protected pages like dashboard
 */
export function AuthGuard({ 
    children, 
    redirectIfAuthenticated = false,
    requireAuth = false 
}: AuthGuardProps) {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Initialize theme
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        const checkAuth = async () => {
            let authenticated = isAuthenticated();

            // If not authenticated but requireAuth, try to refresh the token first
            if (!authenticated && requireAuth) {
                console.log("[AuthGuard] Token expired, attempting refresh...");
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    console.log("[AuthGuard] Token refreshed successfully!");
                    authenticated = true;
                } else {
                    console.log("[AuthGuard] Token refresh failed, redirecting to login");
                }
            }

            if (redirectIfAuthenticated && authenticated) {
                // User is logged in but trying to access login/signup - redirect to dashboard
                router.replace("/dashboard");
                return;
            }

            if (requireAuth && !authenticated) {
                // User is not logged in but trying to access protected page - redirect to login
                router.replace("/login");
                return;
            }

            // No redirect needed, show the page
            setIsReady(true);
        };

        checkAuth();
    }, [router, redirectIfAuthenticated, requireAuth]);

    if (!isReady) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="text-slate-500 dark:text-slate-400">Loading...</div>
            </div>
        );
    }

    return <>{children}</>;
}

