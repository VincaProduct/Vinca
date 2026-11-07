/**
 * Homepage Section 1 (hero) and Section 2 (dashboard preview) copy. Shared by
 * the page and the pages edge function, which pre-renders it for search
 * engines, so it must not import anything that uses the "@/" alias.
 */

export const HERO = {
  eyebrow: 'AMFI-registered Mutual Fund Distributor · Bengaluru',
  h1: 'Invest for a retirement you can count on',
  subline:
    "We help working families build their retirement with mutual funds. Start with your numbers, then talk to a real person when you're ready.",
  primary: 'See where my retirement stands',
  primarySignedIn: 'Open my Freedom Score',
  primaryNote: '2 minutes · no sign-up',
  secondary: 'Talk to our team',
  trust: ['ARN-293401', 'Your money goes straight to the fund house', '100+ families invest with us'],
  stepsLabel: 'How it works',
  steps: [
    { title: 'Find out where your retirement stands', note: '2 min · no sign-up' },
    { title: 'Save your plan and test it against bad years', note: 'Sign in free with Google' },
    { title: 'Talk it through with a real person', note: '30 min · no obligation' },
    { title: 'Invest and watch your progress', note: 'Track your goal in your dashboard' },
  ],
};

export type PreviewCardKey = 'score' | 'realworth' | 'market' | 'insurance' | 'learn';

export const PREVIEW = {
  h2: 'Are you on track for financial freedom?',
  text: 'See your Freedom Score in 2 minutes. No sign-up for your first result.',
  button: 'Check my score',
  cards: [
    { key: 'score', title: 'Will my money last?', line: 'Your score, your gap, and how your plan holds up in bad years.', url: '/dashboard/ffr' },
    { key: 'realworth', title: 'What will my savings really be worth?', line: 'Compare FD, gold, debt and equity after inflation.', url: '/dashboard/real-worth' },
    { key: 'market', title: 'What are markets doing?', line: 'Short updates in plain words.', url: '/dashboard/know-your-market' },
    { key: 'insurance', title: 'Help with insurance', line: 'Check your cover, and get help if a claim is stuck.', url: '/dashboard/insurance' },
    { key: 'learn', title: 'Learn and ask', line: 'Short lessons, and a place to ask your questions.', url: '/dashboard/learning' },
  ] as { key: PreviewCardKey; title: string; line: string; url: string }[],
  signIn: 'Sign in free with Google to save your plan and open all of this.',
  signInButton: 'Sign in free',
  signedIn: 'Welcome back',
  signedInButton: 'Go to my dashboard',
  disclaimer:
    'Educational tools. Results are illustrative projections based on your inputs and stated assumptions, not guarantees.',
};
