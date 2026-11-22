/**
 * Homepage Section 1 (hero) and Section 2 (dashboard preview) copy. Shared by
 * the page and the pages edge function, which pre-renders it for search
 * engines, so it must not import anything that uses the "@/" alias.
 */
import { PMS_APRN, PMS_ENABLED } from './pms.ts';

export const HERO = {
  eyebrow: 'AMFI-registered Mutual Fund Distributor · Bengaluru',
  h1: 'Invest for a Retirement you can count on',
  /** The word in the headline shown in brand green */
  h1Highlight: 'Retirement',
  // PMS is mentioned only once the APRN is set (src/content/pms.ts)
  subline: PMS_ENABLED
    ? "We help working families build their retirement with mutual funds, and PMS for larger portfolios. Start with your numbers, then talk to a real person when you're ready."
    : "We help working families build their retirement with mutual funds. Start with your numbers, then talk to a real person when you're ready.",
  primary: 'See where my retirement stands',
  primarySignedIn: 'Open my Freedom Score',
  primaryNote: '2 minutes · no sign-up',
  secondary: 'Talk to our team',
  trust: [
    'ARN-293401',
    ...(PMS_ENABLED ? [`PMS distributor · ${PMS_APRN}`] : []),
    'Your money goes straight to the fund house',
    '100+ families invest with us',
  ],
  /** The three phones: what you get once you sign in (shown as a story) */
  storiesLabel: 'Inside your free dashboard',
  storiesNote: 'Sign in free with Google to unlock all three',
  storiesCaption: 'Illustrative screens from the Vinca dashboard',
  stories: [
    { key: 'score', title: 'Know your number', note: 'Your Freedom Score and what to fix' },
    { key: 'market', title: 'Read the market', note: 'P/E history and what your money is really worth' },
    { key: 'compass', title: 'Talk to a real person', note: 'Compass: one person who knows your full picture' },
  ] as { key: 'score' | 'market' | 'compass'; title: string; note: string }[],
};

export type PreviewCardKey = 'compass' | 'score' | 'realworth' | 'market' | 'insurance' | 'learn';

export const PREVIEW = {
  h2: 'Are you on track for financial freedom?',
  text: 'See your Freedom Score in 2 minutes. No sign-up for your first result.',
  button: 'Check my score',
  scoreLabel: 'Your Freedom Score',
  cardsLabel: 'Inside your free dashboard',
  cardsHeading: 'Everything you need for your retirement, in one place',
  cards: [
    { key: 'compass', title: 'Compass: a real person on your side', line: 'Book a free consultation. One person who knows your full picture keeps your plan on track.', badge: 'Our programme' },
    { key: 'score', title: 'Will my money last?', line: 'Your score, your gap, and how your plan holds up in bad years.' },
    { key: 'realworth', title: 'What will my savings really be worth?', line: 'Compare FD, gold, debt and equity after inflation.' },
    { key: 'market', title: 'What are markets doing?', line: 'Short updates in plain words.' },
    { key: 'insurance', title: 'Help with insurance', line: 'Check your cover, and get help if a claim is stuck.' },
    { key: 'learn', title: 'Learn and ask', line: 'Short lessons, and a place to ask your questions.' },
  ] as { key: PreviewCardKey; title: string; line: string; badge?: string }[],
  signIn: 'Sign in with Google to unlock all these features.',
  signInButton: 'Sign in free',
  signedIn: 'Welcome back',
  signedInButton: 'Go to my dashboard',
  disclaimer:
    'Educational tools. Results are illustrative projections based on your inputs and stated assumptions, not guarantees.',
};
