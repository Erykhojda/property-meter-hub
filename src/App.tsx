import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import StrukturalPage from "@/pages/StrukturalPage";
import ZarzadcyPage from "@/pages/ZarzadcyPage";
import UrzadzeniaPage from "@/pages/UrzadzeniaPage";
import IntegracjaPage from "@/pages/IntegracjaPage";
import AudytPage from "@/pages/AudytPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/struktura" element={<StrukturalPage />} />
            <Route path="/zarzadcy" element={<ZarzadcyPage />} />
            <Route path="/urzadzenia" element={<UrzadzeniaPage />} />
            <Route path="/integracja" element={<IntegracjaPage />} />
            <Route path="/audyt" element={<AudytPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
