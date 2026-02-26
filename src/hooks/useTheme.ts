import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("score-theme") as Theme | null;
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }
    localStorage.setItem("score-theme", theme);
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
    }, []);

    return { theme, toggleTheme };
}
