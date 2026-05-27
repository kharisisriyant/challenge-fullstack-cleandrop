import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../ui/sidebar';

export function AppLayout() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
