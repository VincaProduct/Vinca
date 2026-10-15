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
    answer: "No, We don't charge any fee. We get commissions from Fund Houses.",
  },
  {
    question: 'How does Vinca Wealth make money?',
    answer: 'We get commission from the Fund Houses as per SEBI regulations. It may vary from 0.3% to 1.2%',
  },
  {
    question: 'How can Vinca Wealth help me with my existing investments?',
    answer: 'We will give a free and detailed review of your existing investments',
  },
  {
    question: 'Does Vinca Wealth have an app to track our investments?',
    answer:
      "Yes, We have our app with the name 'Vinca Wealth' in the Google Play store & 'Fund Connect' in the Apple store. Using this app you can track your investments",
  },
  {
    question: 'Can I meet and talk to any Vinca Wealth Managers in person? If yes, when and how?',
    answer:
      'Yes, We will do one-on-one meetings at our registered office in Bangalore or at the place of your choice in Bangalore. For non-Bangalorians, we can connect through zoom call.',
  },
  {
    question: 'Why should I choose Vinca Wealth over others?',
    answer:
      'Every recommendation we make is backed by research, and we explain the reasoning behind it in plain language, including the risks and costs, so you can make an informed decision. As an AMFI registered mutual fund distributor, we are paid commission by fund houses, and we disclose this upfront.',
  },
  {
    question: 'What are the different products Vinca Wealth suggest?',
    answer: 'We suggest Mutual Funds, Health Insurance, Life insurance, Equity Baskets, PMS and Fractional Real estate products',
  },
  {
    question: 'As an NRI, do I have a limitation in terms of funds and schemes?',
    answer:
      "If you are a US or Canadian resident, then you have limited options. If you are a resident of any other country, you don't have limitations.",
  },
  {
    question: 'How do you ensure my goals will be met?',
    answer:
      'No investment can guarantee a goal, but we plan carefully to improve your chances. As your goal date approaches, we follow a goal-based exit approach: we gradually move money from equity to lower-risk options, so a market fall close to your goal has less impact on the amount you need.',
  },
  {
    question: 'Can I invest through VincaWealth without a financial goal?',
    answer: 'We do wealth management for HNIs without goal based planning if required.',
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
    question: 'What happens when a VW account holder passes away?',
    answer: 'All the investments will have nominees. Without Nominees KYCs will not be processed.',
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
