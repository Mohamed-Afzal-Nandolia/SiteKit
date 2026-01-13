// JWT Token Utilities

export interface JwtPayload {
    sub: string; // subject (usually email or user id)
    role?: string;
    userId?: number; // user's database ID
    iat: number; // issued at (unix timestamp)
    exp: number; // expiration (unix timestamp)
    [key: string]: unknown; // allow additional claims
}

/**
 * Decode a JWT token's payload without verification
 * Note: This does NOT verify the signature - only use for reading claims
 */
export function parseJwt(token: string): JwtPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            return null;
        }

        // Base64Url decode the payload (second part)
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );

        return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
        return null;
    }
}

/**
 * Check if a JWT token is expired
 * Returns true if expired, false if valid, null if token is invalid
 */
export function isTokenExpired(token: string): boolean | null {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) {
        return null; // Invalid token
    }

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Add a small buffer (30 seconds) to account for clock skew
    return currentTime >= payload.exp - 30;
}

/**
 * Get the token payload if the token is valid and not expired
 * Returns null if token is invalid or expired
 */
export function getValidTokenPayload(token: string): JwtPayload | null {
    const payload = parseJwt(token);
    if (!payload) {
        return null;
    }

    if (isTokenExpired(token)) {
        return null;
    }

    return payload;
}

/**
 * Get time until token expiration in milliseconds
 * Returns negative number if already expired, null if invalid token
 */
export function getTokenTimeRemaining(token: string): number | null {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) {
        return null;
    }

    const expirationMs = payload.exp * 1000;
    return expirationMs - Date.now();
}
