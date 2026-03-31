import { useState } from 'react';
import { ExternalLink, BookOpen, Wrench, Gamepad2, Heart, Leaf, Gift, LayoutGrid } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const DARK_GREEN = '#0D2818';
const GREEN      = '#06A969';

// ── Data ──────────────────────────────────────────────────────────────────────

interface Product {
  title: string;
  author?: string;
  price: string;
  link: string;
  category: string;
  purpose: string;
}

const PRODUCTS: Product[] = [
  // Books
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    price: '₹283',
    link: 'https://amzn.to/4tixgn1',
    category: 'Books',
    purpose: 'Why we make irrational money decisions — and how to stop.',
  },
  {
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    price: '₹359',
    link: 'https://amzn.to/4sDSw6R',
    category: 'Books',
    purpose: 'The classic on building assets and escaping the rat race.',
  },
  {
    title: 'The Intelligent Investor',
    author: 'Benjamin Graham',
    price: '₹476',
    link: 'https://amzn.to/48kn8lI',
    category: 'Books',
    purpose: 'The definitive guide to value investing and long-term thinking.',
  },
  {
    title: "Let's Talk Money",
    author: 'Monika Halan',
    price: '₹268',
    link: 'https://amzn.to/4dQZC3k',
    category: 'Books',
    purpose: 'India-specific personal finance — simple, no jargon.',
  },
  {
    title: 'Die With Zero',
    author: 'Bill Perkins',
    price: '₹336',
    link: 'https://amzn.to/4sLpp1J',
    category: 'Books',
    purpose: 'Optimise your life experiences, not just your balance sheet.',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    price: '₹501',
    link: 'https://amzn.to/3NDoYat',
    category: 'Books',
    purpose: 'Understand the biases that shape every financial decision.',
  },
  {
    title: 'The Millionaire Next Door',
    author: 'Thomas Stanley',
    price: '₹446',
    link: 'https://amzn.to/48knicO',
    category: 'Books',
    purpose: 'What wealthy people actually do vs. what you expect.',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    price: '₹491',
    link: 'https://amzn.to/4dfPO2I',
    category: 'Books',
    purpose: 'Build the small habits that compound into financial freedom.',
  },

  // Tools
  {
    title: 'Moleskine Classic Hard Cover Ruled Notebook',
    price: '₹2,532',
    link: 'https://amzn.to/4bJRGQ4',
    category: 'Tools',
    purpose: 'Your retirement plan deserves a notebook that lasts as long.',
  },
  {
    title: 'Casio FC-200V Financial Calculator',
    price: '₹2,360',
    link: 'https://amzn.to/4uYY8Ku',
    category: 'Tools',
    purpose: 'TVM, cash flow, and interest calculations — built for planners.',
  },
  {
    title: 'Portable Expanding File Organizer',
    price: '₹272',
    link: 'https://amzn.to/4bGzfMd',
    category: 'Tools',
    purpose: 'Keep policies, statements, and nomination docs in one place.',
  },

  // Games
  {
    title: 'Monopoly Classic Board Game',
    price: '₹1,237',
    link: 'https://amzn.to/4cfArGv',
    category: 'Games',
    purpose: "Teach the whole family about property, cash flow, and risk.",
  },
  {
    title: 'The Game of Life Board Game',
    price: '₹1,475',
    link: 'https://amzn.to/4bGzQ0p',
    category: 'Games',
    purpose: 'Navigate careers, family, and retirement decisions together.',
  },

  // Wellness
  {
    title: 'Omron HEM-7120 Blood Pressure Monitor',
    price: '₹1,800',
    link: 'https://amzn.to/4m1muiB',
    category: 'Wellness',
    purpose: 'Your health is the most important asset to protect in retirement.',
  },
  {
    title: 'Dr. Trust Pulse Oximeter',
    price: '₹660',
    link: 'https://amzn.to/4tg3Kye',
    category: 'Wellness',
    purpose: 'Quick, reliable vitals tracking for peace of mind at home.',
  },
  {
    title: 'Sleepsia Memory Foam Pillow',
    price: '₹846',
    link: 'https://amzn.to/4tjckfV',
    category: 'Wellness',
    purpose: 'Better sleep is one of the best investments you can make.',
  },

  // Lifestyle
  {
    title: 'QORFIT Smart Band',
    price: '₹5,649',
    link: 'https://amzn.to/4m3lcDW',
    category: 'Lifestyle',
    purpose: 'Track activity, sleep, and heart rate as you build your best years.',
  },
  {
    title: 'Boldfit Yoga Mat 6mm',
    price: '₹380',
    link: 'https://amzn.to/4dfU3vf',
    category: 'Lifestyle',
    purpose: 'The discipline that built your corpus deserves a daily practice.',
  },
  {
    title: 'Portronics Mport 7C USB-C Hub',
    price: '₹810',
    link: 'https://amzn.to/4dky4Dk',
    category: 'Lifestyle',
    purpose: 'Stay productive with a clean, clutter-free work setup.',
  },
  {
    title: 'Noise ColorFit Pro 5 Smartwatch',
    price: '₹3,388',
    link: 'https://amzn.to/4toy761',
    category: 'Lifestyle',
    purpose: 'Always-on health monitoring and a clean, capable wrist companion.',
  },

  // Gifts
  {
    title: 'Personalized Engraved Pen Set',
    price: '₹2,232',
    link: 'https://amzn.to/414TBZl',
    category: 'Gifts',
    purpose: 'Mark a milestone — for yourself or someone celebrating retirement.',
  },
  {
    title: 'Saregama Carvaan Premium',
    price: '₹6,940',
    link: 'https://amzn.to/4dfRNnG',
    category: 'Gifts',
    purpose: '5,000 pre-loaded songs — the perfect companion for unhurried days.',
  },
];

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'All',       label: 'All',       icon: LayoutGrid  },
  { key: 'Books',     label: 'Books',     icon: BookOpen    },
  { key: 'Tools',     label: 'Tools',     icon: Wrench      },
  { key: 'Games',     label: 'Games',     icon: Gamepad2    },
  { key: 'Wellness',  label: 'Wellness',  icon: Heart       },
  { key: 'Lifestyle', label: 'Lifestyle', icon: Leaf        },
  { key: 'Gifts',     label: 'Gifts',     icon: Gift        },
];

const CATEGORY_COLORS: Record<string, string> = {
  Books:     'bg-blue-50 text-blue-700',
  Tools:     'bg-amber-50 text-amber-700',
  Games:     'bg-violet-50 text-violet-700',
  Wellness:  'bg-rose-50 text-rose-700',
  Lifestyle: 'bg-teal-50 text-teal-700',
  Gifts:     'bg-orange-50 text-orange-700',
};

// ── Card ──────────────────────────────────────────────────────────────────────

function ProductCard({ title, author, price, link, category, purpose }: Product) {
  const badgeClass = CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: GREEN }} />

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Category badge */}
        <span className={`self-start text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
          {category}
        </span>

        {/* Title + author */}
        <div className="flex-1 space-y-0.5">
          <p className="text-sm font-bold text-foreground leading-snug">{title}</p>
          {author && (
            <p className="text-xs text-muted-foreground">{author}</p>
          )}
        </div>

        {/* Purpose */}
        <p className="text-xs text-muted-foreground leading-relaxed">{purpose}</p>

        {/* Footer: price + button */}
        <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
          <span className="text-sm font-bold text-foreground">{price}</span>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-85"
            style={{ background: GREEN }}
          >
            Buy on Amazon
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CurationsPage() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeTab);

  // Group by category for "All" view
  const grouped: Record<string, Product[]> = {};
  if (activeTab === 'All') {
    for (const p of PRODUCTS) {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    }
  }

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-12"
        style={{ background: DARK_GREEN }}
      >
        <div className="max-w-4xl mx-auto">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: 'rgba(134,239,172,0.75)' }}
          >
            Curations
          </p>
          <h1 className="text-3xl font-black text-white leading-tight mb-2" style={{ letterSpacing: '-0.02em' }}>
            Curated for your retirement journey
          </h1>
          <p className="text-sm max-w-xl" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Handpicked products to help you plan, live, and celebrate your path to financial freedom.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Filter tabs ──────────────────────────────────────────────── */}
        <div className="overflow-x-auto pb-1 mb-8">
          <div className="inline-flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl min-w-max">
            {TABS.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── All view: grouped by category ────────────────────────────── */}
        {activeTab === 'All' && (
          <div className="space-y-10">
            {Object.entries(grouped).map(([cat, products]) => (
              <div key={cat}>
                <h2
                  className="text-base font-bold mb-4 flex items-center gap-2"
                  style={{ color: DARK_GREEN }}
                >
                  <span
                    className="inline-block w-1 h-5 rounded-full"
                    style={{ background: GREEN }}
                  />
                  {cat}
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    {products.length} item{products.length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((p) => (
                    <ProductCard key={p.title} {...p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Filtered view: flat grid ──────────────────────────────────── */}
        {activeTab !== 'All' && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.title} {...p} />
            ))}
          </div>
        )}

        {/* ── Footer disclaimer ────────────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-2xl mx-auto">
            Products are curated for lifestyle and financial readiness. Availability, pricing, and delivery are handled entirely by Amazon. Links may include affiliate identifiers.
          </p>
        </div>

      </div>
    </div>
  );
}
