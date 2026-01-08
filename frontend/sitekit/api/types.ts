// Authentication API Types

export interface LoginRequest {
    emailAddress: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    accessToken: string;
}

export interface CreateUserRequest {
    name: string;
    emailAddress: string;
    password: string;
}

export interface CreateUserResponse {
    accessToken: string;
}

export interface LogoutResponse {
    message?: string;
}
