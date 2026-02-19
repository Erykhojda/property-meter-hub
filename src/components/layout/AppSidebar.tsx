import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Gauge, Plug, ClipboardList, LogOut, ChevronRight,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Struktura', url: '/struktura', icon: Building2 },
  { title: 'Zarządcy', url: '/zarzadcy', icon: Users },
  { title: 'Urządzenia', url: '/urzadzenia', icon: Gauge },
  { title: 'Integracja', url: '/integracja', icon: Plug },
  { title: 'Audyt', url: '/audyt', icon: ClipboardList },
];

const zarzadcaNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Urządzenia', url: '/urzadzenia', icon: Gauge },
];

export function AppSidebar() {
  const { role, user, signOut } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  const navItems = role === 'admin' ? adminNavItems : zarzadcaNavItems;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="py-4 px-3">
        <div className={cn('flex items-center gap-2.5 overflow-hidden', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-sidebar-foreground leading-tight">SCORE</span>
              <span className="text-xs text-sidebar-foreground/50 leading-tight truncate">Appartme</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url ||
                  (item.url !== '/' && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        'h-9 rounded-md transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-2.5">
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span>{item.title}</span>
                        {isActive && !collapsed && (
                          <ChevronRight className="w-3 h-3 ml-auto text-sidebar-foreground/40" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-4 px-3">
        <div className={cn('flex items-center gap-2 mb-2 px-1 overflow-hidden', collapsed && 'justify-center')}>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.email}
              </span>
              <span className="text-xs text-sidebar-foreground/50 capitalize">
                {role === 'admin' ? 'Administrator' : 'Zarządca'}
              </span>
            </div>
          )}
        </div>
        <SidebarMenuButton
          onClick={signOut}
          tooltip="Wyloguj"
          className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 h-9"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Wyloguj</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
