/**
 * Shared export utilities for EPC-02 (Bmeters JSON) and EPC-05 (consumption CSV).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BudynekForExport {
    id: string;
    nazwa: string;
    adres: string;
    miasto: string;
    kod_pocztowy: string;
}

export interface LokalForExport {
    id: string;
    budynek_id: string;
    numer: string;
    pietro: number;
    powierzchnia: number;
    typ: string;
}

export interface MiernikForExport {
    id: string;
    lokal_id: string;
    device_id: string;
    typ: string;
    nazwa: string;
    data_instalacji: string;
}

// ─── EPC-02: Bmeters JSON payload ────────────────────────────────────────────

export function buildBmetersPayload(
    budynek: BudynekForExport,
    lokale: LokalForExport[],
    mierniki: MiernikForExport[]
) {
    const budynekLokale = lokale.filter((l) => l.budynek_id === budynek.id);

    return {
        budynek: {
            id: budynek.id,
            nazwa: budynek.nazwa,
            adres: budynek.adres,
            miasto: budynek.miasto,
            kod_pocztowy: budynek.kod_pocztowy,
        },
        lokale: budynekLokale.map((l) => ({
            id: l.id,
            numer: l.numer,
            pietro: l.pietro,
            powierzchnia: l.powierzchnia,
            typ: l.typ,
            mierniki: mierniki
                .filter((m) => m.lokal_id === l.id)
                .map((m) => ({
                    device_id: m.device_id,
                    typ: m.typ,
                    nazwa: m.nazwa,
                    data_instalacji: m.data_instalacji,
                })),
        })),
        exported_at: new Date().toISOString(),
    };
}

export function downloadJson(data: unknown, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });
    triggerDownload(blob, filename);
}

// ─── EPC-05: Consumption CSV rows ────────────────────────────────────────────

export interface CsvApartmentRow {
    lokal_id: string;
    numer: string;           // Nr lokalu
    device_id: string;       // Nr seryjny miernika
    typ: string;             // Typ medium
    poprzedni: number;       // Poprzedni odczyt
    aktualny: number;        // Aktualny odczyt
    zuzycie: number;         // Zużycie łącznie
    jakosc: string;          // Status jakości
}

/**
 * Builds CSV rows from apartment + meter data + fetched readings for a given date range.
 * "Previous reading" = first reading in range; accumulates daily deltas to produce current.
 */
export function buildConsumptionCsvRows(
    apartments: { lokal_id: string; numer: string }[],
    mierniki: MiernikForExport[],
    getReadingsForApt: (lokalId: string) => {
        date: string; typ: string; wartosc: number; jakosc?: string; device_id?: string;
    }[],
    dateFrom: string,
    dateTo: string
): CsvApartmentRow[] {
    const rows: CsvApartmentRow[] = [];

    for (const apt of apartments) {
        const aptMierniki = mierniki.filter((m) => m.lokal_id === apt.lokal_id);
        if (aptMierniki.length === 0) continue;

        const allReadings = getReadingsForApt(apt.lokal_id);

        // Filter to requested date range
        const rangeReadings = allReadings.filter((r) => r.date >= dateFrom && r.date <= dateTo);

        // Group by meter type
        const byTyp: Record<string, typeof rangeReadings> = {};
        for (const r of rangeReadings) {
            if (!byTyp[r.typ]) byTyp[r.typ] = [];
            byTyp[r.typ].push(r);
        }

        for (const m of aptMierniki) {
            const readings = (byTyp[m.typ] ?? [])
                .filter(r => r.device_id === m.device_id || !r.device_id) // Match device if provided
                .sort((a, b) => a.date.localeCompare(b.date));

            if (readings.length === 0) continue;

            const poprzedni = readings[0].wartosc;
            const zuzycie = +readings.reduce((sum, r) => sum + r.wartosc, 0).toFixed(2);
            const aktualny = +(poprzedni + zuzycie).toFixed(2);

            // Determine dominant quality
            const qualityCounts = { validated: 0, estimated: 0, missing: 0 } as Record<string, number>;
            readings.forEach((r) => {
                const q = r.jakosc ?? "validated";
                qualityCounts[q] = (qualityCounts[q] ?? 0) + 1;
            });
            const jakosc = Object.entries(qualityCounts).sort((a, b) => b[1] - a[1])[0][0];

            const qualityLabel: Record<string, string> = {
                validated: "Zweryfikowany",
                estimated: "Oszacowany",
                missing: "Brak danych",
            };

            rows.push({
                lokal_id: apt.lokal_id,
                numer: apt.numer,
                device_id: m.device_id,
                typ: m.typ,
                poprzedni,
                aktualny,
                zuzycie,
                jakosc: qualityLabel[jakosc] ?? jakosc,
            });
        }
    }

    return rows;
}

export function downloadCsv(rows: CsvApartmentRow[], filename: string) {
    const header = ["Nr lokalu", "Nr seryjny miernika", "Typ medium", "Poprzedni odczyt", "Aktualny odczyt", "Zużycie łącznie", "Status jakości"];
    const csvRows = [
        header,
        ...rows.map((r) => [
            r.numer,
            r.device_id,
            r.typ,
            String(r.poprzedni),
            String(r.aktualny),
            String(r.zuzycie),
            r.jakosc,
        ]),
    ];

    const content = csvRows
        .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, filename);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
