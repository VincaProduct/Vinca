import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Home,
  Compass,
  User,
  UserPlus,
  TrendingUp,
  Calendar,
  FileText,
  Users,
  LayoutDashboard,
  MapPin,
  BarChart3,
  Shield,
  LineChart,
  BookOpen,
  Zap,
  Layers,
  Footprints,
  ArrowUpCircle,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  Target,
  BadgeDollarSign,
  Sprout,
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
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { useUserRole } from '@/hooks/useUserRole';
import ThemeToggle from '@/components/ThemeToggle';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface NavGroup {
  key: string;
  title: string;
  icon: React.ElementType;
  url?: string;          // set for direct-link items (no sub-items)
  sub?: SubItem[];
  premium?: boolean;     // special treatment for Elevate
}

// ── Nav structure ─────────────────────────────────────────────────────────────

const NAV: NavGroup[] = [
  {
    key: 'dashboard',
    title: 'My Dashboard',
    icon: Home,
    url: '/dashboard',
  },
  {
    key: 'plan',
    title: 'Plan',
    icon: Target,
    sub: [
      { title: 'Financial Freedom Readiness', url: '/dashboard/ffr',      icon: TrendingUp  },
      { title: 'Sprint',                      url: '/dashboard/sprints',   icon: Zap         },
      { title: 'Insurance',                   url: '/dashboard/insurance', icon: ShieldCheck },
    ],
  },
  {
    key: 'invest',
    title: 'Invest',
    icon: BadgeDollarSign,
    sub: [
      { title: 'Know Your Market', url: '/dashboard/know-your-market', icon: LineChart },
      { title: 'Curations',        url: '/dashboard/curations',         icon: Layers   },
    ],
  },
  {
    key: 'grow',
    title: 'Grow',
    icon: Sprout,
    sub: [
      { title: 'Learning',     url: '/dashboard/learning',     icon: BookOpen      },
      { title: 'Footprints',   url: '/dashboard/footprints',   icon: Footprints    },
      { title: 'Reflections',  url: '/dashboard/reflections',  icon: MessageSquare },
      { title: 'Raise',        url: '/dashboard/raise',        icon: ArrowUpCircle },
    ],
  },
  {
    key: 'elevate',
    title: 'Elevate',
    icon: Compass,
    url: '/dashboard/elevate',
    premium: true,
  },
];

const adminMenuItems = [
  { title: 'Blog CMS',             url: '/dashboard/blog-cms',        icon: FileText      },
  { title: 'Authors',              url: '/dashboard/authors',          icon: Users         },
  { title: 'CTA Dashboard',        url: '/dashboard/cta-dashboard',    icon: LayoutDashboard },
  { title: 'CTA Placements',       url: '/dashboard/cta-placements',   icon: MapPin        },
  { title: 'CTA Analytics',        url: '/dashboard/cta-analytics',    icon: BarChart3     },
  { title: 'Bookings Management',  url: '/dashboard/bookings',         icon: Calendar      },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupForPath(path: string): string | null {
  for (const group of NAV) {
    if (group.url) {
      if (group.url === '/dashboard' ? path === '/dashboard' : path.startsWith(group.url)) {
        return group.key;
      }
    }
    if (group.sub) {
      for (const sub of group.sub) {
        if (path === sub.url || path.startsWith(sub.url + '/')) return group.key;
      }
    }
  }
  return null;
}

// ── Sidebar component ─────────────────────────────────────────────────────────

export function DashboardSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { isPro } = useMembership();
  const { isSuperAdmin } = useUserRole();
  const [isDark, setIsDark] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(() => groupForPath(location.pathname));

  // Sync open group when route changes (e.g. programmatic navigation)
  useEffect(() => {
    const active = groupForPath(location.pathname);
    if (active) setOpenGroup(active);
  }, [location.pathname]);

  // Dark mode detection
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const logoSrc = isDark
    ? '/lovable-uploads/85ed6dc8-bea0-4bcf-bda4-506f3f06325a.png'
    : '/images/black-logo-Photoroom.png';

  function isSubActive(url: string) {
    if (url === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === url || location.pathname.startsWith(url + '/');
  }

  function toggleGroup(key: string) {
    setOpenGroup(prev => (prev === key ? null : key));
  }

  return (
    <Sidebar className="border-r-0 bg-sidebar" collapsible="offcanvas">

      {/* ── Logo ────────────────────────────────────────────────────────── */}
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

      {/* ── Main nav ────────────────────────────────────────────────────── */}
      <SidebarContent className="bg-sidebar overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <nav className="space-y-0.5 px-2 py-2">
              {NAV.map((group) => {
                const isGroupActive = openGroup === group.key;
                const Icon = group.icon;

                // ── Direct-link item (My Dashboard / Elevate) ──────────
                if (group.url) {
                  const active = isSubActive(group.url);
                  return (
                    <Link
                      key={group.key}
                      to={group.url}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                        group.premium
                          ? active
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'text-sidebar-foreground hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400'
                          : active
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          group.premium ? 'text-emerald-600 dark:text-emerald-400' : ''
                        }`}
                      />
                      <span className={`font-medium text-sm ${group.premium ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
                        {group.title}
                      </span>
                      {group.premium && (
                        <span className="ml-auto text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                          PRO
                        </span>
                      )}
                    </Link>
                  );
                }

                // ── Expandable group ───────────────────────────────────
                const hasActiveChild = group.sub?.some(s => isSubActive(s.url));

                return (
                  <div key={group.key}>
                    {/* Group header button */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                        hasActiveChild || isGroupActive
                          ? 'text-sidebar-accent-foreground bg-sidebar-accent/60'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                      <span className={`flex-1 text-left text-sm ${hasActiveChild ? 'font-bold' : 'font-medium'}`}>
                        {group.title}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                          isGroupActive ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Sub-items with CSS height transition */}
                    <div
                      className="overflow-hidden transition-all duration-200 ease-in-out"
                      style={{
                        maxHeight: isGroupActive ? `${(group.sub?.length ?? 0) * 48}px` : '0px',
                        opacity: isGroupActive ? 1 : 0,
                      }}
                    >
                      <div className="mt-0.5 ml-4 pl-3 border-l border-sidebar-border space-y-0.5 pb-1">
                        {group.sub?.map((sub) => {
                          const SubIcon = sub.icon;
                          const active = isSubActive(sub.url);
                          return (
                            <Link
                              key={sub.url}
                              to={sub.url}
                              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-150 group ${
                                active
                                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                              }`}
                            >
                              <SubIcon
                                className={`h-4 w-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                                  active ? 'text-sidebar-accent-foreground' : 'text-muted-foreground'
                                }`}
                              />
                              <span className="text-xs font-medium">{sub.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Admin tools ─────────────────────────────────────────────── */}
        {isSuperAdmin && (
          <>
            <SidebarSeparator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2 text-sidebar-foreground/70 px-3 py-2">
                <Shield className="h-4 w-4" />
                <span className="font-semibold">Admin Tools</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1 px-2">
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isSubActive(item.url);
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
                            <Icon
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

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-3">

        {/* Refer a Friend */}
        <Link
          to="/dashboard/refer"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
            isSubActive('/dashboard/refer')
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`}
        >
          <UserPlus className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="font-medium text-xs">Refer a Friend</span>
        </Link>

        {/* User info + theme toggle */}
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

        {/* Join Membership */}
        <Link to="/dashboard/pricing">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 17.75L7.5 21l1.25-5.25L4 10.75l5.38-.38L12 5.5l2.62 4.87 5.38.38-4.75 5.0L16.5 21z" />
            </svg>
            Join Membership
          </button>
        </Link>

      </SidebarFooter>
    </Sidebar>
  );
}
