/**
 * Homepage "Start here" links: free tools, top retirement guides and where to
 * follow us. Shared by the page and the pages edge function (pre-render), so
 * it must not import anything that uses the "@/" alias.
 *
 * To change an article, swap its slug (the part after /blog/) and title.
 */

export const HOME_GUIDES = {
  label: 'Start here',
  heading: 'Free retirement tools and guides',
  text: 'Work out your numbers, then read the guides our clients ask about most.',
  toolsLabel: 'Free calculators',
  tools: [
    {
      href: '/financial-freedom-calculator',
      title: 'Financial Freedom Calculator',
      line: 'When can you retire, and how big is your gap?',
    },
    {
      href: '/real-worth-calculator',
      title: 'Real Worth Calculator',
      line: 'What your FD, gold, debt or equity is really worth after inflation.',
    },
  ],
  articlesLabel: 'Top retirement guides',
  articles: [
    { slug: 'the-retirement-gap-in-india-a-growing-financial-risk-for-the-middle-class', title: 'The retirement gap in India: a growing risk for the middle class' },
    { slug: 'swp-investment-planning-a-retirement-bucket-strategy-for-sustainable-income', title: 'SWP planning: a retirement bucket strategy for steady income' },
    { slug: 'how-to-use-swp-to-generate-monthly-income-without-risking-your-corpus', title: 'How to use SWP for monthly income without risking your corpus' },
    { slug: 'ppf-vs-nps-in-2026-which-is-better-for-retirement-under-the-new-tax-regime', title: 'PPF vs NPS in 2026: which is better for retirement?' },
    { slug: 'retirement-plan-for-parents-in-india', title: 'How to build a retirement plan for your parents in India' },
  ],
  allArticles: 'All articles',
  social: {
    label: 'Follow us on Instagram',
    line: 'Short, simple money tips every week.',
    href: 'https://www.instagram.com/vincawealth/',
    handle: '@vincawealth',
  },
};
