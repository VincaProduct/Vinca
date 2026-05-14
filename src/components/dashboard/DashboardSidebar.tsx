import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  Sprout,
  Star,
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
import { useFinancialPlanning } from '@/components/financial-planning/context/FinancialPlanningContext';
import { useFFR } from '@/hooks/useFFR';
import { calculateFFRScore } from '@/utils/ffrScore';

// ── Constants ─────────────────────────────────────────────────────────────────

const CARD_BG    = '#0D2818';
const GREEN_FILL = '#1D9E75';
const TRACK_BG   = '#085041';
const TEAL_LABEL = '#5DCAA5';
const ELEVATE_GREEN = '#0F6E56';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

type DotColor = 'green' | 'amber' | 'red';

interface NavGroup {
  key: string;
  title: string;
  icon: React.ElementType;
  url?: string;
  sub?: SubItem[];
  premium?: boolean;
  dot?: (score: number | null, foundationScore: number) => DotColor | null;
  pillText?: (score: number | null, foundationScore: number) => string | null;
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
    key: 'ffr',
    title: 'Financial Freedom',
    icon: LineChart,
    url: '/dashboard/ffr',
  },
  {
    key: 'build',
    title: 'Build',
    icon: TrendingUp,
    sub: [
      { title: 'Sprint',           url: '/dashboard/sprints',           icon: Zap      },
      { title: 'Know Your Market', url: '/dashboard/know-your-market',  icon: LineChart },
    ],
    dot: (score) =>
      score === null ? null : score < 60 ? 'amber' : 'green',
  },
  {
    key: 'protect',
    title: 'Protect',
    icon: Shield,
    sub: [
      { title: 'Insurance', url: '/dashboard/insurance', icon: ShieldCheck },
    ],
    dot: (_score, foundationScore) => foundationScore < 10 ? 'red' : 'green',
    pillText: (_score, fs) =>
      fs < 10 ? 'action needed' : 'good',
  },
  {
    key: 'grow',
    title: 'Grow',
    icon: Sprout,
    sub: [
      { title: 'Learning',    url: '/dashboard/learning',    icon: BookOpen      },
      { title: 'Curations',   url: '/dashboard/curations',   icon: Layers        },
      { title: 'Footprints',  url: '/dashboard/footprints',  icon: Footprints    },
      { title: 'Reflections', url: '/dashboard/reflections', icon: MessageSquare },
      { title: 'Raise',       url: '/dashboard/raise',       icon: ArrowUpCircle },
    ],
    dot: () => 'green',
  },
  {
    key: 'elevate',
    title: 'Elevate',
    icon: Star,
    url: '/dashboard/elevate',
    premium: true,
  },
];

const adminMenuItems = [
  { title: 'Blog CMS',            url: '/dashboard/blog-cms',         icon: FileText       },
  { title: 'Authors',             url: '/dashboard/authors',           icon: Users          },
  { title: 'CTA Dashboard',       url: '/dashboard/cta-dashboard',     icon: LayoutDashboard },
  { title: 'CTA Placements',      url: '/dashboard/cta-placements',    icon: MapPin         },
  { title: 'CTA Analytics',       url: '/dashboard/cta-analytics',     icon: BarChart3      },
  { title: 'Bookings Management', url: '/dashboard/bookings',          icon: Calendar       },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const DOT_COLORS: Record<DotColor, string> = {
  green: '#10B981',
  amber: '#F59E0B',
  red:   '#EF4444',
};

const PILL_BG: Record<DotColor, string> = {
  green: 'rgba(16,185,129,0.12)',
  amber: 'rgba(245,158,11,0.12)',
  red:   'rgba(239,68,68,0.12)',
};

const PILL_COLOR: Record<DotColor, string> = {
  green: '#059669',
  amber: '#B45309',
  red:   '#DC2626',
};

function scoreStatus(score: number): { label: string; color: DotColor } {
  if (score <= 40) return { label: 'Needs attention', color: 'red'   };
  if (score <= 70) return { label: 'On track',        color: 'amber' };
  return              { label: 'Strong readiness',    color: 'green' };
}

function groupForPath(path: string): string | null {
  for (const group of NAV) {
    if (group.url) {
      const match = group.url === '/dashboard' ? path === '/dashboard' : path.startsWith(group.url);
      if (match) return group.key;
    }
    if (group.sub) {
      for (const sub of group.sub) {
        if (path === sub.url || path.startsWith(sub.url + '/')) return group.key;
      }
    }
  }
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { isSuperAdmin } = useUserRole();
  const [isDark, setIsDark]     = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(() => groupForPath(location.pathname));

  // ── Financial data (from layout-level FinancialPlanningProvider) ───────────
  const { inputs, results, projections, hasCalculated } = useFinancialPlanning();
  const { checklist, ffrProgress } = useFFR(inputs && results ? { inputs, results } : undefined);

  const retirementYear = hasCalculated && inputs
    ? new Date().getFullYear() + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP
    : null;
  const retirementLabel = retirementYear ? `January ${retirementYear}` : null;

  const score =
    hasCalculated && inputs && results && projections.length > 0
      ? calculateFFRScore(inputs, results, projections, checklist)
      : null;

  const foundationScore = ffrProgress?.foundation_score ?? 0;
  const statusInfo = score !== null ? scoreStatus(score) : null;

  // ── Dark mode detection ────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // ── Auto-expand active group on route change ───────────────────────────────
  useEffect(() => {
    const active = groupForPath(location.pathname);
    if (active) setOpenGroup(active);
  }, [location.pathname]);

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

      <SidebarContent className="bg-sidebar overflow-y-auto">

        {/* ── Score card ──────────────────────────────────────────────────── */}
        <div className="px-3 pt-3 pb-1">
          <Link
            to="/dashboard/ffr"
            className="block rounded-xl p-4 transition-opacity hover:opacity-90"
            style={{ background: CARD_BG }}
          >
            {/* Retirement date */}
            <p
              className="text-[10px] font-bold tracking-widest uppercase mb-1"
              style={{ color: TEAL_LABEL }}
            >
              Retirement Date
            </p>
            <p className="text-lg font-black text-white leading-tight mb-3" style={{ letterSpacing: '-0.02em' }}>
              {retirementLabel ?? (
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Complete your plan
                </span>
              )}
            </p>

            {/* Divider */}
            <div className="w-full h-px mb-3" style={{ background: 'rgba(255,255,255,0.08)' }} />

            {/* FFR score row */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: TEAL_LABEL }}>
                FFR Score
              </p>
              <p className="text-sm font-black text-white">
                {score !== null ? `${score}` : '—'}
                <span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>/100</span>
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: TRACK_BG }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${score ?? 0}%`, background: GREEN_FILL }}
              />
            </div>

            {/* Status pill */}
            {statusInfo && (
              <div className="mt-2.5">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: PILL_BG[statusInfo.color], color: PILL_COLOR[statusInfo.color] }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: DOT_COLORS[statusInfo.color] }}
                  />
                  {statusInfo.label}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <SidebarGroup>
          <SidebarGroupContent>
            <nav className="space-y-0.5 px-2 py-1">
              {NAV.map((group) => {
                const isGroupActive = openGroup === group.key;
                const Icon = group.icon;
                const dotColor = group.dot ? group.dot(score, foundationScore) : null;
                const pillLabel = group.pillText ? group.pillText(score ?? 0, foundationScore) : null;

                // ── Direct-link item (My Dashboard / Elevate) ────────────
                if (group.url) {
                  const active = isSubActive(group.url);
                  if (group.premium) {
                    return (
                      <Link
                        key={group.key}
                        to={group.url}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 mt-1"
                        style={{
                          border: `0.5px solid ${ELEVATE_GREEN}`,
                          color: ELEVATE_GREEN,
                          background: active ? 'rgba(15,110,86,0.06)' : 'transparent',
                        }}
                      >
                        <Icon style={{ width: 18, height: 18, color: ELEVATE_GREEN }} />
                        <span className="text-sm" style={{ fontWeight: 500, color: ELEVATE_GREEN }}>
                          {group.title}
                        </span>
                        <span
                          className="ml-auto text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(15,110,86,0.1)', color: ELEVATE_GREEN }}
                        >
                          premium
                        </span>
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={group.key}
                      to={group.url}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                        active
                          ? 'shadow-sm'
                          : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
                      }`}
                      style={active ? { background: '#E1F5EE', color: '#085041' } : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                      <span className="text-sm font-medium">{group.title}</span>
                    </Link>
                  );
                }

                // ── Expandable group ─────────────────────────────────────
                const hasActiveChild = group.sub?.some(s => isSubActive(s.url));

                return (
                  <div key={group.key}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                        hasActiveChild || isGroupActive
                          ? 'text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                      style={hasActiveChild ? { background: '#E1F5EE', color: '#085041' } : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                      <span className={`flex-1 text-left text-sm ${hasActiveChild ? 'font-bold' : 'font-medium'}`}>
                        {group.title}
                      </span>

                      {/* Status dot + optional pill */}
                      {dotColor && (
                        <span className="flex items-center gap-1.5">
                          {pillLabel && (
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ background: PILL_BG[dotColor], color: PILL_COLOR[dotColor] }}
                            >
                              {pillLabel}
                            </span>
                          )}
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: DOT_COLORS[dotColor] }}
                          />
                        </span>
                      )}

                      <ChevronDown
                        className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                          isGroupActive ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Sub-items — CSS max-height transition */}
                    <div
                      className="overflow-hidden transition-all duration-200 ease-in-out"
                      style={{
                        maxHeight: isGroupActive ? `${(group.sub?.length ?? 0) * 44}px` : '0px',
                        opacity:   isGroupActive ? 1 : 0,
                      }}
                    >
                      <div className="mt-0.5 ml-[26px] border-l border-sidebar-border space-y-0.5 pb-1 pl-3">
                        {group.sub?.map((sub) => {
                          const SubIcon = sub.icon;
                          const active  = isSubActive(sub.url);
                          return (
                            <Link
                              key={sub.url}
                              to={sub.url}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-150 group ${
                                active
                                  ? 'shadow-sm'
                                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                              }`}
                              style={active ? { background: '#E1F5EE', color: '#085041' } : undefined}
                            >
                              <SubIcon
                                className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                                  active ? '' : 'text-muted-foreground'
                                }`}
                              />
                              <span className="text-[12px] font-medium">{sub.title}</span>
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

        {/* ── Admin tools ─────────────────────────────────────────────────── */}
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

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
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
