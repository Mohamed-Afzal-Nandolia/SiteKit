// API Base Configuration

const API_BASE_URL = "http://localhost:8080";

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };

    // Add auth token if available
    const token = typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
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
