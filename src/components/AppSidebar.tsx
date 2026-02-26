import {
  LayoutDashboard,
  Building2,
  UserCircle,
  Gauge,
  Plug2,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const baseNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Struktura", url: "/struktura", icon: Building2 },
  { title: "Mój profil", url: "/profil", icon: UserCircle },
  { title: "Urządzenia", url: "/urzadzenia", icon: Gauge },
];

const adminNavItems = [
  { title: "Integracja", url: "/integracja", icon: Plug2 },
  { title: "Audyt", url: "/audyt", icon: ClipboardList },
];

export function AppSidebar() {
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === "collapsed";
  const { user, isAdmin, logout } = useAuth();

  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm shrink-0">
            B
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold tracking-tight leading-tight">Panel Zarządcy</h2>
              <p className="text-[10px] text-sidebar-foreground/60 leading-tight">Bmeters</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Nawigacja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-sidebar-border space-y-2">
        {!collapsed && user && (
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name || user.email}</p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">
              {isAdmin ? "Administrator" : "Zarządca"}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors px-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Wyloguj</span>}
        </Button>
        {!collapsed && (
          <p className="text-[10px] text-sidebar-foreground/30">v0.1.0</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
