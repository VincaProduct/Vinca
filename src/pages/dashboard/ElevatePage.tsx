import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancialPlanning } from '@/components/financial-planning/context/FinancialPlanningContext';
import { useFFR } from '@/hooks/useFFR';
import { calculateFFRScore } from '@/utils/ffrScore';
import { User, TrendingUp, Shield, Zap } from 'lucide-react';

// ─── Primary green from Tailwind config ───────────────────────
const GREEN = '#06A969';
const DARK_BG = '#0D2818';

// ─── Types ────────────────────────────────────────────────────
type ModalStep = 'q1' | 'q2' | 'q3' | 'booking' | 'ineligible';
type Answers   = { income: string; concern: string; goal: string };

// ─── Scroll-reveal hook ───────────────────────────────────────
function useReveal(stagger = 150) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((c) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(16px)';
      c.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
    });
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((c, i) => {
            setTimeout(() => {
              c.style.opacity = '1';
              c.style.transform = 'translateY(0)';
            }, i * stagger);
          });
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [stagger]);
  return ref;
}

function useRevealRight(stagger = 200) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((c) => {
      c.style.opacity = '0';
      c.style.transform = 'translateX(32px)';
      c.style.transition = `opacity 0.55s ease, transform 0.55s ease`;
    });
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((c, i) => {
            setTimeout(() => {
              c.style.opacity = '1';
              c.style.transform = 'translateX(0)';
            }, i * stagger);
          });
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [stagger]);
  return ref;
}

// ─── Checkmark SVG ────────────────────────────────────────────
const Check = () => (
  <svg width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Progress dots ────────────────────────────────────────────
function ProgressDots({ current }: { current: 0 | 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: i === current ? 24 : 8,
            background: i <= current ? GREEN : '#E5E7EB',
          }}
        />
      ))}
    </div>
  );
}

// ─── Modal question screen ────────────────────────────────────
function QuestionScreen({
  stepIndex, question, options, onSelect,
}: {
  stepIndex: 0 | 1 | 2;
  question: string;
  options: string[];
  onSelect: (val: string) => void;
}) {
  return (
    <div>
      <ProgressDots current={stepIndex} />
      <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-snug">{question}</h2>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="text-left px-5 py-4 rounded-xl border-2 border-gray-200 text-gray-800 text-sm font-medium
                       hover:border-green-500 hover:bg-green-50 transition-all duration-150 cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function ElevatePage() {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  // FFR score — same live calculation as the header bar
  const { inputs, results, projections, hasCalculated } = useFinancialPlanning();
  const { checklist } = useFFR(inputs && results ? { inputs, results } : undefined);
  const ffrScore = hasCalculated && inputs && results && projections.length > 0
    ? calculateFFRScore(inputs, results, projections, checklist)
    : null;

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false);
  const [step, setStep]             = useState<ModalStep>('q1');
  const [sliding, setSliding]       = useState(false);
  const [answers, setAnswers]       = useState<Answers>({ income: '', concern: '', goal: '' });

  // FAQ
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // Scroll-reveal refs
  const s2Ref  = useReveal(150);
  const s4Ref  = useRevealRight(200);

  // ── Modal helpers ──────────────────────────────────────────
  const openModal = useCallback(() => {
    setStep('q1');
    setAnswers({ income: '', concern: '', goal: '' });
    setModalOpen(true);
  }, []);

  const goTo = useCallback((next: ModalStep) => {
    setSliding(true);
    setTimeout(() => { setStep(next); setSliding(false); }, 220);
  }, []);

  const handleQ1 = (income: string) => {
    setAnswers((a) => ({ ...a, income }));
    goTo('q2');
  };
  const handleQ2 = (concern: string) => {
    setAnswers((a) => ({ ...a, concern }));
    goTo('q3');
  };
  const handleQ3 = (goal: string) => {
    const next = { ...answers, goal };
    setAnswers(next);
    // Eligible if income is not the lowest bracket
    goTo(next.income !== 'Under ₹1L/month' ? 'booking' : 'ineligible');
  };

  // ── Data ───────────────────────────────────────────────────
  const s2Items = [
    {
      icon: <User size={24} color="white" />,
      title: 'Your Dedicated Manager',
      desc: 'One expert who knows your complete financial picture. Not a team. Not a chatbot. One person accountable for your wealth.',
    },
    {
      icon: <TrendingUp size={24} color="white" />,
      title: 'Active Portfolio Oversight',
      desc: 'Monthly reviews, rebalancing when needed, proactive changes as markets and your life evolve.',
    },
    {
      icon: <Shield size={24} color="white" />,
      title: 'Full Foundation Audit',
      desc: 'Life insurance, health cover, emergency fund, tax efficiency — reviewed and optimised from day one.',
    },
    {
      icon: <Zap size={24} color="white" />,
      title: 'Priority Access',
      desc: 'Same-day responses. Instant booking. Available when you need them, not when they have a slot.',
    },
  ];


  const faqs = [
    { q: 'Is Elevate right for me?', a: 'Elevate is for people with a clear retirement goal who want a dedicated expert to help them reach it. If you want your retirement plan built and managed properly, Elevate is for you.' },
    { q: 'How is this different from a regular financial advisor?', a: 'Your wealth manager starts from your retirement goal — they already know your lifestyle tier, your income, and your health risk profile before the first call. It is not generic advice. It is built on your numbers.' },
    { q: 'What does it cost?', a: 'Pricing is shared after eligibility check. We work with a limited number of clients to ensure quality.' },
    { q: 'How do I get started?', a: 'Click Check My Eligibility. Answer 3 questions. If eligible, you will be matched with a wealth manager within 48 hours.' },
    { q: 'Is my data safe?', a: 'Yes. All data is encrypted and never shared with third parties. We are AMFI registered.' },
    { q: 'What if I am not eligible?', a: 'We will point you to the right resources on VincaWealth to get you ready for Elevate.' },
  ];

  const stories = [
    {
      initials: 'RM', name: 'Rahul M.', role: 'IT Manager, Bangalore',
      quote: '"I used to spend every Sunday stressing about investments. Now I spend it with my kids."',
      result: 'Financial plan improved from 31 to 74 in 4 months',
    },
    {
      initials: 'PS', name: 'Priya S.', role: 'Business Owner, Hyderabad',
      quote: '"My CA handled my taxes. Now I finally have someone handling my wealth."',
      result: 'Closed a ₹45K/month investment gap without reducing lifestyle',
    },
    {
      initials: 'AT', name: 'Ankit T.', role: 'Senior Engineer, Pune',
      quote: '"I thought I needed to understand markets to invest. Turns out I just needed the right person."',
      result: 'Retirement plan secured 3 years ahead of schedule',
    },
  ];

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="w-full font-sans" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════ */}
      <section className="w-full min-h-screen bg-white flex items-center px-20 py-16 max-md:px-5 max-md:py-8">
        <div className="w-full max-w-7xl mx-auto flex items-center gap-16 max-md:flex-col max-md:gap-10">

          {/* Left */}
          <div className="flex-1 flex flex-col gap-8 max-w-xl">
            <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">
              Elevate by VincaWealth
            </span>

            <div className="flex flex-col gap-1">
              <h1 className="text-6xl font-extrabold text-gray-900 leading-tight max-md:text-4xl">
                Retire on your terms.
              </h1>
              <h1 className="text-6xl font-extrabold text-gray-900 leading-tight max-md:text-4xl">
                With a dedicated
              </h1>
              <h1 className="text-6xl font-extrabold leading-tight italic max-md:text-4xl" style={{ color: GREEN }}>
                expert in your corner.
              </h1>
            </div>

            <p className="text-lg text-gray-500 leading-relaxed max-w-md">
              Most people manage their finances alone — between meetings, on weekends, with half the information. Elevate gives you one dedicated wealth manager who handles everything full time.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={openModal}
                className="w-fit px-8 py-4 rounded-full font-semibold text-white text-base transition-opacity hover:opacity-90"
                style={{ background: GREEN }}
              >
                Check My Eligibility →
              </button>
              <span className="text-sm text-gray-400">★ Limited to 20 clients per month</span>
            </div>
          </div>

          {/* Right — conditional */}
          <div className="flex-1 flex justify-center max-md:w-full">
            {ffrScore ? (
              /* FFR Score Card — logged-in user with completed calculator */
              <div className="bg-white rounded-3xl p-10 border border-gray-100 w-full max-w-md"
                style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.12)' }}>
                <p className="text-sm text-gray-400 mb-2">Your Financial Freedom Score</p>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-8xl font-black leading-none" style={{ color: GREEN }}>{ffrScore}</span>
                  <span className="text-3xl text-gray-400 mb-3">/100</span>
                </div>
                <div className="bg-green-50 rounded-xl p-4 mb-6">
                  <p className="text-xs text-gray-400 mb-1">Gap</p>
                  <p className="text-lg font-bold text-gray-900">See full breakdown in dashboard</p>
                </div>
                <div className="-mx-10 -mb-10 px-8 py-4 rounded-b-3xl" style={{ background: GREEN }}>
                  <p className="text-white text-sm font-medium">★ This gap is exactly what your wealth manager will close.</p>
                </div>
              </div>
            ) : (
              /* Benefits Card — cold visitor */
              <div className="bg-white rounded-3xl overflow-hidden w-full max-w-md"
                style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.12)', border: '1px solid #F3F4F6' }}>
                <div className="p-10 pb-6">
                  <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-6">
                    With Elevate you get
                  </p>
                  <div className="flex flex-col divide-y divide-gray-100">
                    {[
                      'A dedicated wealth manager — one person, fully accountable',
                      'A personalised retirement plan built around your life',
                      'Monthly portfolio reviews and active rebalancing',
                      'Tax, insurance, and emergency fund audit',
                      'Priority access — same-day responses',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 py-4">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: GREEN }}
                        >
                          <Check />
                        </div>
                        <span className="text-gray-800 text-sm leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-8 py-4" style={{ background: GREEN }}>
                  <p className="text-white text-sm font-medium">
                    ★ Limited to 20 clients per month — eligibility check takes 2 minutes.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — WHAT'S INCLUDED
      ══════════════════════════════════════════════════════ */}
      <section className="w-full" style={{ background: DARK_BG }}>
        <div className="max-w-6xl mx-auto px-20 py-24 max-md:px-5 max-md:py-12">
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            What Elevate Includes
          </p>
          <h2 className="text-5xl font-extrabold text-white mb-16 max-w-lg leading-tight max-md:text-3xl">
            Everything you need to retire on your terms.
          </h2>

          <div
            ref={s2Ref}
            className="grid grid-cols-2 max-md:grid-cols-1"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
          >
            {s2Items.map((item, i) => (
              <div
                key={item.title}
                className="p-12 max-md:p-8"
                style={{
                  borderRight: '1px solid rgba(255,255,255,0.08)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="mb-5">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — WHO THIS IS FOR
      ══════════════════════════════════════════════════════ */}
      <section className="w-full" style={{ background: '#F8FDF9' }}>
        <div className="max-w-6xl mx-auto px-20 py-24 max-md:px-5 max-md:py-12">
          <div className="flex gap-20 max-md:flex-col max-md:gap-10">

            {/* Left — sticky */}
            <div className="w-72 flex-shrink-0 max-md:w-full">
              <div className="sticky top-24">
                <p className="text-xs tracking-widest text-gray-400 uppercase mb-4">Is Elevate For You?</p>
                <h2 className="text-4xl font-extrabold text-gray-900 leading-tight max-md:text-3xl">
                  Built for people serious about retiring well.
                </h2>
              </div>
            </div>

            {/* Right — cards */}
            <div className="flex-1 flex flex-col gap-4">
              {[
                'You have a retirement goal but no clear plan to reach it',
                'You want your money working harder but do not know where to start',
                'You are tired of managing finances alone and want a trusted expert',
              ].map((text) => (
                <div key={text} className="bg-white rounded-2xl p-7 shadow-sm flex items-start gap-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: GREEN }}
                  >
                    <Check />
                  </div>
                  <p className="text-gray-800 text-base leading-relaxed">{text}</p>
                </div>
              ))}

              {/* Amber card */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-2">
                <p className="font-bold text-amber-800 mb-2">⚠ Not quite ready for Elevate yet?</p>
                <p className="text-amber-700 text-sm leading-relaxed mb-3">
                  Elevate works best when you have an established income and are ready to commit to a retirement plan.
                  Start by calculating your Financial Freedom Score.
                </p>
                <button
                  onClick={() => navigate('/financial-freedom-calculator')}
                  className="text-sm font-semibold underline text-amber-800 hover:text-amber-900"
                >
                  Calculate My Score →
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — CLIENT STORIES
      ══════════════════════════════════════════════════════ */}
      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-20 py-24 max-md:px-5 max-md:py-12">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-16 max-md:text-3xl">
            Real people. Real results.
          </h2>

          <div
            ref={s4Ref}
            className="grid grid-cols-3 gap-6 max-md:grid-cols-1"
          >
            {stories.map((s) => (
              <div key={s.name} className="rounded-2xl p-8 flex flex-col" style={{ background: '#F9FAFB' }}>
                {/* Top row */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                    style={{ background: GREEN }}
                  >
                    {s.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                    </div>
                    <p className="text-gray-500 text-xs">{s.role}</p>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-xl font-bold text-gray-900 leading-relaxed italic flex-1 mb-6">
                  {s.quote}
                </p>

                {/* Result */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Result</p>
                  <p className="text-sm font-bold" style={{ color: GREEN }}>{s.result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          SECTION 6 — FAQ
      ══════════════════════════════════════════════════════ */}
      <section className="w-full bg-white">
        <div className="max-w-3xl mx-auto px-20 py-20 max-md:px-5 max-md:py-12">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-12 max-md:text-3xl">
            Frequently Asked Questions
          </h2>

          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-100">
              <button
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left bg-transparent border-none cursor-pointer"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">{faq.q}</span>
                <span
                  className="text-2xl flex-shrink-0 transition-transform duration-200"
                  style={{
                    color: GREEN,
                    transform: openFAQ === i ? 'rotate(45deg)' : 'rotate(0deg)',
                    display: 'inline-block',
                  }}
                >+</span>
              </button>
              <div
                style={{
                  maxHeight: openFAQ === i ? '220px' : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                }}
              >
                <p className="text-gray-500 text-sm leading-relaxed pb-6">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 7 — FINAL CTA
      ══════════════════════════════════════════════════════ */}
      <section
        className="w-full relative overflow-hidden text-center px-20 py-24 max-md:px-5"
        style={{ background: DARK_BG }}
      >
        {/* Watermark */}
        <div
          className="absolute bottom-0 left-0 right-0 text-center font-black pointer-events-none select-none leading-none"
          style={{ fontSize: 160, color: 'rgba(255,255,255,0.04)' }}
        >
          ELEVATE
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-5xl font-extrabold text-white mb-4 max-md:text-3xl">
            Ready to retire on your terms?
          </h2>
          <p className="text-gray-400 mb-10 text-base">
            Limited spots available. Eligibility check takes 2 minutes.
          </p>
          <button
            onClick={openModal}
            className="bg-white font-bold px-10 py-4 rounded-full text-lg transition-opacity hover:opacity-90"
            style={{ color: GREEN }}
          >
            Check My Eligibility →
          </button>
          <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ★ No obligation. No spam. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ELIGIBILITY MODAL
      ══════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.5)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {/* Close button */}
          <button
            onClick={() => setModalOpen(false)}
            className="fixed top-5 right-5 w-11 h-11 bg-white border border-gray-200 rounded-full flex items-center justify-center
                       text-gray-500 text-lg cursor-pointer z-50 shadow-md hover:bg-gray-50 transition-colors"
          >
            ✕
          </button>

          {/* Modal card */}
          <div
            className={`bg-white rounded-3xl w-full shadow-2xl ${step === 'booking' ? 'max-w-3xl overflow-hidden' : 'max-w-lg p-12 max-md:p-8'}`}
            style={{
              opacity: sliding ? 0 : 1,
              transform: sliding ? 'translateX(20px)' : 'translateX(0)',
              transition: 'opacity 0.22s ease, transform 0.22s ease',
            }}
          >
            {/* Q1 */}
            {step === 'q1' && (
              <QuestionScreen
                stepIndex={0}
                question="What is your monthly income?"
                options={['Under ₹1L/month', '₹1L – ₹3L/month', '₹3L – ₹5L/month', 'Above ₹5L/month']}
                onSelect={handleQ1}
              />
            )}

            {/* Q2 */}
            {step === 'q2' && (
              <QuestionScreen
                stepIndex={1}
                question="What is your biggest financial concern right now?"
                options={[
                  'I do not have a clear retirement plan',
                  'My savings are not growing fast enough',
                  'I keep postponing financial planning',
                  'I want to retire early but do not know how',
                ]}
                onSelect={handleQ2}
              />
            )}

            {/* Q3 */}
            {step === 'q3' && (
              <QuestionScreen
                stepIndex={2}
                question="What is your primary financial goal?"
                options={[
                  'Retire early and comfortably',
                  'Build wealth for my family',
                  'Stop worrying about money',
                  'I am not sure yet',
                ]}
                onSelect={handleQ3}
              />
            )}

            {/* Eligible — book a session */}
            {step === 'booking' && (
              <div>
                <div className="px-10 pt-10 pb-6 max-md:px-6 max-md:pt-6">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg mb-4"
                    style={{ background: '#F0FDF4', border: `2px solid ${GREEN}`, color: GREEN }}
                  >✓</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">You are eligible for Elevate</h2>
                  <p className="text-gray-500 text-sm">Pick a time that works for you — a wealth manager will call you at that slot.</p>
                </div>
                <iframe
                  src="https://prudhvi-vincawealth.zohobookings.in/portal-embed#/182381000000140004"
                  className="w-full border-0 block"
                  style={{ minHeight: 600 }}
                  title="Book a Wealth Manager Consultation"
                  allowFullScreen
                />
              </div>
            )}

            {/* Ineligible */}
            {step === 'ineligible' && (
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-5"
                  style={{ background: '#FEF3C7', border: '2px solid #F59E0B', color: '#92400E' }}
                >ℹ</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Not quite ready for Elevate yet</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                  Elevate works best when you have an established income and are ready to commit to a retirement plan.
                  Start with VincaWealth to build your foundation.
                </p>
                <button
                  onClick={() => { setModalOpen(false); navigate('/financial-freedom-calculator'); }}
                  className="px-8 py-3 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90"
                  style={{ background: GREEN }}
                >
                  Calculate My Freedom Score →
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
