"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { isAuthenticated, getUserFromToken, clearAuth, forceLogout, refreshAccessToken } from "@/api";
import type { JwtPayload } from "@/api";

interface AuthContextType {
    isLoggedIn: boolean;
    user: JwtPayload | null;
    isLoading: boolean;
    logout: () => void;
    checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<JwtPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        console.log("[AuthProvider] Checking auth...");
        let authenticated = isAuthenticated();
        console.log("[AuthProvider] isAuthenticated:", authenticated);
        
        // If not authenticated, try to refresh the token
        if (!authenticated) {
            console.log("[AuthProvider] Token invalid/expired, trying refresh...");
            const refreshed = await refreshAccessToken();
            console.log("[AuthProvider] Refresh result:", refreshed);
            if (refreshed) {
                authenticated = true;
            }
        }
        
        setIsLoggedIn(authenticated);
        console.log("[AuthProvider] isLoggedIn set to:", authenticated);
        
        if (authenticated) {
            setUser(getUserFromToken());
        } else {
            setUser(null);
        }
    }, []);

    const handleLogout = useCallback(() => {
        clearAuth();
        setIsLoggedIn(false);
        setUser(null);
        // Redirect to login
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }, []);

    // Check auth on mount
    useEffect(() => {
        console.log("[AuthProvider] Mounted, checking auth...");
        checkAuth().then(() => {
            setIsLoading(false);
        });
    }, [checkAuth]);

    // Listen for storage events (cross-tab logout sync)
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "accessToken") {
                checkAuth();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [checkAuth]);

    // Proactive token refresh every 90 seconds (1.5 minutes)
    // Since access token expires in 2 minutes, this keeps it fresh
    useEffect(() => {
        if (!isLoggedIn) return;

        const interval = setInterval(async () => {
            console.log("[AuthProvider] Proactively refreshing token...");
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                console.log("[AuthProvider] Token refreshed successfully!");
                checkAuth(); // Update the auth state with new token
            } else {
                console.log("[AuthProvider] Token refresh failed, logging out");
                forceLogout();
            }
        }, 270000); // 270 seconds = 4.5 minutes

        return () => clearInterval(interval);
    }, [isLoggedIn, checkAuth]);

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                user,
                isLoading,
                logout: handleLogout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
