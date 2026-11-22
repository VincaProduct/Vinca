import { useEffect, useRef, useState } from 'react';
import { HERO } from '@/content/homeHero';
import { SHOTS, storyLength, type Shot } from './heroShots';

/**
 * Hero: three phones playing the dashboard as a story (Score, Market,
 * Compass), one "on stage" at a time, like Instagram Stories. Each shot is a
 * still that zooms or pans (fast for quick scrolls, slow for what matters)
 * with a card popping out beside the phone. CSS transforms only; pauses on
 * hover, off-screen or in a background tab; still screens for reduced motion.
 * On phones only the active phone shows, with the labels as tabs.
 */

const TICK = 100;
const STORIES = HERO.stories;

const CSS = `
@keyframes hs-in{from{opacity:0;transform:scale(.965)}to{opacity:1;transform:none}}
@keyframes hs-move{from{transform:translateY(var(--fy)) scale(var(--fs))}to{transform:translateY(var(--ty)) scale(var(--ts))}}
@keyframes hs-pop{0%{opacity:0;transform:translateY(8px) scale(.92)}60%{opacity:1;transform:translateY(-2px) scale(1.02)}100%{opacity:1;transform:none}}
@keyframes hs-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.hs-in{animation:hs-in .42s cubic-bezier(.22,1,.36,1) both}
.hs-move{animation-name:hs-move;animation-fill-mode:both}
.hs-pop{animation:hs-pop .5s cubic-bezier(.22,1,.36,1) both}
.hs-bar{transform-origin:left;animation-name:hs-bar;animation-timing-function:linear;animation-fill-mode:both}
.hs-paused .hs-move,.hs-paused .hs-bar,.hs-paused .hs-pop{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.hs-in,.hs-move,.hs-pop,.hs-bar{animation:none}}
`;

const EASE = { slow: 'cubic-bezier(.33,0,.2,1)', fast: 'cubic-bezier(.8,0,.2,1)' };

const shotStyle = (shot: Shot, play: boolean): React.CSSProperties => ({
  transformOrigin: `${shot.ox}% ${shot.oy}%`,
  ...(play
    ? {
        ['--fs' as string]: shot.from[0], ['--fy' as string]: `${shot.from[1]}%`,
        ['--ts' as string]: shot.to[0], ['--ty' as string]: `${shot.to[1]}%`,
        animationDuration: `${shot.ms}ms`,
        animationTimingFunction: EASE[shot.ease],
      }
    : { transform: `translateY(${shot.from[1]}%) scale(${shot.from[0]})` }),
});

const ShotImage = ({ shot, play, eager }: { shot: Shot; play: boolean; eager?: boolean }) => (
  <img
    src={shot.src}
    alt=""
    width={600}
    height={1167}
    decoding="async"
    loading={eager ? 'eager' : 'lazy'}
    {...{ fetchpriority: 'low' }}
    draggable={false}
    className={`absolute inset-0 h-full w-full object-cover object-top ${play ? 'hs-move' : ''}`}
    style={shotStyle(shot, play)}
  />
);

// Fan layout on desktop: left and right phones tilt outwards and sit lower
const FAN = [
  { rotate: -7, y: 26, side: 'right' as const },
  { rotate: 0, y: 0, side: 'alt' as const },
  { rotate: 7, y: 26, side: 'left' as const },
];

const HeroPhoneStory = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [story, setStory] = useState(0);
  const [shot, setShot] = useState(0);
  const [prevShot, setPrevShot] = useState<Shot | null>(null);
  const [hover, setHover] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  const [started, setStarted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [wide, setWide] = useState(false);
  const elapsed = useRef(0);

  const paused = hover || !onScreen || tabHidden || !started || reduced;
  const shots = SHOTS[STORIES[story].key];
  const current = shots[shot];

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    setReduced(!!mq?.matches);
    // The fan (tilt, overlap) is for wide screens; phones show one straight phone
    const wq = window.matchMedia?.('(min-width: 1024px)');
    const onWide = () => setWide(!!wq?.matches);
    onWide();
    wq?.addEventListener?.('change', onWide);
    const t = setTimeout(() => setStarted(true), 900);
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    let io: IntersectionObserver | undefined;
    if (ref.current && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.25 });
      io.observe(ref.current);
    }
    return () => { clearTimeout(t); document.removeEventListener('visibilitychange', onVis); wq?.removeEventListener?.('change', onWide); io?.disconnect(); };
  }, []);

  // Fetch the rest of the shots once the page has settled (~440 KB in all)
  useEffect(() => {
    if (!started) return;
    const id = setTimeout(() => {
      Object.values(SHOTS).flat().forEach((s) => { const img = new Image(); img.decoding = 'async'; img.src = s.src; });
    }, 1200);
    return () => clearTimeout(id);
  }, [started]);

  // Advance shot by shot; at the end of a story, move the stage to the next phone
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      elapsed.current += TICK;
      if (elapsed.current < current.ms) return;
      elapsed.current = 0;
      if (shot + 1 < shots.length) { setPrevShot(current); setShot(shot + 1); }
      else { setPrevShot(null); setStory((story + 1) % STORIES.length); setShot(0); }
    }, TICK);
    return () => clearInterval(id);
  }, [paused, current, shot, shots.length, story]);

  const goTo = (i: number) => {
    if (i === story) return;
    elapsed.current = 0;
    setPrevShot(null);
    setStory(i);
    setShot(0);
  };

  const play = !reduced && started;
  const sideFor = (i: number) => (FAN[i].side === 'alt' ? (shot % 2 === 0 ? 'left' : 'right') : FAN[i].side);

  return (
    <div ref={ref} className={`relative min-w-0 ${paused ? 'hs-paused' : ''}`}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <style>{CSS}</style>
      <p className="sr-only">{HERO.storiesLabel}: {STORIES.map((s) => `${s.title} (${s.note})`).join('; ')}.</p>

      {/* Soft glow behind the stage */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[42%] h-[70%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(closest-side, hsl(158 64% 45% / 0.22), transparent)' }} />

      {/* Phones */}
      <div aria-hidden="true" className="relative flex items-start justify-center pt-2 lg:pt-6">
        {STORIES.map((s, i) => {
          const active = i === story;
          const first = SHOTS[s.key][0];
          const side = sideFor(i);
          return (
            <div key={s.key}
              className={`relative flex-shrink-0 transition-[transform,filter,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)] lg:mx-[-22px] ${active ? 'block' : 'hidden lg:block'}`}
              style={{
                zIndex: active ? 30 : 10 + i,
                transform: wide ? `translateY(${FAN[i].y - (active ? 14 : 0)}px) rotate(${FAN[i].rotate}deg) scale(${active ? 1.04 : 0.9})` : 'none',
                filter: active ? 'none' : 'brightness(.55) saturate(.8)',
              }}>
              <button type="button" tabIndex={-1} onClick={() => goTo(i)}
                className={`block w-[220px] rounded-[2.3rem] bg-[#070b0a] p-[7px] ring-1 ring-white/10 sm:w-[236px] lg:w-[176px] xl:w-[218px] 2xl:w-[236px] ${active ? 'shadow-[0_30px_70px_-20px_hsl(158_64%_30%/0.65)] cursor-default' : 'shadow-xl cursor-pointer'}`}>
                <div className="relative aspect-[600/1167] overflow-hidden rounded-[1.85rem] bg-[#111a17]">
                  {active ? (
                    <>
                      {prevShot && <ShotImage key={`p-${prevShot.src}`} shot={prevShot} play={false} />}
                      <div key={`${story}-${shot}`} className={`absolute inset-0 ${prevShot ? 'hs-in' : ''}`}>
                        <ShotImage shot={current} play={play} eager />
                      </div>
                    </>
                  ) : (
                    <ShotImage shot={first} play={false} eager />
                  )}
                  <span className="absolute left-1/2 top-2 h-[18px] w-[64px] -translate-x-1/2 rounded-full bg-[#070b0a]" />
                </div>
              </button>

              {/* Card popping out of the active phone */}
              {active && current.callout && started && (
                <div key={`c-${story}-${shot}`}
                  className={`hs-pop pointer-events-none absolute z-40 lg:w-max lg:max-w-[230px] rounded-xl border border-primary/30 bg-card/95 px-3.5 py-2.5 text-sm font-semibold leading-snug text-foreground shadow-[0_12px_30px_-12px_rgba(0,0,0,.5)] backdrop-blur
                    inset-x-4 bottom-6 text-center
                    lg:inset-x-auto lg:bottom-auto lg:text-left ${side === 'left' ? 'lg:right-[82%] lg:top-[14%]' : 'lg:left-[82%] lg:top-[56%]'}`}>
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-primary align-middle" />
                  {current.callout}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* The three steps, with a progress bar on the one playing */}
      <div className="relative mt-8 grid grid-cols-3 gap-2 sm:gap-3 lg:mt-12">
        {STORIES.map((s, i) => {
          const active = i === story;
          return (
            <button key={s.key} type="button" onClick={() => goTo(i)} aria-pressed={active}
              className={`group relative overflow-hidden rounded-xl border px-2.5 py-2.5 text-left transition-colors sm:px-3.5 sm:py-3 ${active ? 'border-primary/50 bg-primary/[0.08]' : 'border-border bg-card/60 hover:border-primary/30'}`}>
              <span className="flex items-center gap-2">
                <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                <span className="text-xs font-semibold leading-tight text-foreground sm:text-sm">{s.title}</span>
              </span>
              <span className="mt-1 hidden text-xs leading-snug text-muted-foreground sm:block">{s.note}</span>
              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-border/60">
                {active && play && (
                  <span key={`bar-${story}`} className="hs-bar block h-full bg-primary"
                    style={{ animationDuration: `${storyLength(SHOTS[s.key])}ms` }} />
                )}
              </span>
            </button>
          );
        })}
      </div>
      <p className="relative mt-3 text-center text-xs text-muted-foreground">
        {HERO.storiesNote} · <span className="opacity-80">{HERO.storiesCaption}</span>
      </p>
    </div>
  );
};

export default HeroPhoneStory;
