import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import {
  FinancialPlanningProvider,
  useFinancialPlanning,
} from '@/components/financial-planning/context/FinancialPlanningContext';
import { useFFR } from '@/hooks/useFFR';
import { calculateFFRScore } from '@/utils/ffrScore';
import { useAuth } from '@/contexts/AuthContext';

// ── constants ─────────────────────────────────────────────────────────────────
const GREEN   = '#06A969';
const DARK_BG = '#0D2818';

// ── helpers (logic unchanged) ─────────────────────────────────────────────────

function scoreStatus(score: number): string {
  if (score <= 40) return 'Needs attention';
  if (score <= 70) return 'On track';
  return 'Strong readiness';
}

function scoreBadgeClass(score: number): string {
  if (score <= 40) return 'bg-red-500/10 text-red-600 dark:text-red-400';
  if (score <= 70) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
  return 'bg-green-500/10 text-green-600 dark:text-green-400';
}

function nextStepRoute(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  if (/sip|saving|corpus|invest|habit/.test(text)) return '/dashboard/sprints';
  if (/insurance|foundation|emergency|kyc|nomination/.test(text)) return '/dashboard/insurance';
  return '/dashboard/elevate';
}

function greeting(name: string): string {
  const h = new Date().getHours();
  const salutation = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${salutation}, ${name}`;
}

// ── Content ───────────────────────────────────────────────────────────────────

function DashboardHomeContent() {
  const { user } = useAuth();
  const { inputs, results, projections, hasCalculated } = useFinancialPlanning();
  const { checklist, getNextSteps } = useFFR(
    inputs && results ? { inputs, results } : undefined
  );

  // Greeting name
  const fullName  = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const firstName = fullName.split(' ')[0];

  // Retirement date
  const retirementYear = hasCalculated && inputs
    ? new Date().getFullYear() + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP
    : null;
  const retirementLabel = retirementYear ? `January ${retirementYear}` : null;

  // FFR score — same source as FFRScoreCard on /dashboard/ffr
  const score =
    hasCalculated && inputs && results && projections.length > 0
      ? calculateFFRScore(inputs, results, projections, checklist)
      : null;

  // Next action — first step only
  const nextSteps = getNextSteps();
  const firstStep = nextSteps[0] ?? null;

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">

        {/* ── Greeting ────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{greeting(firstName)}</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's where your plan stands today.</p>
        </div>

        {/* ── Card 1: Retirement Clock ─────────────────────────────────── */}
        <div
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{ background: DARK_BG }}
        >
          {/* Background clock icon */}
          <Clock
            className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none select-none"
            style={{ width: 100, height: 100, color: 'rgba(255,255,255,0.06)' }}
          />

          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: 'rgba(134,239,172,0.75)' }}
          >
            Your projected retirement date
          </p>

          {retirementLabel ? (
            <>
              <p
                className="text-5xl font-black text-white leading-tight mb-3"
                style={{ letterSpacing: '-0.02em' }}
              >
                {retirementLabel}
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Based on your current plan
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold text-white mb-3 max-w-xs leading-snug">
                Complete your financial profile to unlock your retirement date.
              </p>
              <Link
                to="/dashboard/ffr"
                className="text-sm font-semibold hover:underline"
                style={{ color: GREEN }}
              >
                Set up your plan →
              </Link>
            </>
          )}
        </div>

        {/* ── Card 2: FFR Score ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Financial freedom readiness
          </p>

          {score !== null ? (
            <>
              {/* Score number */}
              <div className="flex items-end gap-2">
                <span
                  className="text-7xl font-black leading-none text-foreground"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {score}
                </span>
                <span className="text-2xl text-muted-foreground mb-1">/100</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${score}%`, background: GREEN }}
                />
              </div>

              {/* Status badge + link */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${scoreBadgeClass(score)}`}>
                  {scoreStatus(score)}
                </span>
                <Link
                  to="/dashboard/ffr"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  See full breakdown →
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-base text-muted-foreground leading-relaxed">
                Complete your profile to see your score.
              </p>
              <Link
                to="/dashboard/ffr"
                className="inline-block text-sm font-semibold text-primary hover:underline"
              >
                Get your score →
              </Link>
            </div>
          )}
        </div>

        {/* ── Card 3: Portfolio ───────────────────────────────────────── */}
        <div
          className="rounded-2xl border border-border bg-card p-8 space-y-4"
          style={{ borderLeft: '3px solid #0F6E56', borderRadius: '0 12px 12px 0' }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Your Portfolio
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            View and manage your Vinca investments
          </p>
          <a
            href="https://portfolio.vincawealth.com/login"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full px-5 py-2.5 rounded-lg text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: '#0F6E56', fontWeight: 500 }}
          >
            Open Vinca Portfolio →
          </a>
        </div>

        {/* ── Card 4: Next Action ──────────────────────────────────────── */}
        {firstStep && (
          <div
            className="rounded-2xl border border-border bg-card p-8 space-y-4"
            style={{ borderLeft: '4px solid #F59E0B' }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Your biggest opportunity right now
            </p>
            <div className="space-y-2">
              <p className="text-xl font-bold text-foreground leading-snug">
                {firstStep.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {firstStep.description}
              </p>
            </div>
            <Link
              to={nextStepRoute(firstStep.title, firstStep.description)}
              className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: GREEN }}
            >
              Take action →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  return (
    <FinancialPlanningProvider>
      <DashboardHomeContent />
    </FinancialPlanningProvider>
  );
}
