import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AppProvider, useAppStore, AuthUser } from "@/data/store";
import { registerUnauthorizedHandler } from "@/lib/api";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import StrukturalPage from "@/pages/StrukturalPage";
import MojProfilPage from "@/pages/MojProfilPage";
import UrzadzeniaPage from "@/pages/UrzadzeniaPage";
import IntegracjaPage from "@/pages/IntegracjaPage";
import AudytPage from "@/pages/AudytPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

function AuthGate() {
  const { state, dispatch } = useAppStore();

  // Register 401 handler so apiFetch() can trigger LOGOUT automatically
  useEffect(() => {
    registerUnauthorizedHandler(() => dispatch({ type: "LOGOUT" }));
  }, [dispatch]);

  // On first mount — attempt to restore session from localStorage
  useEffect(() => {
    if (!state.user) {
      const stored = localStorage.getItem("auth_user");
      const token = localStorage.getItem("auth_token");
      if (stored && token) {
        try {
          const user: AuthUser = JSON.parse(stored);
          // Basic JWT expiry check (decode middle segment)
          const [, payload] = token.split(".");
          if (payload) {
            const { exp } = JSON.parse(atob(payload));
            if (exp && Date.now() / 1000 > exp) {
              // Token expired — clear and force re-login
              localStorage.removeItem("auth_token");
              localStorage.removeItem("auth_refresh_token");
              localStorage.removeItem("auth_user");
              return;
            }
          }
          dispatch({ type: "LOGIN", payload: { ...user, token } });
        } catch {
          // Corrupt data — ignore and show login
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (user: AuthUser) => {
    dispatch({ type: "LOGIN", payload: user });
  };

  if (!state.user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/struktura" element={<StrukturalPage />} />
          <Route path="/profil" element={<MojProfilPage />} />
          <Route path="/urzadzenia" element={<UrzadzeniaPage />} />
          <Route path="/integracja" element={<IntegracjaPage />} />
          <Route path="/audyt" element={<AudytPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthGate />
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
