import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { useState, useEffect } from 'react';

const DashboardLayout = () => {
  const [open, setOpen] = useState(window.innerWidth >= 1100);

  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth >= 1100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen bg-background overflow-hidden">
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <div className="h-full flex w-full bg-background">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto min-h-0 bg-background">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
