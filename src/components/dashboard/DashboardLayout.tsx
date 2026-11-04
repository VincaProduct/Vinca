import { useState, useEffect, Suspense } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Shield, Sprout, Star, User, LogOut, LineChart, UserPlus, ExternalLink, Video, ChevronRight } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar, NAV, type SubItem } from './DashboardSidebar';
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
              onClick={() => handleNavItem('/dashboard/events')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-left hover:bg-accent transition-colors"
            >
              <Video className="h-4 w-4 text-muted-foreground" />
              Events
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

/** Pages in a sidebar section (Build, Protect, Grow), from the sidebar's own list */
const sectionPages = (key: string): SubItem[] => NAV.find((g) => g.key === key)?.sub ?? [];

const inSection = (key: string, pathname: string) =>
  sectionPages(key).some((p) => pathname === p.url || pathname.startsWith(p.url + '/'));

const MOBILE_TABS = [
  { key: 'home',    label: 'Home',    icon: Home,       url: '/dashboard',         premium: false },
  { key: 'build',   label: 'Build',   icon: TrendingUp, url: null,                 premium: false },
  { key: 'protect', label: 'Protect', icon: Shield,     url: null,                 premium: false },
  { key: 'grow',    label: 'Grow',    icon: Sprout,     url: null,                 premium: false },
  { key: 'compass', label: 'Compass', icon: Star,       url: '/dashboard/compass', premium: true  },
] as const;

function MobileTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { inputs, results, projections, hasCalculated } = useFinancialPlanning();
  const { checklist, ffrProgress } = useFFR(inputs && results ? { inputs, results } : undefined);
  // The section whose pages are listed in the bottom sheet
  const [openSection, setOpenSection] = useState<string | null>(null);

  const score =
    hasCalculated && inputs && results && projections.length > 0
      ? calculateFFRScore(inputs, results, projections, checklist)
      : null;
  const foundationScore = ffrProgress?.foundation_score ?? 0;

  function isTabActive(key: string, url: string | null) {
    if (url === '/dashboard') return location.pathname === url;
    if (url) return location.pathname === url || location.pathname.startsWith(url + '/');
    return inSection(key, location.pathname);
  }

  function dotColor(key: string): string | null {
    if (key === 'build')   return score !== null ? (score < 60 ? '#F59E0B' : '#10B981') : null;
    if (key === 'protect') return foundationScore < 10 ? '#EF4444' : '#10B981';
    return null;
  }

  // A section with one page opens it; with several, a sheet lists them all
  const openTab = (key: string, url: string | null) => {
    if (url) return navigate(url);
    const pages = sectionPages(key);
    if (pages.length === 1) return navigate(pages[0].url);
    setOpenSection(key);
  };

  const sheetPages = openSection ? sectionPages(openSection) : [];
  const sheetTitle = MOBILE_TABS.find((t) => t.key === openSection)?.label;

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-stretch"
        style={{ background: 'var(--ui-surface)', borderTop: '0.5px solid var(--ui-line)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {MOBILE_TABS.map(({ key, label, icon: Icon, url, premium }) => {
          const active = isTabActive(key, url) || openSection === key;
          const dot    = dotColor(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => openTab(key, url)}
              aria-haspopup={url ? undefined : 'dialog'}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-h-[52px]"
              style={
                premium
                  ? { border: '0.5px solid var(--ui-green-text)', color: 'var(--ui-green-text)' }
                  : active
                    ? { background: 'var(--ui-green-bg)', color: 'var(--ui-green-text)' }
                    : { color: 'var(--ui-text-faint)' }
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
            </button>
          );
        })}
      </nav>

      {/* Every page in the section, so none is hidden behind the first one */}
      <Drawer open={openSection !== null} onOpenChange={(o) => !o && setOpenSection(null)}>
        <DrawerContent>
          <DrawerHeader className="pb-0">
            <DrawerTitle className="text-left text-base">{sheetTitle}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 pt-3 space-y-1">
            {sheetPages.map(({ title, url, icon: Icon }) => {
              const current = location.pathname === url || location.pathname.startsWith(url + '/');
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => { setOpenSection(null); navigate(url); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-left transition-colors ${
                    current ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${current ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="flex-1">{title}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

/** Phone: the other pages of the section you're in, as a scrollable row of tabs */
function MobileSectionTabs() {
  const location = useLocation();
  const section = ['build', 'protect', 'grow'].find((k) => inSection(k, location.pathname));
  const pages = section ? sectionPages(section) : [];
  if (pages.length < 2) return null;

  return (
    <div className="md:hidden border-b border-border bg-background">
      <div className="flex gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pages.map(({ title, url }) => {
          const current = location.pathname === url || location.pathname.startsWith(url + '/');
          return (
            <Link
              key={url}
              to={url}
              aria-current={current ? 'page' : undefined}
              className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                current ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'
              }`}
            >
              {title}
            </Link>
          );
        })}
      </div>
    </div>
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

  // Every dashboard page opens at its top, not at the previous page's scroll
  // position (links to a #section still jump there)
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

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

            <MobileSectionTabs />

            {/* Page content — bottom padding on mobile for tab bar clearance.
                Nothing may push the page wider than the phone screen. */}
            <main className="flex-1 min-w-0 overflow-x-clip bg-background pb-20 md:pb-0">
              <Suspense
                fallback={
                  <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                }
              >
                <Outlet />
              </Suspense>
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
