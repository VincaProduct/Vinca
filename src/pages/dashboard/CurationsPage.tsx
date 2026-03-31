import { useState } from 'react';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import {
  BookOpen, CalendarCheck, Gamepad2, Gift,
  LayoutGrid, Heart, Zap, ArrowUpRight, Sparkles,
  TrendingUp, Shield, Sun
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = 'Starting' | 'Building' | 'Optimising' | 'Enjoying';
type Signal = 'Essential' | 'Starter Pick' | 'Advanced' | 'Daily Use' | 'One-Time';

interface Product {
  title: string;
  productName: string;
  headline: string;
  insight: string;
  contextLine: string;
  price: string;
  readTime?: string;
  link: string;
  category: string;
  stage: Stage;
  signal?: Signal;
  isRecommended?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    title: "The Psychology of Money",
    productName: "Morgan Housel",
    headline: "The book that reframes how money works",
    insight: "Wealth isn't about knowing more — it's about behaving differently.",
    contextLine: "Best for anyone who feels their habits are holding their money back",
    price: "₹283", readTime: "4–5 hrs",
    link: "https://amzn.to/4tixgn1",
    category: "Books", stage: "Starting", signal: "Essential", isRecommended: true,
  },
  {
    title: "Rich Dad Poor Dad",
    productName: "Robert Kiyosaki",
    headline: "The book that started a million financial journeys",
    insight: "Assets vs liabilities, financial independence vs job security — the starting line.",
    contextLine: "Best for first-time readers building a financial foundation",
    price: "₹359", readTime: "4 hrs",
    link: "https://amzn.to/4sDSw6R",
    category: "Books", stage: "Starting", signal: "Starter Pick",
  },
  {
    title: "The Intelligent Investor",
    productName: "Benjamin Graham",
    headline: "Warren Buffett's personal recommendation",
    insight: "The book that separates disciplined long-term investors from everyone else.",
    contextLine: "Use when you're ready to move from concepts to conviction",
    price: "₹476", readTime: "10–12 hrs",
    link: "https://amzn.to/48kn8lI",
    category: "Books", stage: "Building", signal: "Advanced", isRecommended: true,
  },
  {
    title: "Let's Talk Money",
    productName: "Monika Halan",
    headline: "Finally — a personal finance book written for India",
    insight: "SIPs, insurance, tax — explained clearly by India's most trusted financial journalist.",
    contextLine: "Best for anyone navigating the Indian financial system",
    price: "₹268", readTime: "5 hrs",
    link: "https://amzn.to/4dQZC3k",
    category: "Books", stage: "Starting", signal: "Essential", isRecommended: true,
  },
  {
    title: "Die With Zero",
    productName: "Bill Perkins",
    headline: "A different question: what are you actually saving for?",
    insight: "A case for spending life energy at the right time — not hoarding for a future that may look different.",
    contextLine: "Use when your retirement plan feels complete but hollow",
    price: "₹336", readTime: "5 hrs",
    link: "https://amzn.to/4sLpp1J",
    category: "Books", stage: "Optimising",
  },
  {
    title: "Thinking, Fast and Slow",
    productName: "Daniel Kahneman",
    headline: "Understand the mind behind every financial decision",
    insight: "Why the faster thinking system is often wrong — essential for behavioural clarity.",
    contextLine: "Best for investors who want to understand their own decision traps",
    price: "₹501", readTime: "12 hrs",
    link: "https://amzn.to/3NDoYat",
    category: "Books", stage: "Optimising", signal: "Advanced",
  },
  {
    title: "The Millionaire Next Door",
    productName: "Thomas Stanley",
    headline: "Wealth rarely looks the way you imagine",
    insight: "How real millionaires live — quietly, deliberately, without flash.",
    contextLine: "Helps calibrate what financial success actually looks like",
    price: "₹446", readTime: "6 hrs",
    link: "https://amzn.to/48knicO",
    category: "Books", stage: "Building",
  },
  {
    title: "Atomic Habits",
    productName: "James Clear",
    headline: "Retirement readiness is built in small daily decisions",
    insight: "A practical framework used by athletes, executives, and smart savers.",
    contextLine: "Use when you know what to do but struggle to do it consistently",
    price: "₹491", readTime: "5 hrs",
    link: "https://amzn.to/4dfPO2I",
    category: "Books", stage: "Starting", signal: "Essential", isRecommended: true,
  },
  {
    title: "Moleskine Notebook",
    productName: "Moleskine Classic Hard Cover Ruled",
    headline: "Your financial thinking deserves better paper",
    insight: "Writing sharpens financial clarity in a way screens don't.",
    contextLine: "Best for planners who think with a pen",
    price: "₹2,532",
    link: "https://amzn.to/4bJRGQ4",
    category: "Planning", stage: "Starting", signal: "Daily Use",
  },
  {
    title: "Casio FC-200V",
    productName: "Casio FC-200V Financial Calculator",
    headline: "The calculator serious planners actually use",
    insight: "SIP projections, loan amortisation, time-value calculations — no spreadsheet needed.",
    contextLine: "Best for people who want to verify their numbers, not just trust them",
    price: "₹2,360",
    link: "https://amzn.to/4uYY8Ku",
    category: "Planning", stage: "Building", signal: "One-Time",
  },
  {
    title: "Expanding File Organiser",
    productName: "Portable Document Organiser",
    headline: "Your documents deserve a proper home",
    insight: "Scattered paperwork is a real retirement risk. Solved in one purchase.",
    contextLine: "Use when completing your FFR Foundation Checklist",
    price: "₹272",
    link: "https://amzn.to/4bGzfMd",
    category: "Planning", stage: "Starting", signal: "Starter Pick",
  },
  {
    title: "QORFIT Smart Band",
    productName: "QORFIT Activity & Health Tracker",
    headline: "Your corpus is only useful if you're healthy enough to enjoy it",
    insight: "Continuous heart rate, sleep, and step monitoring for the body you're retiring into.",
    contextLine: "Best for people who take retirement seriously on all fronts",
    price: "₹5,649",
    link: "https://amzn.to/4m3lcDW",
    category: "Wellness", stage: "Optimising", signal: "Daily Use",
  },
  {
    title: "Boldfit Yoga Mat",
    productName: "Boldfit 6mm Yoga Mat with Strap",
    headline: "The highest-return daily habit you can build",
    insight: "Less than a coffee per session — pays dividends in energy and longevity.",
    contextLine: "Best for people who've been meaning to start",
    price: "₹380",
    link: "https://amzn.to/4dfU3vf",
    category: "Wellness", stage: "Starting", signal: "Starter Pick",
  },
  {
    title: "Omron BP Monitor",
    productName: "Omron HEM-7120 Blood Pressure Monitor",
    headline: "A health shock is the #1 risk to any retirement plan",
    insight: "The brand cardiologists trust. Early monitoring prevents plan-derailing surprises.",
    contextLine: "Use when stress-testing your retirement plan against health risk",
    price: "₹1,800",
    link: "https://amzn.to/4m1muiB",
    category: "Wellness", stage: "Building", signal: "Essential", isRecommended: true,
  },
  {
    title: "Dr. Trust Pulse Oximeter",
    productName: "Dr. Trust USA Pulse Oximeter",
    headline: "60 seconds to know your oxygen levels",
    insight: "Instant SpO2 visibility at home — useful post-40 and during seasonal changes.",
    contextLine: "Best for proactive health monitoring without a clinic visit",
    price: "₹660",
    link: "https://amzn.to/4tg3Kye",
    category: "Wellness", stage: "Starting", signal: "One-Time",
  },
  {
    title: "Sleepsia Memory Foam Pillow",
    productName: "Sleepsia Contour Memory Foam Pillow",
    headline: "Better sleep is a retirement strategy",
    insight: "Sleep quality affects every financial decision you make.",
    contextLine: "If you wake up tired and make money decisions in that state",
    price: "₹846",
    link: "https://amzn.to/4tjckfV",
    category: "Wellness", stage: "Starting", signal: "Daily Use",
  },
  {
    title: "Portronics USB-C Hub",
    productName: "Portronics Mport 7C USB-C Hub",
    headline: "A cleaner workspace is a calmer mind",
    insight: "Eight hours at a cluttered desk adds hidden cognitive friction.",
    contextLine: "Best for remote professionals building a long-term setup",
    price: "₹810",
    link: "https://amzn.to/4dky4Dk",
    category: "Lifestyle", stage: "Building", signal: "One-Time",
  },
  {
    title: "Noise ColorFit Pro 5",
    productName: "Noise ColorFit Pro 5 Smartwatch",
    headline: "Track time, health, and energy in one glance",
    insight: "Heart rate, sleep, steps — your day and body in sync.",
    contextLine: "Best for people building disciplined daily routines",
    price: "₹3,388",
    link: "https://amzn.to/4toy761",
    category: "Lifestyle", stage: "Building", signal: "Daily Use",
  },
  {
    title: "Monopoly",
    productName: "Monopoly Classic Board Game",
    headline: "The best dinner table conversation about money",
    insight: "Property, rent, compound thinking — introduced naturally through play.",
    contextLine: "Best for families who want finance to be part of the conversation",
    price: "₹1,237",
    link: "https://amzn.to/4cfArGv",
    category: "Games", stage: "Starting", signal: "Starter Pick",
  },
  {
    title: "The Game of Life",
    productName: "The Game of Life Board Game",
    headline: "Retirement planning as a family game night",
    insight: "Simulates career, expenses, and retirement. Surprisingly sharp conversation starter.",
    contextLine: "Best for families with teenagers thinking about money",
    price: "₹1,475",
    link: "https://amzn.to/4bGzQ0p",
    category: "Games", stage: "Starting",
  },
  {
    title: "Engraved Pen Set",
    productName: "Personalized Engraved Pen Set",
    headline: "For the colleague who just crossed the finish line",
    insight: "A retirement deserves to be marked properly. Refined and lasting.",
    contextLine: "Best for marking a significant milestone with intention",
    price: "₹2,232",
    link: "https://amzn.to/414TBZl",
    category: "Gifting", stage: "Enjoying", signal: "One-Time",
  },
  {
    title: "Saregama Carvaan Premium",
    productName: "Saregama Carvaan Premium",
    headline: "5,000 songs. No internet. Pure nostalgia.",
    insight: "Pre-loaded Hindi, Ghazals, devotional songs. The gift families actually keep.",
    contextLine: "Best for gifting someone whose retirement deserves a soundtrack",
    price: "₹6,940",
    link: "https://amzn.to/4dfRNnG",
    category: "Gifting", stage: "Enjoying", signal: "One-Time", isRecommended: true,
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

// One clear accent per category — soft tint bg, saturated text, matching top stripe
const CAT: Record<string, { stripe: string; bg: string; text: string; darkBg?: string; darkText?: string }> = {
  Books:    { stripe: "bg-violet-400", bg: "bg-violet-50",  text: "text-violet-700", darkBg: "dark:bg-violet-900/30", darkText: "dark:text-violet-300"  },
  Planning: { stripe: "bg-sky-400",    bg: "bg-sky-50",     text: "text-sky-700", darkBg: "dark:bg-sky-900/30", darkText: "dark:text-sky-300"     },
  Wellness: { stripe: "bg-rose-400",   bg: "bg-rose-50",    text: "text-rose-700", darkBg: "dark:bg-rose-900/30", darkText: "dark:text-rose-300"    },
  Lifestyle:{ stripe: "bg-amber-400",  bg: "bg-amber-50",   text: "text-amber-700", darkBg: "dark:bg-amber-900/30", darkText: "dark:text-amber-300"   },
  Games:    { stripe: "bg-emerald-400",bg: "bg-emerald-50", text: "text-emerald-700", darkBg: "dark:bg-emerald-900/30", darkText: "dark:text-emerald-300" },
  Gifting:  { stripe: "bg-pink-400",   bg: "bg-pink-50",    text: "text-pink-700", darkBg: "dark:bg-pink-900/30", darkText: "dark:text-pink-300"    },
};

// Badges kept intentionally short — max 8 chars
const SIGNAL: Record<Signal, { label: string; cls: string }> = {
  "Essential":    { label: "Essential",  cls: "bg-[#1A3C2E] dark:bg-emerald-700 text-white dark:text-green-100" },
  "Starter Pick": { label: "Starter",    cls: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" },
  "Advanced":     { label: "Advanced",   cls: "bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200" },
  "Daily Use":    { label: "Daily",      cls: "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300" },
  "One-Time":     { label: "One-time",   cls: "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300" },
};

const STAGE_ICONS: Record<Stage, React.FC<{ size?: number; className?: string }>> = {
  "Starting":   (p) => <Sparkles {...p} />,
  "Building":   (p) => <TrendingUp {...p} />,
  "Optimising": (p) => <Shield {...p} />,
  "Enjoying":   (p) => <Sun {...p} />,
};

const FILTERS = [
  { key: "All",       label: "All",       icon: LayoutGrid },
  { key: "Books",     label: "Books",     icon: BookOpen },
  { key: "Planning",  label: "Planning",  icon: CalendarCheck },
  { key: "Wellness",  label: "Wellness",  icon: Heart },
  { key: "Lifestyle", label: "Lifestyle", icon: Zap },
  { key: "Games",     label: "Games",     icon: Gamepad2 },
  { key: "Gifting",   label: "Gifting",   icon: Gift },
];

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard(p: Product) {
  const cat = CAT[p.category] ?? CAT["Books"];
  const StageIcon = STAGE_ICONS[p.stage];

  return (
    <a
      href={p.link}
      target="_blank"
      rel="noopener noreferrer"
      // active:scale handles mobile tap feedback (no hover needed)
      className="
        group relative flex flex-col
        rounded-2xl bg-white dark:bg-emerald-950 border border-gray-200 dark:border-emerald-800
        overflow-hidden
        transition-all duration-150 ease-out
        active:scale-[0.982] active:border-gray-300 dark:active:border-emerald-700
        hover:-translate-y-px hover:border-gray-300 dark:hover:border-emerald-700
        hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.3)]
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[#1A3C2E] focus-visible:ring-offset-2
      "
    >
      {/* Category colour stripe — 3px top bar, always visible */}
      <div className={`h-[3px] w-full ${cat.stripe} shrink-0`} />

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">

        {/* ── Row 1: badges ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-3">
          {/* Category pill */}
          <span className={`
            text-[10px] font-semibold uppercase tracking-widest
            px-2 py-0.5 rounded-md
            ${cat.bg} ${cat.text} ${cat.darkBg} ${cat.darkText}
          `}>
            {p.category}
          </span>

          {/* Signal or Recommended — always visible, never hover-gated */}
          {p.isRecommended ? (
            <span className="text-[10px] font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full">
              ★ Pick
            </span>
          ) : p.signal ? (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SIGNAL[p.signal].cls}`}>
              {SIGNAL[p.signal].label}
            </span>
          ) : null}
        </div>

        {/* ── Row 2: headline (hero) ────────────────────────────────────── */}
        {/* Gray-900 for maximum contrast — primary text only */}
        <h3 className="text-[14px] sm:text-[14.5px] font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1">
          {p.headline}
        </h3>

        {/* Product & author — gray-400, clearly tertiary */}
        <p className="text-[10.5px] text-gray-400 dark:text-gray-500 leading-none mb-3">
          {p.title}
          {p.productName && p.productName !== p.title && (
            <span className="italic"> · {p.productName}</span>
          )}
          {p.readTime && (
            <span className="not-italic text-gray-300"> · {p.readTime}</span>
          )}
        </p>

        {/* ── Row 3: insight ────────────────────────────────────────────── */}
        {/* gray-600 (not gray-500) — readable on white, clearly secondary */}
        {/* 2 lines mobile, 3 desktop */}
        <p className="text-[12.5px] text-gray-600 dark:text-gray-300 leading-relaxed flex-1 mb-3">
          {p.insight}
        </p>

        {/* ── Row 4: context line ───────────────────────────────────────── */}
        {/* gray-400 italic — clearly the quietest element */}
        <p className="text-[11px] text-gray-400 dark:text-gray-500 italic leading-snug mb-4">
          {p.contextLine}
        </p>

        {/* ── Row 5: footer ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-emerald-800 mt-auto">

          {/* Price + stage — left cluster */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1">
              <span className="text-[15px] font-bold text-gray-900 dark:text-gray-100 tabular-nums leading-none">
                {p.price}
              </span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500">approx.</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
              <StageIcon size={9} className="opacity-50 shrink-0" />
              <span>{p.stage}</span>
            </div>
          </div>

          {/*
            ── Explore CTA ──────────────────────────────────────────────
            MOBILE: solid Vinca-green pill, always present — no hover needed.
            DESKTOP (sm+): transparent with green text + animated arrow on hover.
            This gives mobile users a clearly tappable affordance while keeping
            desktop clean.
          */}
          <span className="
            inline-flex items-center gap-1
            text-[11px] font-semibold leading-none

            /* mobile: solid pill */
            bg-[#1A3C2E] text-white rounded-full px-3 py-1.5

            /* desktop: text link, no bg */
            sm:bg-transparent sm:text-[#1A3C2E] dark:sm:text-green-300 sm:px-0 sm:py-0 sm:rounded-none

            transition-colors duration-150
            sm:group-hover:text-[#163326] dark:sm:group-hover:text-green-200
          ">
            Explore
            <ArrowUpRight
              size={11}
              className="
                /* always show on mobile (part of pill) */
                sm:opacity-0
                sm:-translate-x-0.5 sm:translate-y-0.5
                sm:group-hover:opacity-100
                sm:group-hover:translate-x-0
                sm:group-hover:translate-y-0
                transition-all duration-150
              "
            />
          </span>

        </div>
      </div>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CurationsPage() {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === filter);

  return (
    <>
      <CanonicalPageHeader
        title="The Retirement-Ready Reading & Living List"
      />

      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mx-auto w-full max-w-6xl">
          {/* ── Filter pills ─────────────────────────────────────────────── */}
          <div
            role="tablist"
            aria-label="Filter by category"
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-2 flex-nowrap"
          >
            {FILTERS.map(({ key, label, icon: Icon }) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(key)}
                  className={`
                    shrink-0 flex items-center gap-1.5 px-3.5 py-2
                    rounded-full text-[12px] font-medium
                    transition-all duration-150
                    active:scale-95
                    focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-[#1A3C2E] focus-visible:ring-offset-1
                    ${active
                      ? "bg-green-600 dark:bg-emerald-950 text-white dark:text-green-100 shadow-sm"
                      : "bg-green-100 dark:bg-emerald-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-emerald-900/50 hover:text-green-800 dark:hover:text-green-200"
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Item count */}
          <p className="text-[11px] text-gray-400 mb-4 tabular-nums">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
            {filter !== "All" && <> in {filter}</>}
          </p>

          {/* ── Grid ─────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map(p => (
              <ProductCard key={p.title} {...p} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-sm text-gray-400">Nothing here yet.</p>
            </div>
          )}

          {/* Affiliate disclosure — legally required */}
          <div className="mt-10 pt-5 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 text-center leading-relaxed max-w-xl mx-auto">
              <span className="font-medium text-gray-500">Affiliate disclosure — </span>
              As an Amazon Associate, Vinca Wealth earns from qualifying purchases
              through links on this page. Prices are approximate and subject to change.
              Availability and fulfilment are managed by Amazon. Nothing here
              constitutes financial advice.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}