import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AppProvider, useAppStore, AuthUser } from "@/data/store";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import StrukturalPage from "@/pages/StrukturalPage";
import MojProfilPage from "@/pages/MojProfilPage";
import UrzadzeniaPage from "@/pages/UrzadzeniaPage";
import IntegracjaPage from "@/pages/IntegracjaPage";
import AudytPage from "@/pages/AudytPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthGate() {
  const { state, dispatch } = useAppStore();

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
