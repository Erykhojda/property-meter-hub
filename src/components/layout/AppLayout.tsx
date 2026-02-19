import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-12 flex items-center border-b border-border px-4 gap-3 bg-card shrink-0">
            <SidebarTrigger className="h-7 w-7" />
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-muted-foreground font-medium">
              System Zarządzania Nieruchomościami
            </span>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
