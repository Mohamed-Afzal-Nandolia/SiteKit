// API Base Configuration

import { isTokenExpired } from "./tokenUtils";

const API_BASE_URL = "http://localhost:8080";

// Token storage key (must match auth.ts)
const ACCESS_TOKEN_KEY = "accessToken";

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
}

/**
 * Force logout helper - clears token and redirects to login
 * Inline to avoid circular dependency with auth.ts
 */
function handleUnauthorized(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
        }
    }
}

/**
 * Try to refresh the access token using the refresh token cookie
 * This is inline to avoid circular dependency with auth.ts
 */
async function tryRefreshToken(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include", // This sends the refresh token cookie!
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.accessToken) {
                localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
                return true;
            }
        }
        return false;
    } catch {
        return false;
    }
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };

    // Get token and check if it's valid
    let token = typeof window !== "undefined"
        ? localStorage.getItem(ACCESS_TOKEN_KEY)
        : null;

    if (token) {
        // Check if token is expired before making the request
        const expired = isTokenExpired(token);
        if (expired === true || expired === null) {
            // Token expired or invalid - try to refresh it first
            const refreshed = await tryRefreshToken();
            if (!refreshed) {
                // Refresh failed - force logout
                handleUnauthorized();
                return {
                    error: "Session expired. Please log in again.",
                    status: 401,
                };
            }
            // Get the new token after refresh
            token = localStorage.getItem(ACCESS_TOKEN_KEY);
        }

        if (token) {
            defaultHeaders["Authorization"] = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
            credentials: "include", // Include cookies for refresh token
        });

        const data = await response.json().catch(() => null);

        // Handle 401 Unauthorized - token rejected by server
        if (response.status === 401) {
            handleUnauthorized();
            return {
                error: "Session expired. Please log in again.",
                status: 401,
            };
        }

        if (!response.ok) {
            return {
                error: data?.message || data?.error || `Request failed with status ${response.status}`,
                status: response.status,
            };
        }

        return {
            data: data as T,
            status: response.status,
        };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Network error occurred",
            status: 0,
        };
    }
}

export { API_BASE_URL };

