// Authentication API Service

import { apiRequest } from "./config";
import {
    LoginRequest,
    LoginResponse,
    CreateUserRequest,
    CreateUserResponse,
    LogoutResponse,
} from "./types";

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
        localStorage.setItem("accessToken", response.data.accessToken);
    }

    return response;
}

/**
 * Create a new user account
 * POST /api/v1/create-user
 */
export async function createUser(userData: CreateUserRequest) {
    const response = await apiRequest<CreateUserResponse>("/api/v1/create-user", {
        method: "POST",
        body: JSON.stringify(userData),
    });

    // Store access token on successful registration
    if (response.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
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
    localStorage.removeItem("accessToken");

    return response;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("accessToken");
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
    localStorage.removeItem("accessToken");
}
