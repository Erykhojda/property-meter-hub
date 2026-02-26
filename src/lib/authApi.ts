/**
 * Auth-related API calls against appartme-service.
 * Matches the existing appartme-service endpoints:
 *   POST /auth        – login (email + password_hash SHA-256 hex, 64 chars)
 *   DELETE /auth      – logout  (requires Bearer)
 *   POST /refresh     – refresh token
 */

import { apiFetch } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Raw response from POST /auth in appartme-service */
interface RawLoginResponse {
    access_token: string;
    refresh_token?: string;
}

/** Normalised login result used by the store */
export interface LoginResponse {
    token: string;
    refreshToken: string;
    /** User UUID extracted from JWT payload (identity field) */
    user_id: string;
    /** system_role_id mapped to string role — requires fetching /users/:id  */
    role?: "admin" | "manager";
    email?: string;
    name?: string;
}

export interface BuildingAssignment {
    id: string;
    budynek_id: string;
    nazwa: string;
    adres: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** SHA-256 hash of a plain-text password, returned as lowercase hex string (64 chars). */
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/** Decode the `identity` (userId) from a JWT without verifying signature. */
function extractIdentity(token: string): string {
    try {
        const [, payload] = token.split(".");
        const decoded = JSON.parse(atob(payload));
        return decoded.identity ?? "";
    } catch {
        return "";
    }
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<LoginResponse> {
    const password_hash = await hashPassword(password);
    const raw = await apiFetch<RawLoginResponse>("/api/v1/auth", {
        method: "POST",
        body: JSON.stringify({ email, password_hash }),
    });

    const token = raw.access_token;
    const refreshToken = raw.refresh_token ?? "";
    const user_id = extractIdentity(token);

    // Fetch user profile to get name, email, and role
    let name: string | undefined;
    let role: "admin" | "manager" = "manager";

    if (user_id) {
        try {
            const userProfile = await apiFetch<{
                name?: string;
                email?: string;
                system_role_id?: number;
            }>(`/api/v1/users/${user_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            name = userProfile?.name;
            // system_role_id: 1 = Admin, 2 = User (manager)
            role = userProfile?.system_role_id === 1 ? "admin" : "manager";
        } catch {
            // Non-critical — fall back to defaults
        }
    }

    return { token, refreshToken, user_id, name, email, role };
}

export async function logout(): Promise<void> {
    return apiFetch<void>("/api/v1/auth", { method: "DELETE" });
}

export async function refreshToken(token: string): Promise<LoginResponse> {
    const raw = await apiFetch<RawLoginResponse>("/api/v1/refresh", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
    const newToken = raw.access_token;
    const user_id = extractIdentity(newToken);
    return { token: newToken, refreshToken: raw.refresh_token ?? token, user_id };
}

// ─── Manager scope ────────────────────────────────────────────────────────────

/**
 * Fetch buildings assigned to the current manager.
 * Backed by appartme-service GET /api/v1/manager/buildings (Phase 2).
 * Falls back gracefully when the endpoint does not exist yet.
 */
export async function getMyBuildings(): Promise<BuildingAssignment[]> {
    try {
        return await apiFetch<BuildingAssignment[]>("/api/v1/manager/buildings");
    } catch {
        // Endpoint not yet deployed — return empty so the UI falls back to mock
        return [];
    }
}
