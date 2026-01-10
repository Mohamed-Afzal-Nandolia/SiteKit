// API Exports

// Config
export { apiRequest } from "./config";

// URLs
export { API_BASE_URL, AUTH_ENDPOINTS, ROUTES } from "./urls";

// Types
export type {
    LoginRequest,
    LoginResponse,
    CreateUserRequest,
    CreateUserResponse,
    LogoutResponse,
} from "./types";

// Token Utilities
export {
    parseJwt,
    isTokenExpired,
    getValidTokenPayload,
    getTokenTimeRemaining,
} from "./tokenUtils";
export type { JwtPayload } from "./tokenUtils";

// Auth Service
export {
    login,
    createUser,
    logout,
    refreshAccessToken,
    isAuthenticated,
    getAccessToken,
    getUserFromToken,
    clearAuth,
    forceLogout,
} from "./auth";

