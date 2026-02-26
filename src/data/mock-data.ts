// Mock data for SCORE (Appartme) frontend — extended with Bmeters alarm fields

export const inwestorzy = [
  { id: "inv-1", nazwa: "Grupa Deweloperska ABC", nip: "1234567890", adres: "ul. Warszawska 10, Kraków", kontakt: "biuro@abc-dev.pl" },
  { id: "inv-2", nazwa: "Polski Dom S.A.", nip: "9876543210", adres: "ul. Krakowska 5, Warszawa", kontakt: "info@polskidom.pl" },
];

export const inwestycje = [
  { id: "inw-1", inwestor_id: "inv-1", nazwa: "Osiedle Słoneczne", opis: "Kompleks mieszkalny premium" },
  { id: "inw-2", inwestor_id: "inv-1", nazwa: "Park Zielony", opis: "Osiedle ekologiczne" },
  { id: "inw-3", inwestor_id: "inv-2", nazwa: "Centrum Mieszkalne", opis: "Apartamentowiec w centrum" },
];

export const budynki = [
  { id: "bud-1", inwestycja_id: "inw-1", nazwa: "Budynek A", adres: "ul. Słoneczna 1", miasto: "Kraków", kod_pocztowy: "30-001", liczba_lokali: 24 },
  { id: "bud-2", inwestycja_id: "inw-1", nazwa: "Budynek B", adres: "ul. Słoneczna 2", miasto: "Kraków", kod_pocztowy: "30-001", liczba_lokali: 18 },
  { id: "bud-3", inwestycja_id: "inw-2", nazwa: "Budynek C", adres: "ul. Parkowa 5", miasto: "Kraków", kod_pocztowy: "30-100", liczba_lokali: 32 },
  { id: "bud-4", inwestycja_id: "inw-3", nazwa: "Wieża Centralna", adres: "ul. Główna 12", miasto: "Warszawa", kod_pocztowy: "00-001", liczba_lokali: 48 },
];

export const lokale = [
  { id: "lok-1", budynek_id: "bud-1", numer: "1A", pietro: 0, powierzchnia: 45.5, typ: "mieszkanie" },
  { id: "lok-2", budynek_id: "bud-1", numer: "1B", pietro: 0, powierzchnia: 62.0, typ: "mieszkanie" },
  { id: "lok-3", budynek_id: "bud-1", numer: "2A", pietro: 1, powierzchnia: 45.5, typ: "mieszkanie" },
  { id: "lok-4", budynek_id: "bud-1", numer: "2B", pietro: 1, powierzchnia: 62.0, typ: "mieszkanie" },
  { id: "lok-5", budynek_id: "bud-1", numer: "3A", pietro: 2, powierzchnia: 55.0, typ: "mieszkanie" },
  { id: "lok-6", budynek_id: "bud-2", numer: "1A", pietro: 0, powierzchnia: 38.0, typ: "mieszkanie" },
  { id: "lok-7", budynek_id: "bud-2", numer: "1B", pietro: 0, powierzchnia: 52.0, typ: "mieszkanie" },
  { id: "lok-8", budynek_id: "bud-3", numer: "1A", pietro: 0, powierzchnia: 70.0, typ: "mieszkanie" },
  { id: "lok-9", budynek_id: "bud-4", numer: "1A", pietro: 0, powierzchnia: 85.0, typ: "apartament" },
];

export type MediaType = "woda" | "cieplo" | "energia";
export type DataQuality = "validated" | "estimated" | "missing";

export const mierniki = [
  {
    id: "m-1", lokal_id: "lok-1", device_id: "BM-W-001", typ: "woda" as MediaType, nazwa: "Wodomierz zimna", data_instalacji: "2024-01-15", status: "active", last_sync_at: "2025-02-20T10:30:00",
    alarmDevice: false, alarmBattery: false, alarmDamagedCable: false, alarmOverflow: false, alarmReverseInstallation: false
  },
  {
    id: "m-2", lokal_id: "lok-1", device_id: "BM-C-001", typ: "cieplo" as MediaType, nazwa: "Ciepłomierz", data_instalacji: "2024-01-15", status: "active", last_sync_at: "2025-02-20T10:30:00",
    alarmDevice: false, alarmBattery: true, alarmDamagedCable: false, alarmOverflow: false, alarmReverseInstallation: false
  },
  {
    id: "m-3", lokal_id: "lok-1", device_id: "BM-E-001", typ: "energia" as MediaType, nazwa: "Licznik energii", data_instalacji: "2024-01-15", status: "active", last_sync_at: "2025-02-20T10:30:00",
    alarmDevice: false, alarmBattery: false, alarmDamagedCable: false, alarmOverflow: false, alarmReverseInstallation: false
  },
  {
    id: "m-4", lokal_id: "lok-2", device_id: "BM-W-002", typ: "woda" as MediaType, nazwa: "Wodomierz zimna", data_instalacji: "2024-02-01", status: "active", last_sync_at: "2025-02-19T08:15:00",
    alarmDevice: false, alarmBattery: false, alarmDamagedCable: false, alarmOverflow: false, alarmReverseInstallation: false
  },
  {
    id: "m-5", lokal_id: "lok-2", device_id: "BM-C-002", typ: "cieplo" as MediaType, nazwa: "Ciepłomierz", data_instalacji: "2024-02-01", status: "active", last_sync_at: "2025-02-19T08:15:00",
    alarmDevice: true, alarmBattery: false, alarmDamagedCable: true, alarmOverflow: false, alarmReverseInstallation: false
  },
  {
    id: "m-6", lokal_id: "lok-3", device_id: "BM-W-003", typ: "woda" as MediaType, nazwa: "Wodomierz zimna", data_instalacji: "2024-03-10", status: "inactive", last_sync_at: "2025-01-05T12:00:00",
    alarmDevice: false, alarmBattery: true, alarmDamagedCable: false, alarmOverflow: false, alarmReverseInstallation: false
  },
  {
    id: "m-7", lokal_id: "lok-6", device_id: "BM-W-006", typ: "woda" as MediaType, nazwa: "Wodomierz zimna", data_instalacji: "2024-06-01", status: "active", last_sync_at: "2025-02-20T09:00:00",
    alarmDevice: false, alarmBattery: false, alarmDamagedCable: false, alarmOverflow: false, alarmReverseInstallation: false
  },
  {
    id: "m-8", lokal_id: "lok-9", device_id: "BM-E-009", typ: "energia" as MediaType, nazwa: "Licznik energii", data_instalacji: "2024-04-15", status: "active", last_sync_at: "2025-02-20T11:00:00",
    alarmDevice: false, alarmBattery: false, alarmDamagedCable: false, alarmOverflow: false, alarmReverseInstallation: false
  },
];

// Punkty pomiarowe — automatycznie tworzone na bazie mierników
export const punktyPomiarowe = mierniki.map((m) => ({
  id: `pp-${m.id}`,
  miernik_id: m.id,
  nazwa: `${m.nazwa} — PP`,
  typ: m.typ,
  jednostka: m.typ === "woda" ? "m³" : "kWh",
}));


// Generate time-series readings for charts
export function generateReadings(days: number = 30) {
  const readings: { date: string; woda: number; cieplo: number; energia: number; quality: DataQuality }[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const qualities: DataQuality[] = ["validated", "estimated", "missing"];
    readings.push({
      date: d.toISOString().split("T")[0],
      woda: +(3 + Math.random() * 4).toFixed(2),
      cieplo: +(15 + Math.random() * 10).toFixed(2),
      energia: +(8 + Math.random() * 6).toFixed(2),
      quality: qualities[Math.floor(Math.random() * 10) < 7 ? 0 : Math.floor(Math.random() * 10) < 9 ? 1 : 2],
    });
  }
  return readings;
}

// Generate unit-level detail readings (per punkt pomiarowy)
export function generateUnitReadings(lokalId: string, days: number = 30) {
  const lokalMierniki = mierniki.filter((m) => m.lokal_id === lokalId);
  const readings: { date: string; punkt_id: string; typ: MediaType; wartosc: number; jednostka: string; jakosc: DataQuality }[] = [];
  const now = new Date();
  const qualities: DataQuality[] = ["validated", "estimated", "missing"];
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    for (const m of lokalMierniki) {
      const pp = punktyPomiarowe.find((p) => p.miernik_id === m.id);
      if (!pp) continue;
      const base = m.typ === "woda" ? 3 : m.typ === "cieplo" ? 15 : 8;
      const range = m.typ === "woda" ? 4 : m.typ === "cieplo" ? 10 : 6;
      readings.push({
        date: dateStr,
        punkt_id: pp.id,
        typ: m.typ,
        wartosc: +(base + Math.random() * range).toFixed(2),
        jednostka: pp.jednostka,
        jakosc: qualities[Math.floor(Math.random() * 10) < 7 ? 0 : Math.floor(Math.random() * 10) < 9 ? 1 : 2],
      });
    }
  }
  return readings;
}

// Building-level aggregated consumption
export const buildingConsumption = budynki.map((b, i) => ({
  budynek_id: b.id,
  nazwa: b.nazwa,
  woda: +(80 + i * 23 + 47).toFixed(1),
  cieplo: +(400 + i * 87 + 53).toFixed(1),
  energia: +(200 + i * 61 + 29).toFixed(1),
  vs_prev: {
    woda: +(-8 + Math.random() * 20 - 2).toFixed(1),
    cieplo: +(-5 + Math.random() * 15 - 3).toFixed(1),
    energia: +(-10 + Math.random() * 18 - 1).toFixed(1),
  },
  quality_ratio: { validated: 72, estimated: 20, missing: 8 },
}));

// 12-month history for area chart
export function generateMonthlyReadings() {
  const result: { month: string; woda: number; cieplo: number; energia: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("pl-PL", { month: "short", year: "2-digit" });
    result.push({
      month: label,
      woda: +(60 + Math.random() * 80 + (i < 4 ? 20 : 0)).toFixed(1),
      cieplo: +(200 + Math.random() * 300 + (i > 5 ? 80 : 0)).toFixed(1),
      energia: +(150 + Math.random() * 150).toFixed(1),
    });
  }
  return result;
}


// Apartment consumption for drill-down
export const apartmentConsumption = lokale.map((l) => ({
  lokal_id: l.id,
  budynek_id: l.budynek_id,
  numer: l.numer,
  pietro: l.pietro,
  woda: +(2 + Math.random() * 8).toFixed(2),
  cieplo: +(10 + Math.random() * 30).toFixed(2),
  energia: +(5 + Math.random() * 15).toFixed(2),
  woda_quality: (["validated", "estimated", "missing"] as DataQuality[])[Math.floor(Math.random() * 2)],
  cieplo_quality: (["validated", "estimated", "missing"] as DataQuality[])[Math.floor(Math.random() * 2)],
  energia_quality: (["validated", "estimated", "missing"] as DataQuality[])[Math.floor(Math.random() * 3)],
}));

export const zarzadcy = [
  { id: "z-1", full_name: "Jan Kowalski", email: "jan.kowalski@example.com", telefon: "+48 600 100 200", firma: "Kowalski Zarządzanie Sp. z o.o.", nip_firmy: "6781234567", status: "active" as const },
  { id: "z-2", full_name: "Anna Nowak", email: "anna.nowak@example.com", telefon: "+48 601 200 300", firma: "NovaDom Zarządzanie", nip_firmy: "9452345678", status: "active" as const },
  { id: "z-3", full_name: "Piotr Wiśniewski", email: "piotr.w@example.com", telefon: "+48 602 300 400", firma: "ProBuild Management", nip_firmy: "1133456789", status: "active" as const },
];

// Historia przypisań zarządców do budynków (data_od/data_do)
export const zarzadcaPrzypisania = [
  { id: "zp-1", zarzadca_id: "z-1", budynek_id: "bud-1", data_od: "2024-01-01", data_do: null },
  { id: "zp-2", zarzadca_id: "z-1", budynek_id: "bud-2", data_od: "2024-01-01", data_do: null },
  { id: "zp-3", zarzadca_id: "z-2", budynek_id: "bud-3", data_od: "2024-03-15", data_do: null },
  { id: "zp-4", zarzadca_id: "z-3", budynek_id: "bud-4", data_od: "2024-06-01", data_do: null },
  { id: "zp-5", zarzadca_id: "z-1", budynek_id: "bud-3", data_od: "2023-06-01", data_do: "2024-03-14" },
];

export const syncLogi = [
  { id: "s-1", created_at: "2025-02-20T10:30:00", status: "success" as const, budynki_count: 4, rekordy_count: 256, bledy_count: 0, czas_ms: 1230, szczegoly: "Import zakończony pomyślnie" },
  { id: "s-2", created_at: "2025-02-19T10:30:00", status: "partial" as const, budynki_count: 4, rekordy_count: 198, bledy_count: 12, czas_ms: 2450, szczegoly: "12 odczytów odrzuconych — brak punktu pomiarowego" },
  { id: "s-3", created_at: "2025-02-18T10:30:00", status: "success" as const, budynki_count: 4, rekordy_count: 261, bledy_count: 0, czas_ms: 1180, szczegoly: "Import zakończony pomyślnie" },
  { id: "s-4", created_at: "2025-02-17T10:30:00", status: "failed" as const, budynki_count: 0, rekordy_count: 0, bledy_count: 4, czas_ms: 340, szczegoly: "Błąd połączenia z API Bmeters (timeout)" },
  { id: "s-5", created_at: "2025-02-16T10:30:00", status: "success" as const, budynki_count: 4, rekordy_count: 244, bledy_count: 0, czas_ms: 1310, szczegoly: "Import zakończony pomyślnie" },
];

// Status przekazania struktury do Bmeters
export type TransferStatus = "pending" | "sent" | "accepted" | "rejected";
export const strukturaTransfery = [
  { id: "st-1", budynek_id: "bud-1", status: "accepted" as TransferStatus, data: "2025-02-15T09:00:00", szczegoly: "Struktura zaakceptowana przez Bmeters" },
  { id: "st-2", budynek_id: "bud-2", status: "accepted" as TransferStatus, data: "2025-02-15T09:01:00", szczegoly: "Struktura zaakceptowana przez Bmeters" },
  { id: "st-3", budynek_id: "bud-3", status: "sent" as TransferStatus, data: "2025-02-18T14:00:00", szczegoly: "Oczekiwanie na potwierdzenie Bmeters" },
  { id: "st-4", budynek_id: "bud-4", status: "rejected" as TransferStatus, data: "2025-02-19T11:30:00", szczegoly: "Nieprawidłowy format adresu — wymaga korekty" },
];

// Walidacja struktury — wynik sprawdzenia budynku
export type ValidationResult = { budynek_id: string; budynek_nazwa: string; adres_ok: boolean; lokale_ok: boolean; mierniki_ok: boolean; bledy: string[] };
export const walidacjaWyniki: ValidationResult[] = [
  { budynek_id: "bud-1", budynek_nazwa: "Budynek A", adres_ok: true, lokale_ok: true, mierniki_ok: true, bledy: [] },
  { budynek_id: "bud-2", budynek_nazwa: "Budynek B", adres_ok: true, lokale_ok: true, mierniki_ok: true, bledy: [] },
  { budynek_id: "bud-3", budynek_nazwa: "Budynek C", adres_ok: true, lokale_ok: true, mierniki_ok: false, bledy: ["Lokal 1A — brak miernika ciepła"] },
  { budynek_id: "bud-4", budynek_nazwa: "Wieża Centralna", adres_ok: false, lokale_ok: true, mierniki_ok: false, bledy: ["Adres niezgodny z formatem Bmeters", "Lokal 1A — brak miernika wody i ciepła"] },
];

// Harmonogram importu
export const harmonogramImportu = {
  aktywny: true,
  czestotliwosc: "codziennie" as "codziennie" | "co_godzine" | "co_6h" | "co_tydzien",
  godzina: "03:00",
  ostatni_import: "2025-02-20T03:00:00",
  nastepny_import: "2025-02-21T03:00:00",
  retry_count: 3,
  retry_delay_min: 15,
};

export const auditLogi = [
  { id: "a-1", created_at: "2025-02-20T14:22:00", user: "Jan Kowalski", akcja: "Dodanie", encja: "Lokal", szczegoly: "Dodano lokal 3A w Budynek A" },
  { id: "a-2", created_at: "2025-02-20T11:05:00", user: "System", akcja: "Import danych", encja: "Odczyty", szczegoly: "Zaimportowano 256 odczytów z Bmeters" },
  { id: "a-3", created_at: "2025-02-19T16:30:00", user: "Anna Nowak", akcja: "Edycja", encja: "Budynek", szczegoly: "Zmieniono adres Budynku C" },
  { id: "a-4", created_at: "2025-02-19T09:15:00", user: "Admin", akcja: "Przypisanie", encja: "Zarządca", szczegoly: "Przypisano Piotra Wiśniewskiego do Wieża Centralna" },
  { id: "a-5", created_at: "2025-02-18T13:45:00", user: "System", akcja: "Import danych", encja: "Odczyty", szczegoly: "Zaimportowano 198 odczytów z Bmeters (12 błędów)" },
  { id: "a-6", created_at: "2025-02-17T10:00:00", user: "Jan Kowalski", akcja: "Dodanie", encja: "Miernik", szczegoly: "Dodano miernik BM-W-003 do lokalu 2A" },
  { id: "a-7", created_at: "2025-02-16T08:30:00", user: "Admin", akcja: "Usunięcie", encja: "Lokal", szczegoly: "Usunięto lokal testowy w Budynku B" },
  { id: "a-8", created_at: "2025-02-15T09:00:00", user: "System", akcja: "Transfer struktury", encja: "Budynek", szczegoly: "Przekazano strukturę Budynku A i B do Bmeters" },
  { id: "a-9", created_at: "2025-02-14T15:20:00", user: "Admin", akcja: "Konfiguracja", encja: "Integracja", szczegoly: "Zaktualizowano klucz API Bmeters" },
  { id: "a-10", created_at: "2025-02-13T11:00:00", user: "System", akcja: "Walidacja", encja: "Budynek", szczegoly: "Walidacja struktury Wieży Centralnej — 2 błędy" },
];
