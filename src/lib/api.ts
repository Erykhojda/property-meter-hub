/**
 * Central HTTP client for property-meter-hub.
 * Automatically attaches Bearer token and handles 401 by clearing auth.
 */

const getBaseUrl = () =>
    (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

type LogoutFn = () => void;
let _onUnauthorized: LogoutFn | null = null;

/** Register a callback to invoke when a 401 is received (usually store dispatch LOGOUT). */
export function registerUnauthorizedHandler(fn: LogoutFn) {
    _onUnauthorized = fn;
}

export async function apiFetch<T = unknown>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("auth_token");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${getBaseUrl()}${path}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        _onUnauthorized?.();
        throw new ApiError(401, "Unauthorized");
    }

    if (!response.ok) {
        let message = response.statusText;
        try {
            const body = await response.json();
            message = body?.message ?? body?.error ?? message;
        } catch {
            // ignore JSON parse errors
        }
        throw new ApiError(response.status, message);
    }

    // 204 No Content
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}
