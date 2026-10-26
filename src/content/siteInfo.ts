/**
 * Company facts, page titles/descriptions and homepage FAQs, shared by the app
 * and the Netlify edge functions (which give search engines and AI crawlers a
 * server-rendered version of each page). Plain data only: no app imports, so
 * the edge functions can import this file directly.
 */

export const SITE_URL = 'https://vincawealth.com';

export const COMPANY = {
  name: 'Vinca Wealth',
  legalStatus: 'AMFI Registered Mutual Fund Distributor',
  arn: 'ARN-293401',
  cin: 'U65999KA2022PTC169569',
  insurancePosp: '1726204591',
  description:
    'Vinca Wealth is a research-driven wealth management firm in Bengaluru (Bangalore), India, and an AMFI registered mutual fund distributor. We help families across India plan for retirement and financial freedom through goal-based mutual fund investing, portfolio monitoring and insurance planning.',
  telephone: '+91-7386809164',
  email: 'support@vincawealth.com',
  address: {
    streetAddress:
      "183/8, Adjacent to Daddy's Elixir Appartment Singenagrahara, Huskur Post, Sarjapura, hobli, Phase II",
    addressLocality: 'Electronic City, Bengaluru',
    addressRegion: 'Karnataka',
    postalCode: '560100',
    addressCountry: 'IN',
  },
  geo: { latitude: 12.8379997, longitude: 77.6958796 },
  mapUrl:
    'https://www.google.com/maps/place/Vinca+Wealth/@12.8379997,77.6958796,15z/data=!4m6!3m5!1s0x3bae6d5dd9903973:0xe6d8399cc5dc4fb2!8m2!3d12.8379997!4d77.6958796!16s%2Fg%2F11s7b6b4th',
  sameAs: [
    'https://www.facebook.com/people/Vinca-Wealth/100088393606551/',
    'https://www.instagram.com/vincawealth/',
    'https://www.youtube.com/@vincawealth9573',
  ],
  topics: [
    'Wealth management',
    'Retirement planning',
    'Financial freedom planning',
    'Goal-based investing',
    'Mutual funds',
    'SIP (systematic investment plan)',
    'Portfolio rebalancing',
    'Life and health insurance planning',
    'NRI investing in India',
  ],
};

/** Title (shown in Google and the browser tab) and description for each public page */
export const PAGE_SEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Vinca Wealth | Research-Driven Wealth Management in Bengaluru',
    description:
      'Wealth management in Bengaluru for retirement planning and financial freedom. Goal-based mutual fund investing by an AMFI registered distributor.',
  },
  '/financial-freedom-calculator': {
    title: 'Financial Freedom Calculator: When Can You Retire? | Vinca Wealth',
    description:
      'Free financial freedom and retirement calculator. Find your retirement corpus, your gap and your projected retirement date in 2 minutes.',
  },
  '/events': {
    title: 'Events & Webinars on Investing and Retirement | Vinca Wealth',
    description:
      'Upcoming Vinca Wealth events and webinars on mutual funds, retirement planning and financial freedom, online and in Bengaluru.',
  },
  '/achievers-club': {
    title: 'Achievers Club | Vinca Wealth',
    description:
      "Join Vinca Wealth's Achievers Club: a community of investors working towards financial freedom with goal-based investing.",
  },
  '/pricing': {
    title: 'Plans & Pricing | Vinca Wealth',
    description: 'Vinca Wealth membership plans for retirement planning and financial freedom tools.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Vinca Wealth',
    description: 'How Vinca Wealth collects, uses and protects your personal information.',
  },
};

export interface HomeFaq {
  question: string;
  answer: string;
}

/** Shown on the homepage FAQ section and in its FAQPage structured data */
export const HOME_FAQS: HomeFaq[] = [
  {
    question: 'Why should I invest with Vinca Wealth?',
    answer:
      'We offer one-to-one consultation to maintain an equilibrium before investing your money. Our Wealth Managers acknowledge your financial goals and recommend investments that suit your goals, time horizon and risk profile.',
  },
  {
    question: 'Do you charge any fee for Planning or Investing through VincaWealth?',
    answer: "No, we don't charge any fee. We get commissions from fund houses.",
  },
  {
    question: 'How does Vinca Wealth make money?',
    answer: 'We get commission from the fund houses as per SEBI regulations. It may vary from 0.3% to 1.2%.',
  },
  {
    question: 'How can Vinca Wealth help me with my existing investments?',
    answer: 'We will give a free and detailed review of your existing investments.',
  },
  {
    question: 'Does Vinca Wealth have an app to track our investments?',
    answer:
      "Yes, we have our app named 'Vinca Wealth' on the Google Play Store and 'Fund Connect' on the Apple App Store. You can use it to track your investments.",
  },
  {
    question: 'Can I meet and talk to any Vinca Wealth Managers in person? If yes, when and how?',
    answer:
      'Yes, we do one-on-one meetings at our registered office in Bangalore or at a place of your choice in Bangalore. If you are outside Bangalore, we can connect on a Zoom call.',
  },
  {
    question: 'Why should I choose Vinca Wealth over others?',
    answer:
      'Every recommendation we make is backed by research, and we explain the reasoning behind it in plain language, including the risks and costs, so you can make an informed decision. As an AMFI registered mutual fund distributor, we are paid commission by fund houses, and we disclose this upfront.',
  },
  {
    question: 'What are the different products Vinca Wealth suggests?',
    answer: 'We suggest mutual funds, health insurance, life insurance, equity baskets, PMS and fractional real estate products.',
  },
  {
    question: 'As an NRI, do I have a limitation in terms of funds and schemes?',
    answer:
      "If you are a US or Canadian resident, you have limited options. If you are a resident of any other country, you don't have these limitations.",
  },
  {
    question: 'How do you ensure my goals will be met?',
    answer:
      'No investment can guarantee a goal, but we plan carefully to improve your chances. As your goal date approaches, we follow a goal-based exit approach: we gradually move money from equity to lower-risk options, so a market fall close to your goal has less impact on the amount you need.',
  },
  {
    question: 'Can I invest through VincaWealth without a financial goal?',
    answer: 'Yes. For HNIs, we also manage wealth without goal-based planning if required.',
  },
  {
    question: 'How often will my portfolio be reviewed?',
    answer:
      "We do a one-on-one review with you once a year, and we keep track of your portfolio in between. We'll contact you when we think a change is needed.",
  },
  {
    question: 'What happens when the market falls midway while I have invested for the long term?',
    answer:
      "Short-term market falls are a normal part of equity investing. Historically, equity markets in India have recovered from falls over longer periods, though past performance does not guarantee future returns. That's why we match your investments to your time horizon and review your portfolio regularly, rather than reacting to short-term movements.",
  },
  {
    question: 'Should we transfer money to Vinca Wealth while investing?',
    answer:
      "We will add the chosen products to the cart and send the link to you. You'll approve and pay the amount directly from your Bank account to the Fund house. Vinca Wealth will not be a part of this transaction.",
  },
  {
    question: 'Do you share my data with other banks?',
    answer:
      "No. We don't share your data with any third party except where required to process your investments or by law. We take reasonable steps to keep your data safe.",
  },
  {
    question: 'What happens when a Vinca Wealth account holder passes away?',
    answer: 'All investments will have nominees. KYC will not be processed without nominees.',
  },
];

/**
 * Text under the Financial Freedom Calculator, also server-rendered for search
 * engines (with FAQPage data). Keep the numbers in step with the calculator's
 * defaults in src/pages/FinancialFreedomCalculator.tsx and src/utils/ffrScore.ts.
 */
export const CALCULATOR_INFO = {
  heading: 'How the Financial Freedom Calculator works',
  intro:
    'Enter your age, the age you want to retire, your monthly expenses, your current monthly SIP and your existing investments. The calculator estimates the retirement corpus you will need, whether your current investments are on track to reach it, the monthly SIP you would need instead, and whether your money is likely to last through retirement.',
  steps: [
    'Your monthly expenses are increased for inflation up to your retirement age, to estimate what you will spend each month once you retire.',
    'The required corpus is the amount needed at retirement to fund those withdrawals, rising each year, until age 85.',
    'Your existing investments and SIPs are projected forward to retirement and compared with the required corpus.',
    'The result is a Financial Freedom Score from 0 to 100, your gap, and the monthly SIP that would close it.',
  ],
  assumptions: [
    'Life expectancy: 85 years',
    'Inflation: 7% a year',
    'Return while investing: 12% a year; after retirement: 10% a year',
    'SIP increases by 10% every year and runs for up to 20 years, or until retirement if that comes first',
    'Monthly withdrawals in retirement increase by 7% every year',
  ],
  disclaimer:
    'This calculator gives an illustrative estimate for education only and is not investment advice. Returns are assumptions, not guarantees; actual returns will vary. Mutual fund investments are subject to market risks, read all scheme related documents carefully.',
};

export const CALCULATOR_FAQS: HomeFaq[] = [
  {
    question: 'What is a Financial Freedom Score?',
    answer:
      'It is a score from 0 to 100 that shows how prepared you are for retirement. It combines how close your projected corpus is to the corpus you need (30 points), how early you reach financial freedom compared with your target (20 points), how much of your income you invest (20 points), whether essentials like life insurance, health insurance and an emergency fund are in place (20 points), and whether your money lasts through your life expectancy (10 points).',
  },
  {
    question: 'How much money do I need to retire in India?',
    answer:
      'It depends on your monthly expenses today, how many years are left until you retire, inflation, and how long your retirement lasts. The calculator increases your expenses for inflation up to your retirement age and estimates the corpus needed to fund them, rising every year, until age 85.',
  },
  {
    question: 'What assumptions does the calculator use?',
    answer:
      'It assumes inflation of 7% a year, a return of 12% a year while you invest and 10% a year after retirement, a SIP that increases by 10% every year, withdrawals that increase by 7% every year, and a life expectancy of 85. These are assumptions, not guaranteed returns.',
  },
  {
    question: 'Is the Financial Freedom Calculator free?',
    answer:
      'Yes. It is free and takes about 2 minutes. You can see your score without signing up; sign in with Google if you want to save your numbers and see a detailed plan.',
  },
  {
    question: 'Is the calculator result investment advice?',
    answer:
      'No. It is an illustrative estimate for education only. Actual returns will vary, and mutual fund investments are subject to market risks. Read all scheme related documents carefully before investing.',
  },
];

/** schema.org Organization / FinancialService (a kind of LocalBusiness) for Vinca Wealth */
export const organizationSchema = () => ({
  '@type': ['FinancialService', 'Organization'],
  '@id': `${SITE_URL}/#organization`,
  name: COMPANY.name,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    '@id': `${SITE_URL}/#logo`,
    url: `${SITE_URL}/images/vinca-logo.webp`,
    contentUrl: `${SITE_URL}/images/vinca-logo.webp`,
    caption: COMPANY.name,
  },
  image: `${SITE_URL}/og-image.png`,
  description: COMPANY.description,
  telephone: COMPANY.telephone,
  email: COMPANY.email,
  address: { '@type': 'PostalAddress', ...COMPANY.address },
  geo: { '@type': 'GeoCoordinates', ...COMPANY.geo },
  hasMap: COMPANY.mapUrl,
  areaServed: [
    { '@type': 'City', name: 'Bengaluru', alternateName: 'Bangalore' },
    { '@type': 'Country', name: 'India' },
  ],
  knowsAbout: COMPANY.topics,
  identifier: [
    { '@type': 'PropertyValue', propertyID: 'AMFI ARN', value: COMPANY.arn },
    { '@type': 'PropertyValue', propertyID: 'CIN', value: COMPANY.cin },
    { '@type': 'PropertyValue', propertyID: 'Insurance POSP Code', value: COMPANY.insurancePosp },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: COMPANY.telephone,
    email: COMPANY.email,
    areaServed: 'IN',
    availableLanguage: 'English',
  },
  sameAs: [...COMPANY.sameAs, COMPANY.mapUrl],
});
