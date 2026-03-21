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
    <div className="min-h-screen bg-background">
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <div className="flex min-h-screen w-full bg-background">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <DashboardHeader />
            <main className="flex-1 bg-background">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
