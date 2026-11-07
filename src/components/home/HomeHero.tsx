import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { HERO } from '@/content/homeHero';
import { openConsultation } from '@/lib/funnel';

/**
 * Homepage Section 1: who we are, two actions, and how it works as a
 * timeline that fills step by step on a loop. Motion is CSS only
 * (transform/opacity, ~1 KB) and stops for visitors who prefer reduced motion.
 */
const STEP_COUNT = HERO.steps.length;
const LOOP = 8; // seconds
// Step i lights when the line reaches it: 5%, 25%, 45%, 65% of the loop
const stepKeyframes = HERO.steps.map((_, i) => {
  const at = 5 + (60 * i) / (STEP_COUNT - 1);
  return `@keyframes hh-step${i}{0%,${at - 0.1}%{opacity:var(--off)}${at + 4}%,90%{opacity:1}97%,100%{opacity:var(--off)}}
.hh-step${i}{animation:hh-step${i} ${LOOP}s linear infinite}`;
}).join('');

const MOTION_CSS = `
@keyframes hh-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes hh-fill{0%,5%{transform:scaleY(0);opacity:1}65%,90%{transform:scaleY(1);opacity:1}97%,100%{transform:scaleY(1);opacity:0}}
.hh-rise{animation:hh-rise .6s cubic-bezier(.22,1,.36,1) both}
.hh-fill{transform-origin:top;animation:hh-fill ${LOOP}s linear infinite}
.hh-dot{--off:0}.hh-text{--off:.45}
${stepKeyframes}
@media (prefers-reduced-motion:reduce){.hh-rise,.hh-fill,.hh-dot,.hh-text,${HERO.steps.map((_, i) => `.hh-step${i}`).join(',')}{animation:none}}
`;

const HomeHero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-background px-4 pb-14 pt-20 sm:px-6 sm:pt-28 lg:px-16 lg:pb-24 lg:pt-36">
      <style>{MOTION_CSS}</style>
      {/* Soft brand glow, static */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 75% 35%, hsl(158 64% 52% / 0.08), transparent 70%)' }} />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Left: who we are and what to do */}
        <div className="min-w-0">
          <p className="hh-rise text-xs font-semibold uppercase tracking-wider sm:text-sm" style={{ color: 'var(--brand-text)' }}>
            {HERO.eyebrow}
          </p>
          <h1 className="hh-rise mt-3 text-[2rem] font-bold leading-[1.12] text-foreground sm:text-5xl lg:text-[3.4rem]"
            style={{ animationDelay: '80ms', textWrap: 'balance' } as React.CSSProperties}>
            {HERO.h1}
          </h1>
          <p className="hh-rise mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg" style={{ animationDelay: '160ms' }}>
            {HERO.subline}
          </p>

          <div className="hh-rise mt-6 flex flex-col gap-3 sm:flex-row sm:items-start" style={{ animationDelay: '240ms' }}>
            <div className="flex flex-col items-stretch gap-1.5 sm:items-center">
              <Button size="lg" className="h-auto min-h-[52px] px-6 py-3 text-base font-semibold"
                onClick={() => navigate(user ? '/dashboard/ffr' : '/financial-freedom-calculator')}>
                {user ? HERO.primarySignedIn : HERO.primary}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              {!user && <span className="text-center text-xs text-muted-foreground">{HERO.primaryNote}</span>}
            </div>
            <Button size="lg" variant="outline" className="h-auto min-h-[52px] border-primary/50 px-6 py-3 text-base font-semibold"
              onClick={() => openConsultation(navigate, !!user)}>
              {HERO.secondary}
            </Button>
          </div>

          <ul className="hh-rise mt-6 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground sm:text-sm" style={{ animationDelay: '320ms' }}>
            {HERO.trust.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: how it works (explains only, nothing to click) */}
        <div className="hh-rise min-w-0 rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur sm:p-7" style={{ animationDelay: '200ms' }}>
          <p className="mb-5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-text)' }}>{HERO.stepsLabel}</p>
          <ol className="relative">
            {/* Track and the fill that runs down it */}
            <span aria-hidden="true" className="absolute bottom-6 left-[15px] top-4 w-0.5 rounded-full bg-border">
              <span className="hh-fill absolute inset-0 rounded-full bg-primary" />
            </span>
            {HERO.steps.map((step, i) => (
              <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                <span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-muted-foreground">
                  {i + 1}
                  <span aria-hidden="true" className={`hh-dot hh-step${i} absolute inset-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(158_64%_52%/0.18)]`}>
                    {i + 1}
                  </span>
                </span>
                <div className={`hh-text hh-step${i} min-w-0 pt-0.5`}>
                  <p className="font-semibold leading-snug text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{step.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
