// Authentication API Service

import { apiRequest } from "./config";
import {
    LoginRequest,
    LoginResponse,
    CreateUserRequest,
    CreateUserResponse,
    LogoutResponse,
} from "./types";
import { isTokenExpired, getValidTokenPayload, JwtPayload } from "./tokenUtils";
import { AUTH_ENDPOINTS } from "./urls";

// Token storage key
const ACCESS_TOKEN_KEY = "accessToken";

/**
 * Login user with email and password
 * POST /auth/login
 */
export async function login(credentials: LoginRequest) {
    const response = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });

    // Store access token on successful login
    if (response.data?.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
    }

    return response;
}

/**
 * Create a new user account
 * POST /auth/create-user
 */
export async function createUser(userData: CreateUserRequest) {
    const response = await apiRequest<CreateUserResponse>("/auth/create-user", {
        method: "POST",
        body: JSON.stringify(userData),
    });

    // Store access token on successful registration
    if (response.data?.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
    }

    return response;
}

/**
 * Logout current user
 * POST /auth/logout
 */
export async function logout() {
    const response = await apiRequest<LogoutResponse>("/auth/logout", {
        method: "POST",
    });

    // Clear access token regardless of response
    localStorage.removeItem(ACCESS_TOKEN_KEY);

    return response;
}

/**
 * Refresh the access token by calling the refresh endpoint
 * The backend should use the current access token to issue a new one
 * POST /auth/refresh
 */
export async function refreshAccessToken(): Promise<boolean> {
    try {
        const currentToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (!currentToken) {
            console.log("[refreshAccessToken] No access token found");
            return false;
        }

        console.log("[refreshAccessToken] Sending refresh request...");
        const response = await fetch(AUTH_ENDPOINTS.REFRESH, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentToken}`,
            },
        });

        console.log("[refreshAccessToken] Response status:", response.status);
        if (response.ok) {
            const data = await response.json();
            console.log("[refreshAccessToken] Response data:", data);
            if (data.accessToken) {
                localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error("[refreshAccessToken] Error:", error);
        return false;
    }
}

/**
 * Check if user is authenticated with a valid (non-expired) token
 * Note: This does NOT delete expired tokens - callers should try to refresh first
 */
export function isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return false;

    // Check if token is expired (but don't delete it - caller may want to refresh)
    const expired = isTokenExpired(token);
    if (expired === null || expired === true) {
        return false;
    }

    return true;
}

/**
 * Get current access token (only if valid and not expired)
 * Note: This does NOT delete expired tokens - callers should try to refresh first
 */
export function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;

    // Check if token is expired (but don't delete it - caller may want to refresh)
    const expired = isTokenExpired(token);
    if (expired === null || expired === true) {
        return null;
    }

    return token;
}

/**
 * Get user info from token payload
 */
export function getUserFromToken(): JwtPayload | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;

    return getValidTokenPayload(token);
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Force logout - clears auth and redirects to login page
 * Use when token is expired or API returns 401
 */
export function forceLogout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);

    // Only redirect if in browser and not already on login page
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
    }
}
