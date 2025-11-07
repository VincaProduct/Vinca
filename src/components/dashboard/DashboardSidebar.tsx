
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  UserPlus,
  HelpCircle,
  TrendingUp,
  Calendar,
  FileText,
  Users,
  LayoutDashboard,
  MapPin,
  BarChart3,
  Layout,
  Shield
} from 'lucide-react';
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { useUserRole } from '@/hooks/useUserRole';

const baseMenuItems = [
  {
    title: 'Home',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Financial Freedom Readiness',
    url: '/dashboard/ffr',
    icon: TrendingUp,
  },
  {
    title: 'Book a Wealth Manager',
    url: '/dashboard/book-wealth-manager',
    icon: Calendar,
  },
  {
    title: 'Investment Opportunities',
    url: '/dashboard/investment-opportunities',
    icon: TrendingUp,
  },
  {
    title: 'Refer a Friend',
    url: '/dashboard/refer',
    icon: UserPlus,
  },
  {
    title: 'Support',
    url: '/dashboard/support',
    icon: HelpCircle,
  },
];

const upgradeMenuItem = {
  title: 'Upgrade to Pro',
  url: '/dashboard/upgrade',
  icon: TrendingUp,
};

const adminMenuItems = [
  {
    title: 'Blog CMS',
    url: '/dashboard/blog-cms',
    icon: FileText,
  },
  {
    title: 'Authors',
    url: '/dashboard/authors',
    icon: Users,
  },
  {
    title: 'CTA Dashboard',
    url: '/dashboard/cta-dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'CTA Placements',
    url: '/dashboard/cta-placements',
    icon: MapPin,
  },
  {
    title: 'CTA Analytics',
    url: '/dashboard/cta-analytics',
    icon: BarChart3,
  },
  {
    title: 'Bookings Management',
    url: '/dashboard/bookings',
    icon: Calendar,
  },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { isPro, isClient } = useMembership();
  const { isSuperAdmin } = useUserRole();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Add upgrade menu item for non-pro users
  const menuItems = isPro ? baseMenuItems : [...baseMenuItems, upgradeMenuItem];

  const isActive = (url: string) => {
    if (url === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    
    // Exact match for the URL or exact match followed by a slash
    return location.pathname === url || 
           (location.pathname.startsWith(url + '/') && location.pathname !== url);
  };

  const logoSrc = isDark
    ? "/lovable-uploads/85ed6dc8-bea0-4bcf-bda4-506f3f06325a.png"
    : "/images/black-logo-Photoroom.png";

  return (
    <Sidebar className="border-r-0 bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center justify-center py-2">
          <img
            src={logoSrc}
            alt="Vinca Wealth"
            className={`${isDark ? "h-10 w-auto" : "h-10 w-auto"} object-contain transition-all duration-500`}
            loading="eager"
          />
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="group">
                      <Link
                        to={item.url}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          active
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                            : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
                        }`}
                      >
                        <item.icon 
                          className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                            active ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground'
                          }`} 
                        />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSuperAdmin && (
          <>
            <SidebarSeparator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2 text-sidebar-foreground/70 px-3 py-2">
                <Shield className="h-4 w-4" />
                <span className="font-semibold">Admin Tools</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {adminMenuItems.map((item) => {
                    const active = isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className="group">
                          <Link
                            to={item.url}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                              active
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                                : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
                            }`}
                          >
                            <item.icon 
                              className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                                active ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground'
                              }`} 
                            />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
