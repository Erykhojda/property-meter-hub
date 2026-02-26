import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/data/store";
import { Sun, Moon, UserCircle, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const breadcrumbs: Record<string, string> = {
  "/": "Dashboard",
  "/struktura": "Struktura",
  "/profil": "Mój profil",
  "/urzadzenia": "Urządzenia",
};

export function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { state, dispatch } = useAppStore();
  const location = useLocation();
  const pageTitle = breadcrumbs[location.pathname] ?? "Panel Zarządcy Bmeters";

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    toast.success("Wylogowano pomyślnie");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 flex items-center justify-between gap-4 border-b bg-card/80 backdrop-blur-sm px-4 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="h-4 w-px bg-border" />
              <span className="text-sm font-semibold">{pageTitle}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                title={theme === "dark" ? "Tryb jasny" : "Tryb ciemny"}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* User avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserCircle className="h-4 w-4" />
                    </div>
                    <span className="hidden sm:inline truncate max-w-[140px]">
                      {state.user?.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold">{state.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{state.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Wyloguj
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
