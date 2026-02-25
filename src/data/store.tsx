import React, { createContext, useContext, useReducer } from "react";
import {
    inwestorzy as initInwestorzy,
    inwestycje as initInwestycje,
    budynki as initBudynki,
    lokale as initLokale,
    mierniki as initMierniki,
    zarzadcy as initZarzadcy,
    zarzadcaPrzypisania as initPrzypisania,
    MediaType,
} from "./mock-data";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Inwestor = typeof initInwestorzy[number];
export type Inwestycja = typeof initInwestycje[number];
export type Budynek = typeof initBudynki[number];
export type Lokal = typeof initLokale[number];
export type Miernik = typeof initMierniki[number];
export type Zarzadca = typeof initZarzadcy[number];
export type ZarzadcaPrzypisanie = typeof initPrzypisania[number];
export type AuthUser = { name: string; email: string };

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
        // Auth
        case "LOGIN": return { ...state, user: action.payload };
        case "LOGOUT": return { ...state, user: null };

        // Inwestorzy
        case "ADD_INWESTOR":
            return { ...state, inwestorzy: [...state.inwestorzy, action.payload] };
        case "UPDATE_INWESTOR":
            return { ...state, inwestorzy: state.inwestorzy.map((x) => x.id === action.payload.id ? action.payload : x) };
        case "DELETE_INWESTOR":
            return { ...state, inwestorzy: state.inwestorzy.filter((x) => x.id !== action.id) };

        // Inwestycje
        case "ADD_INWESTYCJA":
            return { ...state, inwestycje: [...state.inwestycje, action.payload] };
        case "UPDATE_INWESTYCJA":
            return { ...state, inwestycje: state.inwestycje.map((x) => x.id === action.payload.id ? action.payload : x) };
        case "DELETE_INWESTYCJA":
            return { ...state, inwestycje: state.inwestycje.filter((x) => x.id !== action.id) };

        // Budynki
        case "ADD_BUDYNEK":
            return { ...state, budynki: [...state.budynki, action.payload] };
        case "UPDATE_BUDYNEK":
            return { ...state, budynki: state.budynki.map((x) => x.id === action.payload.id ? action.payload : x) };
        case "DELETE_BUDYNEK":
            return { ...state, budynki: state.budynki.filter((x) => x.id !== action.id) };

        // Lokale
        case "ADD_LOKAL":
            return { ...state, lokale: [...state.lokale, action.payload] };
        case "UPDATE_LOKAL":
            return { ...state, lokale: state.lokale.map((x) => x.id === action.payload.id ? action.payload : x) };
        case "DELETE_LOKAL":
            return { ...state, lokale: state.lokale.filter((x) => x.id !== action.id) };

        // Mierniki
        case "ADD_MIERNIK":
            return { ...state, mierniki: [...state.mierniki, action.payload] };
        case "DELETE_MIERNIK":
            return { ...state, mierniki: state.mierniki.filter((x) => x.id !== action.id) };

        // Zarządcy
        case "ADD_ZARZADCA":
            return { ...state, zarzadcy: [...state.zarzadcy, action.payload] };
        case "UPDATE_ZARZADCA":
            return { ...state, zarzadcy: state.zarzadcy.map((x) => x.id === action.payload.id ? action.payload : x) };
        case "DELETE_ZARZADCA":
            return { ...state, zarzadcy: state.zarzadcy.filter((x) => x.id !== action.id) };

        // Przypisania
        case "ADD_PRZYPISANIE":
            return { ...state, zarzadcaPrzypisania: [...state.zarzadcaPrzypisania, action.payload] };
        case "REMOVE_PRZYPISANIE":
            return {
                ...state,
                zarzadcaPrzypisania: state.zarzadcaPrzypisania.map((x) =>
                    x.id === action.id ? { ...x, data_do: new Date().toISOString().split("T")[0] } : x
                ),
            };

        default:
            return state;
    }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<Action>;
} | null>(null);

const initialState: AppState = {
    user: null,
    inwestorzy: initInwestorzy,
    inwestycje: initInwestycje,
    budynki: initBudynki,
    lokale: initLokale,
    mierniki: initMierniki,
    zarzadcy: initZarzadcy,
    zarzadcaPrzypisania: initPrzypisania,
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

// ─── ID Generator ─────────────────────────────────────────────────────────────

export function newId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
