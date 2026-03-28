import { useState } from 'react';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book, CalendarCheck, Gamepad2, Gift, List, Wallet, Heart, Calculator } from 'lucide-react';

interface Product {
  title: string;
  purpose: string;
  link: string;
  category: string;
  icon: string;
}

const PRODUCTS: Product[] = [
  // Books
  {
    title: "The Simple Path to Wealth",
    purpose: "A practical framework for long-term investing and financial independence thinking.",
    link: "https://www.amazon.in/dp/1533667926",
    category: "Books",
    icon: "📘"
  },
  {
    title: "Die With Zero",
    purpose: "Encourages balancing money with life experiences across different stages of life.",
    link: "https://www.amazon.in/dp/0358099765",
    category: "Books",
    icon: "📘"
  },
  {
    title: "The Automatic Millionaire (20th Anniversary Edition)",
    purpose: "Highlights how consistent habits and automation can support long-term financial goals.",
    link: "https://www.amazon.in/dp/0593543066",
    category: "Books",
    icon: "📘"
  },
  {
    title: "The Five Years Before You Retire",
    purpose: "Focuses on preparing financially and mentally during the critical pre-retirement years.",
    link: "https://www.amazon.in/dp/1440570888",
    category: "Books",
    icon: "📘"
  },
  {
    title: "A Richer Retirement",
    purpose: "Explores sustainable retirement spending concepts and lifestyle enjoyment.",
    link: "https://www.amazon.in/dp/0814434010",
    category: "Books",
    icon: "📘"
  },
  // Planning
  {
    title: "What My Family Should Know – Planner & Organizer (2026 Edition)",
    purpose: "Helps organise important personal and financial information for family awareness.",
    link: "https://www.amazon.in/dp/B0CQZK6J8B",
    category: "Planning",
    icon: "📓"
  },
  {
    title: "TinyChange Undated Classic Life Planner (A5)",
    purpose: "Supports goal-setting, habit tracking, and mindful daily planning.",
    link: "https://www.amazon.in/dp/B09V7YQJ6B",
    category: "Planning",
    icon: "📓"
  },
  // Games
  {
    title: "THE GAME FACTORY IPO – Stock Market Board Game",
    purpose: "Introduces basic market concepts through strategic gameplay for families and adults.",
    link: "https://www.amazon.in/dp/B09V7YQJ6B",
    category: "Games",
    icon: "🎲"
  },
  {
    title: "Curio21 Stock Market Game – Buy Hold Sell Strategy",
    purpose: "Simulates investing decisions and long-term thinking in a playful format.",
    link: "https://www.amazon.in/dp/B0B5YQJ6B",
    category: "Games",
    icon: "🎲"
  },
  {
    title: "Funskool Big Bull Junior – Stock Market Board Game",
    purpose: "Encourages early understanding of economic and market concepts.",
    link: "https://www.amazon.in/dp/B09V7YQJ6B",
    category: "Games",
    icon: "🎲"
  },
  {
    title: "Ratna's Stock Market Board Game",
    purpose: "Explores money, economy, and trade concepts through interactive play.",
    link: "https://www.amazon.in/dp/B09V7YQJ6B",
    category: "Games",
    icon: "🎲"
  },
  // Retirement Gifts
  {
    title: "Saregama Carvaan Mini Hindi 2.0 (Portable Music Player)",
    purpose: "A nostalgic music companion for leisure time and relaxed living after retirement.",
    link: "https://www.amazon.in/dp/B07KX8J8B8",
    category: "Retirement Gifts",
    icon: "🎁"
  },
  {
    title: "Indian Art Villa Pure Copper Drinkware Gift Set (Bottle + 2 Glasses)",
    purpose: "A traditional, elegant gift suited for home and everyday wellness rituals.",
    link: "https://www.amazon.in/dp/B07KX8J8B8",
    category: "Retirement Gifts",
    icon: "🎁"
  },
  {
    title: "Personalized Retirement Keepsake / Plaque",
    purpose: "A commemorative item to mark the milestone and celebrate years of contribution.",
    link: "https://www.amazon.in/dp/B07KX8J8B8",
    category: "Retirement Gifts",
    icon: "🎁"
  },
];

function EditorialCard({ title, purpose, link, icon, category }: Product) {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm sm:text-base leading-snug line-clamp-2">{title}</CardTitle>
          <Badge variant="secondary" className="rounded-full text-xs font-medium shrink-0">
            {icon}
          </Badge>
        </div>
        <Badge variant="outline" className="mt-2 sm:mt-3 w-fit text-xs font-medium">
          {category}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-2 text-xs sm:text-sm text-muted-foreground flex-1">
        <p className="line-clamp-3 sm:line-clamp-4">{purpose}</p>
      </CardContent>
      <CardFooter className="p-4 sm:p-5 pt-0">
        <Button asChild className="w-full" size="sm">
          <a href={link} target="_blank" rel="noopener noreferrer">
            View on Amazon
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CurationsPage() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);


  return (
    <>
      <CanonicalPageHeader
        title="Thoughtfully selected products to support and simplify your financial readiness journey."
      />
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mx-auto w-full max-w-6xl">

          {/* FILTER TABS - Exact same styling as financial readiness */}
          <div 
            role="tablist" 
            aria-orientation="horizontal" 
            className="inline-flex items-center text-muted-foreground w-full justify-start h-auto p-1 bg-muted/50 rounded-lg mb-6 overflow-x-auto flex-nowrap"
            data-orientation="horizontal"
          >
            {[
              { key: "All", label: "All", icon: List, mobileLabel: "All" },
              { key: "Books", label: "Books", icon: Book, mobileLabel: "Books" },
              { key: "Planning", label: "Planning", icon: CalendarCheck, mobileLabel: "Planning" },
              { key: "Games", label: "Games", icon: Gamepad2, mobileLabel: "Games" },
              { key: "Retirement Gifts", label: "Retirement Gifts", icon: Gift, mobileLabel: "Gifts" },
            ].map((option) => {
              const isActive = filter === option.key;
              const Icon = option.icon;
              
              return (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  data-state={isActive ? "active" : "inactive"}
                  onClick={() => setFilter(option.key)}
                  className={`
                    justify-center rounded-sm font-medium ring-offset-background transition-all 
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                    focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                    flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap
                    ${isActive 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                  tabIndex={isActive ? 0 : -1}
                  data-orientation="horizontal"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                  <span className="sm:hidden">{option.mobileLabel}</span>
                </button>
              );
            })}
          </div>

          {/* CARDS GRID */}
          <div className="grid gap-3 sm:gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 mb-8">
            {filtered.map((p, idx) => (
              <EditorialCard key={p.title + idx} {...p} />
            ))}
          </div>

          {/* EMPTY STATE */}
          {filtered.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <p className="text-gray-500 text-sm sm:text-base">No products found in this category.</p>
            </div>
          )}

          {/* FOOTER NOTE */}
          <div className="border-t border-gray-200 pt-6 sm:pt-8">
            <p className="text-xs text-gray-500 text-center leading-relaxed max-w-2xl mx-auto">
              Products listed are curated for awareness and lifestyle enrichment. 
              Availability, pricing, and delivery are handled by Amazon.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}