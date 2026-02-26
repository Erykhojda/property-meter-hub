// Mock data for SCORE (Appartme) frontend — emptied for real backend integration

export const inwestorzy: any[] = [];
export const inwestycje: any[] = [];
export const budynki: any[] = [];
export const lokale: any[] = [];

export type MediaType = "woda" | "cieplo" | "energia";
export type DataQuality = "validated" | "estimated" | "missing";

export const mierniki: any[] = [];
export const punktyPomiarowe: any[] = [];

// Helper functions kept for potential type reference, but returning empty
export function generateReadings(days: number = 30) { return []; }
export function generateUnitReadings(lokalId: string, days: number = 30) { return []; }
export const buildingConsumption: any[] = [];
export function generateMonthlyReadings() { return []; }
export const apartmentConsumption: any[] = [];

export const zarzadcy: any[] = [];
export const zarzadcaPrzypisania: any[] = [];
export const syncLogi: any[] = [];

export type TransferStatus = "pending" | "sent" | "accepted" | "rejected";
export const strukturaTransfery: any[] = [];

export type ValidationResult = { budynek_id: string; budynek_nazwa: string; adres_ok: boolean; lokale_ok: boolean; mierniki_ok: boolean; bledy: string[] };
export const walidacjaWyniki: ValidationResult[] = [];

export const harmonogramImportu = {
  aktywny: false,
  czestotliwosc: "codziennie",
  godzina: "00:00",
  ostatni_import: new Date().toISOString(),
  nastepny_import: new Date().toISOString(),
  retry_count: 0,
  retry_delay_min: 0,
};

export const auditLogi: any[] = [];
