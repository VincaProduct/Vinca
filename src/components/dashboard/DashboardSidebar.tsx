
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Home,
  User,
  UserPlus,
  TrendingUp,
  Calendar,
  FileText,
  Users,
  LayoutDashboard,
  MapPin,
  BarChart3,
  Layout,
  Shield,
  Lightbulb,
  ShieldCheck,
  Footprints,
  BookOpen,
  Hand,
  MessageSquare,
  Globe,
  Gift,
  DollarSign,
  Sparkles,
  Clock4
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
import ThemeToggle from '@/components/ThemeToggle';

const baseMenuItems = [
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
    title: 'Refer a Friend',
    url: '/dashboard/refer',
    icon: UserPlus,
  },
  {
    title: 'Elevate',
    url: '/dashboard/elevate',
    icon: Lightbulb,
  },
  {
    title: 'Footprints',
    url: '/dashboard/footprints',
    icon: Footprints,
  },
  {
    title: 'Learning',
    url: '/dashboard/learning',
    icon: BookOpen,
  },
  {
    title: 'Sprint',
    url: '/dashboard/sprintb',
    icon: Clock4,
  },
  {
    title: 'Raise',
    url: '/dashboard/raise',
    icon: Hand,
  },
  {
    title: 'Reflections',
    url: '/dashboard/reflections',
    icon: MessageSquare,
  },
  {
    title: 'Know Your Market',
    url: '/dashboard/know-your-market',
    icon: Globe,
  },
  {
    title: 'Curations',
    url: '/dashboard/curations',
    icon: Gift,
  },
  {
    title: 'Pricing',
    url: '/dashboard/investor-hub/pricing',
    icon: DollarSign,
  },
  {
    title: 'Readiness Fit',
    url: '/dashboard/readiness-fit',
    icon: Sparkles,
  },
  {
    title: 'Insurance',
    url: '/dashboard/insurance',
    icon: ShieldCheck,
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
    <Sidebar className="border-r-0 bg-sidebar" collapsible="offcanvas">
      <SidebarHeader className="h-14 px-4 border-b border-sidebar-border flex items-center justify-center">
        <Link to="/" className="flex items-center justify-center">
          <img
            src={logoSrc}
            alt="Vinca Wealth"
            className="h-8 w-auto object-contain transition-all duration-500"
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

      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center flex-shrink-0">
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
          <ThemeToggle />
        </div>

        {/* Join Membership Button */}
        <div className="mt-4">
          <Link to="/dashboard/pricing">
            <button
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
              type="button"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17.75L7.5 21l1.25-5.25L4 10.75l5.38-.38L12 5.5l2.62 4.87 5.38.38-4.75 5.0L16.5 21z"/></svg>
              Join Membership
            </button>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
