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
  Library,
  Compass,
  GraduationCap,
  HeartHandshake,
  CalendarClock,
  MessageSquare,
  Eye,
  Trophy
} from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mx-auto w-full max-w-6xl">
        
        {/* HERO CARD: PRICING & INCLUSIONS */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-10 mb-6 sm:mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-start">
          {/* Left: Pricing */}
          <div className="space-y-3 sm:space-y-4">
            <div className="text-xl sm:text-2xl font-bold text-emerald-900">Membership fees & inclusions</div>
            <div className="flex items-end gap-2 sm:gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-emerald-700">₹2500</span>
              <span className="text-base sm:text-lg font-medium text-emerald-700">/ year</span>
            </div>
            <button className="w-full md:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-emerald-600 text-white font-semibold text-base sm:text-lg hover:bg-emerald-700 transition shadow-sm hover:shadow-md">
              Become a member
            </button>

          </div>

          {/* Right: Inclusions Checklist */}
          <div>
            <div className="text-base sm:text-lg font-semibold text-emerald-800 mb-3 sm:mb-4">Full membership includes</div>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Tools to understand your financial reality</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
                <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Sprints for consistent, focused progress</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
                <Footprints className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Footprints to share and learn together</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
                <Compass className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Curated resources to support your journey</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Learning modules for financial clarity</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
                <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Elevate: optional 1:1 guidance sessions</span>
              </li>
            </ul>
          </div>
        </div>

        {/* FEATURE BREAKDOWN SECTIONS */}
        <div className="space-y-4 sm:space-y-6">

          {/* SPRINTS */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                <div className="text-lg sm:text-xl font-bold text-emerald-800">Sprints</div>
              </div>
              <div className="text-sm sm:text-base text-slate-600">Build financial discipline through small, focused actions instead of overwhelming plans.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Consistency over intensity</span>
              </li>
              <li className="flex items-start gap-2">
                <CalendarClock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Time-bound focus areas</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Habit-building around saving and planning</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Progress through regular participation</span>
              </li>
            </ul>
          </div>

          {/* FOOTPRINTS */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Footprints className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                <div className="text-lg sm:text-xl font-bold text-emerald-800">Footprints</div>
              </div>
              <div className="text-sm sm:text-base text-slate-600">Share your financial journey and learn from others navigating similar challenges at every stage.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
              <li className="flex items-start gap-2">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Share real financial challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Learn from community perspective</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Progress-focused reflection</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Community-driven learning</span>
              </li>
            </ul>
          </div>

          {/* REFLECTIONS */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                <div className="text-lg sm:text-xl font-bold text-emerald-800">Reflections</div>
              </div>
              <div className="text-sm sm:text-base text-slate-600">Capture your personal experience with Vinca and share what's working, what's unclear, and how we can improve.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
              <li className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Reflect on your product experience</span>
              </li>
              <li className="flex items-start gap-2">
                <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Share feedback and suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <Compass className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Surface confusion or clarity gaps</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Help shape our learning content</span>
              </li>
            </ul>
          </div>

          {/* LEARNING */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                <div className="text-lg sm:text-xl font-bold text-emerald-800">Learning</div>
              </div>
              <div className="text-sm sm:text-base text-slate-600">Structured content designed to build your financial maturity step by step, from confusion to clarity.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
              <li className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Video series and modules</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Real-life financial clarity</span>
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Beginner to advanced paths</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Conceptual maturity tracking</span>
              </li>
            </ul>
          </div>

          {/* KNOW YOUR MARKET */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                <div className="text-lg sm:text-xl font-bold text-emerald-800">Know Your Market</div>
              </div>
              <div className="text-sm sm:text-base text-slate-600">Build awareness of how markets work before making financial decisions.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Market structure and long-term behavior</span>
              </li>
              <li className="flex items-start gap-2">
                <CalendarClock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Why markets move and timing usually fails</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Difference between investing and speculation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Aligning market participation with goals</span>
              </li>
            </ul>
          </div>

          {/* REFERRAL PROGRAM */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                <div className="text-lg sm:text-xl font-bold text-emerald-800">Refer Friends</div>
              </div>
              <div className="text-sm sm:text-base text-slate-600">Invite friends to Vinca and earn rewards when they become members.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
              <li className="flex items-start gap-2">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Rewards unlock when a referred friend joins Premium</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Only direct referrals are counted</span>
              </li>
              <li className="flex items-start gap-2">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>No rewards for shares or clicks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Rewards apply after successful membership</span>
              </li>
            </ul>
          </div>

          {/* CURATIONS */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                <div className="text-lg sm:text-xl font-bold text-emerald-800">Curations</div>
              </div>
              <div className="text-sm sm:text-base text-slate-600">Thoughtfully selected books, tools, and products that make your financial readiness journey more engaging and human.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Handpicked, intentional selection</span>
              </li>
              <li className="flex items-start gap-2">
                <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Supports motivation and learning</span>
              </li>
              <li className="flex items-start gap-2">
                <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Makes the journey feel less intimidating</span>
              </li>
              <li className="flex items-start gap-2">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Focused on relevance, never promotion</span>
              </li>
            </ul>
          </div>

          {/* ELEVATE */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                <div className="text-lg sm:text-xl font-bold text-emerald-800">Elevate</div>
              </div>
              <div className="text-sm sm:text-base text-slate-600">Optional one-on-one guidance for validation and clarity on your next steps. Fully user-initiated, educational-only.</div>
            </div>
            <ul className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm sm:text-base text-slate-800">
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Fully optional, user-initiated</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Validate your existing plans</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Add confidence and perspective</span>
              </li>

            </ul>
          </div>

        </div>

        {/* FOOTER NOTE */}
        <div className="text-[10px] sm:text-xs text-slate-500 mt-6 sm:mt-10 text-center">
          SEBI-safe. Education-only platform. No product recommendations.
        </div>
      </div>
    </div>
  );
}