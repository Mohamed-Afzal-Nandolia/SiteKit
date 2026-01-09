// Authentication API Types

export interface LoginRequest {
    emailAddress: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
}

export interface CreateUserRequest {
    username: string;
    emailAddress: string;
    password: string;
}

export interface CreateUserResponse {
    accessToken: string;
    refreshToken?: string;
}

export interface LogoutResponse {
    message?: string;
}
