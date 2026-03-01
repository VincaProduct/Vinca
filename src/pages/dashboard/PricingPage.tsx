import React, { useState } from "react";
import CanonicalPageHeader from "@/components/ui/CanonicalPageHeader";
import {
  CheckCircle,
  Zap,
  Footprints,
  BookOpen,
  Target,
  Lightbulb,
  Users,
  Rocket,
  TrendingUp,
  BarChart3,
  Sparkles,
  Share2,
  Gift,
  Compass,
  GraduationCap,
  HeartHandshake,
  CalendarClock,
  MessageSquare,
  Eye,
  Trophy
} from "lucide-react";

export default function DashboardPricingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <CanonicalPageHeader title="Membership Plans" />
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Unified Membership Card */}
        <div
          className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm px-6 sm:px-8 py-8 mb-10 w-full max-w-6xl mx-auto"
        >
          {/* Responsive grid: left–right on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* LEFT COLUMN: Title, Price, Button */}
            <div className="flex flex-col md:justify-center h-full min-h-[320px]">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-foreground mb-1 text-left">Membership fees & inclusions</div>
                <div className="flex items-end gap-2 sm:gap-3 mb-2">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">₹2500</span>
                  <span className="text-base sm:text-lg font-medium text-muted-foreground">/ year</span>
                </div>
                <button
                  className="w-full md:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-emerald-600 text-white font-semibold text-base sm:text-lg hover:bg-emerald-700 transition shadow-sm hover:shadow-md mt-4"
                  onClick={() => window.location.href = '/dashboard/buy-membership'}
                >
                  Join Membership
                </button>
                <div className="my-4 border-t border-border w-12" />
              </div>
            </div>
            {/* RIGHT COLUMN: Inclusions */}
            <div>
              <div className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Full membership includes</div>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-foreground">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Tools to understand your financial reality</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-foreground">
                  <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Sprints for consistent, focused progress</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-foreground">
                  <Footprints className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Footprints to share and learn together</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-foreground">
                  <Compass className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Curated resources to support your journey</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-foreground">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Learning modules for financial clarity</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-foreground">
                  <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Elevate: optional 1:1 guidance sessions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* FEATURE BREAKDOWN SECTIONS */}
        <div className="space-y-8">
          {/* Sprints */}
          <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <div className="text-lg sm:text-xl font-bold text-primary">Sprints</div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">Build financial discipline through small, focused actions instead of overwhelming plans.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-foreground">
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Consistency over intensity</span>
              </li>
              <li className="flex items-start gap-2">
                <CalendarClock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Time-bound focus areas</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Habit-building around saving and planning</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Progress through regular participation</span>
              </li>
            </ul>
          </div>
          {/* Footprints */}
          <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Footprints className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <div className="text-lg sm:text-xl font-bold text-primary">Footprints</div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">Share your financial journey and learn from others navigating similar challenges at every stage.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-foreground">
              <li className="flex items-start gap-2">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Share real financial challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Learn from community perspective</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Progress-focused reflection</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Community-driven learning</span>
              </li>
            </ul>
          </div>
          {/* Reflections */}
          <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <div className="text-lg sm:text-xl font-bold text-primary">Reflections</div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">Capture your personal experience with Vinca and share what's working, what's unclear, and how we can improve.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-foreground">
              <li className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Reflect on your product experience</span>
              </li>
              <li className="flex items-start gap-2">
                <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Share feedback and suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <Compass className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Surface confusion or clarity gaps</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Help shape our learning content</span>
              </li>
            </ul>
          </div>
          {/* Learning */}
          <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <div className="text-lg sm:text-xl font-bold text-primary">Learning</div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">Structured content designed to build your financial maturity step by step, from confusion to clarity.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-foreground">
              <li className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Video series and modules</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Real-life financial clarity</span>
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Beginner to advanced paths</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Conceptual maturity tracking</span>
              </li>
            </ul>
          </div>
          {/* Know Your Market */}
          <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <div className="text-lg sm:text-xl font-bold text-primary">Know Your Market</div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">Build awareness of how markets work before making financial decisions.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-foreground">
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Market structure and long-term behavior</span>
              </li>
              <li className="flex items-start gap-2">
                <CalendarClock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Why markets move and timing usually fails</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Difference between investing and speculation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Aligning market participation with goals</span>
              </li>
            </ul>
          </div>
          {/* Referral Program */}
          <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <div className="text-lg sm:text-xl font-bold text-primary">Refer Friends</div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">Invite friends to Vinca and earn rewards when they become members.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-foreground">
              <li className="flex items-start gap-2">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Rewards unlock when a referred friend joins Premium</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Only direct referrals are counted</span>
              </li>
              <li className="flex items-start gap-2">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">No rewards for shares or clicks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Rewards apply after successful membership</span>
              </li>
            </ul>
          </div>
          {/* Curations */}
          <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <div className="text-lg sm:text-xl font-bold text-primary">Curations</div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">Thoughtfully selected books, tools, and products that make your financial readiness journey more engaging and human.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-foreground">
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Handpicked, intentional selection</span>
              </li>
              <li className="flex items-start gap-2">
                <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Supports motivation and learning</span>
              </li>
              <li className="flex items-start gap-2">
                <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Makes the journey feel less intimidating</span>
              </li>
              <li className="flex items-start gap-2">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Focused on relevance, never promotion</span>
              </li>
            </ul>
          </div>
          {/* Elevate */}
          <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <div className="text-lg sm:text-xl font-bold text-primary">Elevate</div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">Optional one-on-one guidance for validation and clarity on your next steps. Fully user-initiated, educational-only.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-foreground">
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Fully optional, user-initiated</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Validate your existing plans</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-primary">Add confidence and perspective</span>
              </li>
            </ul>
          </div>
        </div>
        {/* FOOTER NOTE */}
        <div className="text-[10px] sm:text-xs text-muted-foreground mt-10 text-center">
          SEBI-safe. Education-only platform. No product recommendations.
        </div>
      </div>
    </div>
  );
}
