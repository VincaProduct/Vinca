import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Shield, Sprout, Star } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import {
  FinancialPlanningProvider,
  useFinancialPlanning,
} from '@/components/financial-planning/context/FinancialPlanningContext';
import { useFFR } from '@/hooks/useFFR';
import { calculateFFRScore } from '@/utils/ffrScore';

// ── Constants ─────────────────────────────────────────────────────────────────

const DARK_GREEN = '#0D2818';
const TEAL       = '#5DCAA5';

// ── Mobile score header ───────────────────────────────────────────────────────

function MobileScoreHeader() {
  const { inputs, results, projections, hasCalculated } = useFinancialPlanning();
  const { checklist } = useFFR(inputs && results ? { inputs, results } : undefined);

  const retirementYear = hasCalculated && inputs
    ? new Date().getFullYear() + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP
    : null;
  const retirementLabel = retirementYear ? `Jan ${retirementYear}` : '—';

  const score =
    hasCalculated && inputs && results && projections.length > 0
      ? calculateFFRScore(inputs, results, projections, checklist)
      : null;

  return (
    <div
      className="sticky top-0 z-40 md:hidden px-5 py-3 flex items-center justify-between"
      style={{ background: DARK_GREEN }}
    >
      <div>
        <p
          className="text-[9px] font-bold tracking-widest uppercase"
          style={{ color: TEAL }}
        >
          Retirement Date
        </p>
        <p className="text-sm font-bold text-white leading-snug">{retirementLabel}</p>
      </div>
      <Link to="/dashboard/ffr" className="text-right">
        <p
          className="text-[9px] font-bold tracking-widest uppercase"
          style={{ color: TEAL }}
        >
          FFR Score
        </p>
        <p className="text-sm font-bold text-white leading-snug">
          {score !== null ? `${score}/100` : '—/100'}
        </p>
      </Link>
    </div>
  );
}

// ── Mobile tab bar ────────────────────────────────────────────────────────────

const BUILD_PATHS   = ['/dashboard/sprints', '/dashboard/know-your-market'];
const PROTECT_PATHS = ['/dashboard/insurance'];
const GROW_PATHS    = ['/dashboard/learning', '/dashboard/curations', '/dashboard/footprints', '/dashboard/reflections', '/dashboard/raise'];

const MOBILE_TABS = [
  { key: 'home',    label: 'Home',    icon: Home,       url: '/dashboard',           exact: true,  premium: false },
  { key: 'build',   label: 'Build',   icon: TrendingUp, url: '/dashboard/sprints',   exact: false, premium: false },
  { key: 'protect', label: 'Protect', icon: Shield,     url: '/dashboard/insurance', exact: false, premium: false },
  { key: 'grow',    label: 'Grow',    icon: Sprout,     url: '/dashboard/learning',  exact: false, premium: false },
  { key: 'elevate', label: 'Elevate', icon: Star,       url: '/dashboard/elevate',   exact: false, premium: true  },
] as const;

function MobileTabBar() {
  const location = useLocation();
  const { inputs, results, projections, hasCalculated } = useFinancialPlanning();
  const { checklist, ffrProgress } = useFFR(inputs && results ? { inputs, results } : undefined);

  const score =
    hasCalculated && inputs && results && projections.length > 0
      ? calculateFFRScore(inputs, results, projections, checklist)
      : null;
  const foundationScore = ffrProgress?.foundation_score ?? 0;

  function isTabActive(key: string, url: string, exact: boolean) {
    if (exact)            return location.pathname === url;
    if (key === 'build')  return BUILD_PATHS.some(p  => location.pathname === p || location.pathname.startsWith(p + '/'));
    if (key === 'protect') return PROTECT_PATHS.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
    if (key === 'grow')   return GROW_PATHS.some(p   => location.pathname === p || location.pathname.startsWith(p + '/'));
    return location.pathname === url || location.pathname.startsWith(url + '/');
  }

  function dotColor(key: string): string | null {
    if (key === 'build')   return score !== null ? (score < 60 ? '#F59E0B' : '#10B981') : null;
    if (key === 'protect') return foundationScore < 10 ? '#EF4444' : '#10B981';
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-stretch"
      style={{ background: 'white', borderTop: '0.5px solid #E5E7EB' }}
    >
      {MOBILE_TABS.map(({ key, label, icon: Icon, url, exact, premium }) => {
        const active = isTabActive(key, url, exact);
        const dot    = dotColor(key);

        return (
          <Link
            key={key}
            to={url}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
            style={
              premium
                ? { border: '0.5px solid #0F6E56', color: '#0F6E56' }
                : active
                  ? { background: '#E1F5EE', color: '#085041' }
                  : { color: '#9CA3AF' }
            }
          >
            <div className="relative">
              <Icon style={{ width: 20, height: 20 }} />
              {dot && (
                <span
                  className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full"
                  style={{ background: dot }}
                />
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: active || premium ? 600 : 400 }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

// ── Layout inner ──────────────────────────────────────────────────────────────

function DashboardLayoutInner() {
  const [open, setOpen] = useState(window.innerWidth >= 1100);

  useEffect(() => {
    const handleResize = () => setOpen(window.innerWidth >= 1100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <div className="flex min-h-screen w-full bg-background">

          {/* Desktop sidebar — hidden below md */}
          <div className="hidden md:block">
            <DashboardSidebar />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile sticky score header */}
            <MobileScoreHeader />

            {/* Desktop top header — hidden on mobile */}
            <div className="hidden md:block">
              <DashboardHeader />
            </div>

            {/* Page content — bottom padding on mobile for tab bar clearance */}
            <main className="flex-1 bg-background pb-16 md:pb-0">
              <Outlet />
            </main>
          </div>

        </div>
      </SidebarProvider>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

const DashboardLayout = () => (
  <FinancialPlanningProvider>
    <DashboardLayoutInner />
  </FinancialPlanningProvider>
);

export default DashboardLayout;
