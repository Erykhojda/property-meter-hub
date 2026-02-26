import { useAppStore } from "@/data/store";
import { logout as apiLogout } from "@/lib/authApi";
import { toast } from "sonner";

/**
 * Hook exposing auth state and helpers.
 * Works in both real-JWT mode and demo/mock mode.
 */
export function useAuth() {
    const { state, dispatch } = useAppStore();
    const user = state.user;

    const isAdmin = user?.role === "admin";
    const isManager = user?.role === "manager" || !user?.role; // default to manager in mock mode

    const handleLogout = async () => {
        try {
            if (user?.token) {
                await apiLogout();
            }
        } catch {
            // ignore — server-side logout failure should still clear local session
        } finally {
            dispatch({ type: "LOGOUT" });
            toast.success("Wylogowano pomyślnie");
        }
    };

    return {
        user,
        isLoggedIn: !!user,
        isAdmin,
        isManager,
        logout: handleLogout,
    };
}
