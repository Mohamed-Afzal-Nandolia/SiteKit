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
        let authenticated = isAuthenticated();
        
        // If not authenticated, try to refresh the token
        if (!authenticated) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                authenticated = true;
            }
        }
        
        setIsLoggedIn(authenticated);
        
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
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                checkAuth(); // Update the auth state with new token
            } else {
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
