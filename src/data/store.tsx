import React, { createContext, useContext, useReducer } from "react";
// No mock-data imports

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Inwestor { id: string; nazwa: string; nip: string; adres: string; kontakt: string; }
export interface Inwestycja { id: string; inwestor_id: string; nazwa: string; opis: string; }
export interface Budynek { id: string; inwestycja_id: string; nazwa: string; adres: string; miasto: string; kod_pocztowy: string; liczba_lokali: number; }
export interface Lokal { id: string; budynek_id: string; numer: string; pietro: number; powierzchnia: number; typ: string; }
export interface Miernik {
    id: string;
    lokal_id: string;
    device_id: string;
    typ: "woda" | "cieplo" | "energia";
    nazwa: string;
    data_instalacji: string;
    status: string;
    last_sync_at: string;
    alarmDevice: boolean;
    alarmBattery: boolean;
    alarmDamagedCable: boolean;
    alarmOverflow: boolean;
    alarmReverseInstallation: boolean;
}
export interface Zarzadca { id: string; full_name: string; email: string; telefon: string; firma: string; nip_firmy: string; status: "active" | "inactive"; }
export interface ZarzadcaPrzypisanie { id: string; zarzadca_id: string; budynek_id: string; data_od: string; data_do: string | null; }

export type UserRole = "admin" | "manager";

/** Logged-in user — supports both real JWT auth and legacy mock mode */
export type AuthUser = {
    name: string;
    email: string;
    /** Maps to user ID in appartme-service (or zarzadca ID from mock) */
    zarzadca_id: string;
    /** JWT access token from appartme-service (undefined in mock/demo mode) */
    token?: string;
    /** JWT refresh token from appartme-service */
    refreshToken?: string;
    /** Role controlling what UI sections are visible */
    role?: UserRole;
    /** Numeric user ID from appartme-service */
    userId?: string;
};

interface AppState {
    user: AuthUser | null;
    inwestorzy: Inwestor[];
    inwestycje: Inwestycja[];
    budynki: Budynek[];
    lokale: Lokal[];
    mierniki: Miernik[];
    zarzadcy: Zarzadca[];
    zarzadcaPrzypisania: ZarzadcaPrzypisanie[];
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
    | { type: "LOGIN"; payload: AuthUser }
    | { type: "LOGOUT" }
    | { type: "ADD_INWESTOR"; payload: Inwestor }
    | { type: "UPDATE_INWESTOR"; payload: Inwestor }
    | { type: "DELETE_INWESTOR"; id: string }
    | { type: "ADD_INWESTYCJA"; payload: Inwestycja }
    | { type: "UPDATE_INWESTYCJA"; payload: Inwestycja }
    | { type: "DELETE_INWESTYCJA"; id: string }
    | { type: "ADD_BUDYNEK"; payload: Budynek }
    | { type: "UPDATE_BUDYNEK"; payload: Budynek }
    | { type: "DELETE_BUDYNEK"; id: string }
    | { type: "ADD_LOKAL"; payload: Lokal }
    | { type: "UPDATE_LOKAL"; payload: Lokal }
    | { type: "DELETE_LOKAL"; id: string }
    | { type: "ADD_MIERNIK"; payload: Miernik }
    | { type: "DELETE_MIERNIK"; id: string }
    | { type: "ADD_ZARZADCA"; payload: Zarzadca }
    | { type: "UPDATE_ZARZADCA"; payload: Zarzadca }
    | { type: "DELETE_ZARZADCA"; id: string }
    | { type: "ADD_PRZYPISANIE"; payload: ZarzadcaPrzypisanie }
    | { type: "REMOVE_PRZYPISANIE"; id: string };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case "LOGIN": {
            if (action.payload.token) {
                localStorage.setItem("auth_token", action.payload.token);
            }
            if (action.payload.refreshToken) {
                localStorage.setItem("auth_refresh_token", action.payload.refreshToken);
            }
            localStorage.setItem("auth_user", JSON.stringify(action.payload));
            return { ...state, user: action.payload };
        }
        case "LOGOUT": {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_refresh_token");
            localStorage.removeItem("auth_user");
            return { ...state, user: null };
        }

        case "ADD_INWESTOR": return { ...state, inwestorzy: [...state.inwestorzy, action.payload] };
        case "UPDATE_INWESTOR": return { ...state, inwestorzy: state.inwestorzy.map((x) => x.id === action.payload.id ? action.payload : x) };
        case "DELETE_INWESTOR": return { ...state, inwestorzy: state.inwestorzy.filter((x) => x.id !== action.id) };

        case "ADD_INWESTYCJA": return { ...state, inwestycje: [...state.inwestycje, action.payload] };
        case "UPDATE_INWESTYCJA": return { ...state, inwestycje: state.inwestycje.map((x) => x.id === action.payload.id ? action.payload : x) };
        case "DELETE_INWESTYCJA": return { ...state, inwestycje: state.inwestycje.filter((x) => x.id !== action.id) };

        case "ADD_BUDYNEK": return { ...state, budynki: [...state.budynki, action.payload] };
        case "UPDATE_BUDYNEK": return { ...state, budynki: state.budynki.map((x) => x.id === action.payload.id ? action.payload : x) };
        case "DELETE_BUDYNEK": return { ...state, budynki: state.budynki.filter((x) => x.id !== action.id) };

        case "ADD_LOKAL": return { ...state, lokale: [...state.lokale, action.payload] };
        case "UPDATE_LOKAL": return { ...state, lokale: state.lokale.map((x) => x.id === action.payload.id ? action.payload : x) };
        case "DELETE_LOKAL": return { ...state, lokale: state.lokale.filter((x) => x.id !== action.id) };

        case "ADD_MIERNIK": return { ...state, mierniki: [...state.mierniki, action.payload] };
        case "DELETE_MIERNIK": return { ...state, mierniki: state.mierniki.filter((x) => x.id !== action.id) };

        case "ADD_ZARZADCA": return { ...state, zarzadcy: [...state.zarzadcy, action.payload] };
        case "UPDATE_ZARZADCA": return { ...state, zarzadcy: state.zarzadcy.map((x) => x.id === action.payload.id ? action.payload : x) };
        case "DELETE_ZARZADCA": return { ...state, zarzadcy: state.zarzadcy.filter((x) => x.id !== action.id) };

        case "ADD_PRZYPISANIE": return { ...state, zarzadcaPrzypisania: [...state.zarzadcaPrzypisania, action.payload] };
        case "REMOVE_PRZYPISANIE":
            return {
                ...state,
                zarzadcaPrzypisania: state.zarzadcaPrzypisania.map((x) =>
                    x.id === action.id ? { ...x, data_do: new Date().toISOString().split("T")[0] } : x
                ),
            };

        default: return state;
    }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<Action>;
} | null>(null);

const initialState: AppState = {
    user: null,
    inwestorzy: [],
    inwestycje: [],
    budynki: [],
    lokale: [],
    mierniki: [],
    zarzadcy: [],
    zarzadcaPrzypisania: [],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppStore() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppStore must be used within AppProvider");
    return ctx;
}

/**
 * Returns data scoped to the currently logged-in manager:
 * - myBudynkiIds: IDs of buildings with active assignment to this manager
 * - myBudynki, myLokale, myMierniki: filtered collections
 */
export function useManagerScope() {
    const { state } = useAppStore();
    const { user, zarzadcaPrzypisania, budynki, lokale, mierniki } = state;

    // If Admin or Demo account, see everything
    if (user?.role === "admin" || user?.zarzadca_id === "demo-manager") {
        const allBudynkiIds = new Set(budynki.map((b) => b.id));
        return {
            myBudynkiIds: allBudynkiIds,
            myBudynki: budynki,
            myLokale: lokale,
            myMierniki: mierniki,
        };
    }

    const myBudynkiIds = new Set(
        zarzadcaPrzypisania
            .filter((p) => p.zarzadca_id === user?.zarzadca_id && !p.data_do)
            .map((p) => p.budynek_id)
    );

    const myBudynki = budynki.filter((b) => myBudynkiIds.has(b.id));
    const myLokale = lokale.filter((l) => myBudynkiIds.has(l.budynek_id));
    const myMierniki = mierniki.filter((m) => myLokale.some((l) => l.id === m.lokal_id));

    return { myBudynkiIds, myBudynki, myLokale, myMierniki };
}

// ─── ID Generator ─────────────────────────────────────────────────────────────

export function newId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
