import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { HERO } from '@/content/homeHero';
import { openConsultation } from '@/lib/funnel';
import HeroPhoneStory from './HeroPhoneStory';

/**
 * Homepage Section 1: who we are and two actions on the left; on the right,
 * three phones playing what the dashboard gives you (HeroPhoneStory).
 */
const MOTION_CSS = `
@keyframes hh-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.hh-rise{animation:hh-rise .6s cubic-bezier(.22,1,.36,1) both}
@media (prefers-reduced-motion:reduce){.hh-rise{animation:none}}
`;

const HomeHero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-background px-4 pb-14 pt-20 sm:px-6 sm:pt-24 lg:px-16 lg:pb-16 lg:pt-24">
      <style>{MOTION_CSS}</style>
      {/* Soft brand glow, static */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 75% 35%, hsl(158 64% 52% / 0.08), transparent 70%)' }} />
      {/* Floating bubbles, as on the previous homepage (decoration only) */}
      <div aria-hidden="true" className="pointer-events-none absolute right-[6%] top-[12%] h-72 w-72 rounded-full bg-primary/[0.04] sm:h-80 sm:w-80" style={{ animation: 'float 6s ease-in-out infinite' }} />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[10%] left-[3%] h-44 w-44 rounded-full bg-primary/[0.04]" style={{ animation: 'float 8s ease-in-out infinite reverse' }} />
      <div aria-hidden="true" className="pointer-events-none absolute right-[30%] top-[55%] hidden h-28 w-28 rounded-full bg-primary/[0.03] lg:block" style={{ animation: 'float 5s ease-in-out infinite 1s' }} />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-10 xl:gap-14">
        {/* Left: who we are and what to do */}
        <div className="min-w-0">
          <p className="hh-rise text-xs font-semibold uppercase tracking-wider sm:text-sm" style={{ color: 'var(--brand-text)' }}>
            {HERO.eyebrow}
          </p>
          <h1 className="hh-rise mt-3 text-[2rem] font-bold leading-[1.12] text-foreground sm:text-5xl lg:text-[3.4rem]"
            style={{ animationDelay: '80ms', textWrap: 'balance' } as React.CSSProperties}>
            {HERO.h1.split(HERO.h1Highlight)[0]}
            <span style={{ color: 'var(--brand-text)' }}>{HERO.h1Highlight}</span>
            {HERO.h1.split(HERO.h1Highlight)[1]}
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

        {/* Right: the dashboard, told as a story on three phones */}
        <div className="hh-rise min-w-0" style={{ animationDelay: '200ms' }}>
          <HeroPhoneStory />
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
