// Centralized URL Configuration
// All API endpoints and URLs are defined here for easy management

// Base API URL - change this when deploying to different environments
export const API_BASE_URL = "http://localhost:8080";

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    CREATE_USER: `${API_BASE_URL}/auth/create-user`,
} as const;

// Frontend Routes (for navigation/redirects)
export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    SIGNUP: "/signup",
    DASHBOARD: "/dashboard",
    FORGOT_PASSWORD: "/forgot-password",
    TERMS: "/terms",
    PRIVACY: "/privacy",
} as const;
