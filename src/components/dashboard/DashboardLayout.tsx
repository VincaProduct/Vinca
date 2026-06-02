import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Shield, Sprout, Star, User, LogOut, LineChart, UserPlus, ExternalLink } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import {
  FinancialPlanningProvider,
  useFinancialPlanning,
} from '@/components/financial-planning/context/FinancialPlanningContext';
import { useFFR } from '@/hooks/useFFR';
import { calculateFFRScore } from '@/utils/ffrScore';
import { useAuth } from '@/contexts/AuthContext';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

// ── Constants ─────────────────────────────────────────────────────────────────

const DARK_GREEN = '#0D2818';
const TEAL       = '#5DCAA5';

// ── Mobile score header ───────────────────────────────────────────────────────

function MobileScoreHeader() {
  const { inputs, results, projections, hasCalculated } = useFinancialPlanning();
  const { checklist } = useFFR(inputs && results ? { inputs, results } : undefined);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const retirementYear = hasCalculated && inputs
    ? new Date().getFullYear() + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP
    : null;
  const retirementLabel = retirementYear ? `Jan ${retirementYear}` : '—';

  const score =
    hasCalculated && inputs && results && projections.length > 0
      ? calculateFFRScore(inputs, results, projections, checklist)
      : null;

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const handleNavItem = (url: string) => {
    setMenuOpen(false);
    navigate(url);
  };

  return (
    <>
      <div
        className="sticky top-0 z-40 md:hidden px-4 py-3 flex items-center justify-between"
        style={{ background: DARK_GREEN }}
      >
        {/* Retirement date */}
        <div>
          <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: TEAL }}>
            Retirement Date
          </p>
          <p className="text-sm font-bold text-white leading-snug">{retirementLabel}</p>
        </div>

        {/* FFR Score */}
        <Link to="/dashboard/ffr" className="text-center" onClick={() => setMenuOpen(false)}>
          <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: TEAL }}>
            FFR Score
          </p>
          <p className="text-sm font-bold text-white leading-snug">
            {score !== null ? `${score}/100` : '—/100'}
          </p>
        </Link>

        {/* User avatar button */}
        <button
          onClick={() => setMenuOpen(true)}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          <User style={{ width: 16, height: 16, color: 'white' }} />
        </button>
      </div>

      {/* Bottom drawer — profile + nav */}
      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-0">
            <DrawerTitle className="text-left text-base">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'}
            </DrawerTitle>
            <p className="text-xs text-muted-foreground text-left -mt-1">{user?.email}</p>
          </DrawerHeader>

          <div className="px-4 pb-8 pt-4 space-y-1">
            <button
              onClick={() => handleNavItem('/dashboard/ffr')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-left hover:bg-accent transition-colors"
            >
              <LineChart className="h-4 w-4 text-muted-foreground" />
              Financial Freedom
            </button>

            <button
              onClick={() => handleNavItem('/dashboard/refer')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-left hover:bg-accent transition-colors"
            >
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              Refer a Friend
            </button>

            <button
              onClick={() => handleNavItem('/')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-left hover:bg-accent transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              Back to Website
            </button>

            <div className="w-full h-px bg-border my-2" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-left hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
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
  { key: 'compass', label: 'Compass', icon: Star,       url: '/dashboard/compass',   exact: false, premium: true  },
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
