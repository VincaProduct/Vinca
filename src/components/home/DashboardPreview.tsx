import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, Gauge, LineChart, Scale, Shield, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { PREVIEW, type PreviewCardKey } from '@/content/homeHero';

const ICONS: Record<PreviewCardKey, LucideIcon> = {
  compass: Compass,
  score: Gauge,
  realworth: Scale,
  market: LineChart,
  insurance: Shield,
  learn: BookOpen,
};

// Ring: an arc sweeps round and settles, on a slow loop. Cards rise in one
// after another the first time the section scrolls into view. CSS only.
const RING = 2 * Math.PI * 52;
const MOTION_CSS = `
@keyframes dp-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes dp-arc{0%{stroke-dashoffset:${RING}}45%,80%{stroke-dashoffset:${RING * 0.32}}100%{stroke-dashoffset:${RING}}}
@keyframes dp-spin{to{transform:rotate(360deg)}}
.dp-wait{opacity:0}.dp-in{animation:dp-rise .55s cubic-bezier(.22,1,.36,1) both}
.dp-arc{stroke-dasharray:${RING};animation:dp-arc 6s cubic-bezier(.45,0,.2,1) infinite}
.dp-orbit{animation:dp-spin 18s linear infinite}
@media (prefers-reduced-motion:reduce){.dp-wait{opacity:1}.dp-in,.dp-arc,.dp-orbit{animation:none}}
`;

/** Homepage Section 2: what the free dashboard includes, and one way in */
const DashboardPreview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setShown(true);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true);
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px -15% 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const motion = (i: number) => (shown ? { className: 'dp-in', style: { animationDelay: `${i * 80}ms` } } : { className: 'dp-wait', style: {} });

  return (
    <section ref={ref} className="relative overflow-hidden border-t border-border bg-muted/30 px-4 py-14 sm:px-6 lg:px-16 lg:py-24">
      <style>{MOTION_CSS}</style>
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        {/* Left: heading, the score ring and the main action */}
        <div className="relative min-w-0 lg:sticky lg:top-28 lg:self-start">
          {/* Soft floating bubbles, decoration only */}
          <div aria-hidden="true" className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-primary/[0.06]" style={{ animation: 'float 7s ease-in-out infinite' }} />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 right-6 h-24 w-24 rounded-full bg-primary/[0.05]" style={{ animation: 'float 9s ease-in-out infinite reverse' }} />

          <div className="relative">
            <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-4xl" style={{ textWrap: 'balance' } as React.CSSProperties}>
              {PREVIEW.h2}
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">{PREVIEW.text}</p>

            {/* Score ring: shows the scale, not a number, until you check yours */}
            <div className="mt-8 flex items-center gap-5">
              <div className="relative h-32 w-32 flex-shrink-0" aria-hidden="true">
                <div className="dp-orbit absolute -inset-3">
                  <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-primary/70" />
                  <span className="absolute bottom-3 left-1 h-1.5 w-1.5 rounded-full bg-primary/40" />
                </div>
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" strokeWidth="9" className="stroke-border" />
                  <circle cx="60" cy="60" r="52" fill="none" strokeWidth="9" strokeLinecap="round" className="dp-arc stroke-primary" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold leading-none text-foreground">?</span>
                  <span className="mt-1 text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-text)' }}>{PREVIEW.scoreLabel}</p>
                <Button size="lg" className="mt-2 h-auto min-h-[52px] px-6 py-3 text-base font-semibold"
                  onClick={() => navigate(user ? '/dashboard/ffr' : '/financial-freedom-calculator')}>
                  {PREVIEW.button}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: what the dashboard includes, then one way in */}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-text)' }}>{PREVIEW.cardsLabel}</p>
          <h3 className="mt-2 text-xl font-semibold leading-snug text-foreground sm:text-2xl">{PREVIEW.cardsHeading}</h3>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {PREVIEW.cards.map((card, i) => {
              const Icon = ICONS[card.key];
              const m = motion(i);
              const main = !!card.badge;
              // With an odd number of smaller cards, the last one fills the row
              const fill = !main && i === PREVIEW.cards.length - 1 && PREVIEW.cards.filter((c) => !c.badge).length % 2 === 1;
              return (
                <li key={card.key}
                  className={`${m.className} flex gap-3.5 rounded-2xl border p-4 ${main ? 'border-primary/40 bg-primary/[0.07] sm:col-span-2' : 'border-border bg-card'} ${fill ? 'sm:col-span-2' : ''}`}
                  style={m.style}>
                  <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${main ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold leading-snug text-foreground">{card.title}</h4>
                      {card.badge && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold" style={{ color: 'var(--brand-text)' }}>{card.badge}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{card.line}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Sign-in bar: the one way in */}
          <div className={`${motion(PREVIEW.cards.length).className} mt-4 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}
            style={motion(PREVIEW.cards.length).style}>
            <p className="font-medium text-foreground">{user ? PREVIEW.signedIn : PREVIEW.signIn}</p>
            <Button className="min-h-[44px] flex-shrink-0 px-5 font-semibold" onClick={() => navigate(user ? '/dashboard' : '/auth')}>
              {user ? PREVIEW.signedInButton : PREVIEW.signInButton}
            </Button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{PREVIEW.disclaimer}</p>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
