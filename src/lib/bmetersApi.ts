/**
 * Frontend client for bmeters data via the appartme-service proxy.
 * All calls go to appartme-service (/api/v1/bmeters/*) which forwards
 * them to bmeters-backend with the API credentials injected server-side.
 */

import { apiFetch } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BmetersStatus {
    status: string;
    version?: string;
    uptime?: number;
    [key: string]: unknown;
}

export interface ImportJob {
    id: string;
    created_at: string;
    status: "success" | "partial" | "failed" | "running";
    budynki_count?: number;
    rekordy_count?: number;
    bledy_count?: number;
    czas_ms?: number;
    szczegoly?: string;
    [key: string]: unknown;
}

export interface AuditLogEntry {
    id: string;
    created_at: string;
    user?: string;
    akcja?: string;
    encja?: string;
    szczegoly?: string;
    action?: string;
    entity?: string;
    details?: string;
    [key: string]: unknown;
}

export interface ImportJobsResponse {
    jobs: ImportJob[];
    total?: number;
}

export interface Measurement {
    timestamp: string;
    radio_number: string;
    device_number: string;
    data_quality: string;
    // Common fields
    city?: string;
    street_and_staircase?: string;
    flat_number?: string;
    customer_id?: string;
    // Water specifics
    value?: number;
    volume_at_date?: number;
    // Heat specifics
    heat_energy?: number;
    volume?: number;
    supply_temp?: number;
    return_temp?: number;
    temp_diff?: number;
    power?: number;
    inst_flow?: number;
    // Allocator specifics
    actual_consumption?: number;
    actual_units?: number;
    previous_consumption?: number;
    [key: string]: unknown;
}

export interface GetReadingsParams {
    radioNumber?: string;
    deviceNumber?: string;
    from?: string;
    to?: string;
    limit?: number;
}

export interface GetJobsParams {
    limit?: number;
    offset?: number;
    status?: string;
}

export interface GetAuditParams {
    limit?: number;
    offset?: number;
    action?: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

const DIRECT_BMETERS_URL = "http://localhost:7310";

/** GET /api/v1/healthcheck */
export async function getBmetersStatus(): Promise<BmetersStatus> {
    const res = await fetch(`${DIRECT_BMETERS_URL}/api/v1/healthcheck`);
    return res.json();
}

/** GET /api/v1/imports/jobs */
export async function getBmetersJobs(
    params: GetJobsParams = {}
): Promise<ImportJob[]> {
    const qs = new URLSearchParams(
        Object.fromEntries(
            Object.entries(params)
                .filter(([, v]) => v !== undefined)
                .map(([k, v]) => [k, String(v)])
        )
    ).toString();
    const path = `${DIRECT_BMETERS_URL}/api/v1/imports/jobs${qs ? `?${qs}` : ""}`;
    const res = await fetch(path).then(r => r.json());
    if (res.data && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return res.jobs ?? [];
}

/** POST /api/v1/imports/trigger */
export async function triggerImport(): Promise<void> {
    await fetch(`${DIRECT_BMETERS_URL}/api/v1/imports/trigger`, { method: "POST" });
}

/** GET /api/v1/audit/logs */
export async function getAuditLogs(
    params: GetAuditParams = {}
): Promise<AuditLogEntry[]> {
    const qs = new URLSearchParams(
        Object.fromEntries(
            Object.entries(params)
                .filter(([, v]) => v !== undefined)
                .map(([k, v]) => [k, String(v)])
        )
    ).toString();
    const path = `${DIRECT_BMETERS_URL}/api/v1/audit/logs${qs ? `?${qs}` : ""}`;
    const res = await fetch(path).then(r => r.json());
    if (res.data && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return res.logs ?? [];
}

/** GET /api/v1/readings/:type */
export async function getBmetersReadings(
    type: "allocator" | "heat" | "water",
    params: GetReadingsParams = {}
): Promise<Measurement[]> {
    const qs = new URLSearchParams(
        Object.fromEntries(
            Object.entries(params)
                .filter(([, v]) => v !== undefined)
                .map(([k, v]) => [k, String(v)])
        )
    ).toString();
    const path = `${DIRECT_BMETERS_URL}/api/v1/readings/${type}${qs ? `?${qs}` : ""}`;
    const res = await fetch(path).then(r => r.json());
    if (res.data && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
}
