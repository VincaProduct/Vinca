/**
 * The shots each hero phone plays, cut from screen recordings of the real
 * dashboard (public/hero/*.webp, 600x1167, ~35 KB each).
 *
 * Every shot is one still that moves: it zooms or pans from `from` to `to`
 * over `ms`, around the point (ox, oy) in % of the image. Short shots with
 * the "fast" easing feel like a quick scroll; long ones with "slow" let the
 * important part sink in. `callout` pops out beside the phone.
 */

export type Shot = {
  src: string;
  ms: number;
  ease: 'slow' | 'fast';
  ox: number;
  oy: number;
  /** [scale, translateY %] at the start and the end */
  from: [number, number];
  to: [number, number];
  callout?: string;
};

export const SHOTS: Record<'score' | 'market' | 'compass', Shot[]> = {
  score: [
    { src: '/hero/ffr-score.webp', ms: 2400, ease: 'slow', ox: 50, oy: 17, from: [1, 0], to: [1.32, 0], callout: 'Your Freedom Score, out of 100' },
    { src: '/hero/ffr-chart.webp', ms: 2000, ease: 'slow', ox: 62, oy: 42, from: [1.08, 3], to: [1.28, 0], callout: 'When your money could run out' },
    { src: '/hero/ffr-checks.webp', ms: 1300, ease: 'fast', ox: 50, oy: 50, from: [1.12, 6], to: [1.12, -6], callout: 'A checklist of what to fix' },
    { src: '/hero/ffr-book.webp', ms: 2000, ease: 'slow', ox: 50, oy: 32, from: [1.3, 0], to: [1, 0], callout: 'Book a free 30-min session' },
  ],
  market: [
    { src: '/hero/mkt-pulse.webp', ms: 1200, ease: 'fast', ox: 50, oy: 40, from: [1, 0], to: [1.08, -3] },
    { src: '/hero/mkt-heat.webp', ms: 2200, ease: 'slow', ox: 30, oy: 22, from: [1.05, 0], to: [1.38, 0], callout: 'Nifty P/E across 25 years' },
    { src: '/hero/mkt-pe.webp', ms: 1900, ease: 'slow', ox: 50, oy: 30, from: [1, 0], to: [1.25, 0], callout: "Today's P/E vs its 5-year average" },
    { src: '/hero/mkt-worth.webp', ms: 2200, ease: 'slow', ox: 50, oy: 33, from: [1.02, 0], to: [1.3, 0], callout: 'What your savings are really worth' },
    { src: '/hero/mkt-bars.webp', ms: 1200, ease: 'fast', ox: 50, oy: 50, from: [1.1, 5], to: [1.1, -5] },
  ],
  compass: [
    { src: '/hero/cmp-hero.webp', ms: 2000, ease: 'slow', ox: 30, oy: 14, from: [1.3, 0], to: [1.02, 0], callout: 'A real person on your side' },
    { src: '/hero/cmp-q1.webp', ms: 1000, ease: 'fast', ox: 50, oy: 30, from: [1, 0], to: [1.06, 0] },
    { src: '/hero/cmp-q3.webp', ms: 1100, ease: 'fast', ox: 50, oy: 30, from: [1, 0], to: [1.06, 0], callout: '3 quick questions' },
    { src: '/hero/cmp-ok.webp', ms: 2400, ease: 'slow', ox: 22, oy: 20, from: [1, 0], to: [1.3, 0], callout: 'Then book a free call' },
  ],
};

export const storyLength = (shots: Shot[]) => shots.reduce((sum, s) => sum + s.ms, 0);
