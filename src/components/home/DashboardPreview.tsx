import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Gauge, LineChart, Scale, Shield, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { PREVIEW, type PreviewCardKey } from '@/content/homeHero';
import { openDashboardPage } from '@/lib/funnel';

const ICONS: Record<PreviewCardKey, LucideIcon> = {
  score: Gauge,
  realworth: Scale,
  market: LineChart,
  insurance: Shield,
  learn: BookOpen,
};

// Cards rise in one after another the first time the section scrolls into view
const MOTION_CSS = `
@keyframes dp-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.dp-wait{opacity:0}.dp-in{animation:dp-rise .55s cubic-bezier(.22,1,.36,1) both}
@media (prefers-reduced-motion:reduce){.dp-wait{opacity:1}.dp-in{animation:none}}
`;

/** Homepage Section 2: what the free dashboard gives you, and the way in */
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

  const motion = (i: number) => (shown ? { className: 'dp-in', style: { animationDelay: `${i * 90}ms` } } : { className: 'dp-wait', style: {} });

  return (
    <section ref={ref} className="border-t border-border bg-muted/30 px-4 py-14 sm:px-6 lg:px-16 lg:py-24">
      <style>{MOTION_CSS}</style>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
        {/* Left: heading and main action (stays in view while the cards scroll on desktop) */}
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-4xl" style={{ textWrap: 'balance' } as React.CSSProperties}>
            {PREVIEW.h2}
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">{PREVIEW.text}</p>
          <Button size="lg" className="mt-6 h-auto min-h-[52px] px-6 py-3 text-base font-semibold"
            onClick={() => navigate(user ? '/dashboard/ffr' : '/financial-freedom-calculator')}>
            {PREVIEW.button}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Right: what's inside, then the way in */}
        <div className="min-w-0 space-y-3">
          {PREVIEW.cards.map((card, i) => {
            const Icon = ICONS[card.key];
            const m = motion(i);
            return (
              <a
                key={card.key}
                href={card.url}
                onClick={(e) => {
                  e.preventDefault();
                  openDashboardPage(navigate, !!user, card.url);
                }}
                className={`${m.className} group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:p-5`}
                style={m.style}
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug text-foreground">{card.title}</h3>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{card.line}</span>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
              </a>
            );
          })}

          {/* Sign-in bar */}
          <div className={`${motion(PREVIEW.cards.length).className} flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}
            style={motion(PREVIEW.cards.length).style}>
            <p className="text-sm font-medium text-foreground">{user ? PREVIEW.signedIn : PREVIEW.signIn}</p>
            <Button className="min-h-[44px] flex-shrink-0 px-5 font-semibold" onClick={() => navigate(user ? '/dashboard' : '/auth')}>
              {user ? PREVIEW.signedInButton : PREVIEW.signInButton}
            </Button>
          </div>
          <p className="pt-1 text-xs leading-relaxed text-muted-foreground">{PREVIEW.disclaimer}</p>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
