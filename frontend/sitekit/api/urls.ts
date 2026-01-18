// Centralized URL Configuration
// All API endpoints and URLs are defined here for easy management

// Base API URL - change this when deploying to different environments
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// API Version Base Path
export const API_V1 = "/api/v1";

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    CREATE_USER: `${API_BASE_URL}/auth/create-user`,
} as const;

// Site Endpoints
export const SITE_ENDPOINTS = {
    CREATE_SITE: `${API_V1}/create-site`,
    UPDATE_SITE: `${API_V1}/update-site`,
    DELETE_SITE: `${API_V1}/delete-site`,
    GET_ALL_SITE: `${API_V1}/get-all-site`,
    GET_SITE_BY_ID: `${API_V1}/get-site`,
    UPDATE_SITE_STATUS: `${API_V1}/update-site-status`,
    UPDATE_SITE_NAME: `${API_V1}/update-site-name`,
    UPDATE_SITE_DOMAIN: `${API_V1}/update-site-domain`,
} as const;

// Template Endpoints
export const TEMPLATE_ENDPOINTS = {
    GET_ALL_TEMPLATES: `${API_V1}/get-all-templates`,
    GET_ALL_SITE_TEMPLATES: `${API_V1}/get-all-site-templates`,
} as const;

// Page Endpoints
export const PAGE_ENDPOINTS = {
    CREATE_PAGE: `${API_V1}/create-page`,
    GET_PAGE_BY_SITE_ID: `${API_V1}/get-page`,
    GET_PAGE_BY_SLUG: `${API_V1}/get-page/slug`,
    DELETE_PAGE: `${API_V1}/delete-page`,
} as const;

// Page Section Endpoints
export const SECTION_ENDPOINTS = {
    ADD_SECTION: `${API_V1}/add-section`,
    GET_SECTIONS: `${API_V1}/get-sections`,
    UPDATE_SECTION: `${API_V1}/update-section`,
    DELETE_SECTION: `${API_V1}/delete-section`,
    REORDER_SECTIONS: `${API_V1}/reorder-sections`,
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
