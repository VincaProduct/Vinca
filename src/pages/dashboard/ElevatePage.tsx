import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancialPlanning } from '@/components/financial-planning/context/FinancialPlanningContext';
import { useFFR } from '@/hooks/useFFR';
import { calculateFFRScore } from '@/utils/ffrScore';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { User, TrendingUp, Shield, Zap } from 'lucide-react';

// ─── Primary green from Tailwind config ───────────────────────
const GREEN = '#06A969';
const DARK_BG = '#0D2818';

// ─── Types ────────────────────────────────────────────────────
type ModalStep = 'q1' | 'q2' | 'q3' | 'phone' | 'booking' | 'booked' | 'ineligible';
type Answers   = { investable_amount: string; concern: string; focus: string };

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
  const [answers, setAnswers]       = useState<Answers>({ investable_amount: '', concern: '', focus: '' });
  const [phone, setPhone]           = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [profilePhone, setProfilePhone] = useState<string | null>(null);
  const [profileName, setProfileName]   = useState('');
  const [profileEmail, setProfileEmail] = useState('');

  // Booking form state
  const [bookingName, setBookingName]   = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // FAQ
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // Scroll-reveal refs
  const s2Ref  = useReveal(150);
  const s4Ref  = useRevealRight(200);

  // ── Fetch profile data (canonical source for name/email/phone) ──
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('full_name, email, phone').eq('id', user.id).single()
      .then(({ data }) => {
        if (!data) return;
        setProfileName(data.full_name || '');
        setProfileEmail(data.email || '');
        setProfilePhone(data.phone ?? null);
      });
  }, [user]);

  // ── Save lead to elevate_leads ─────────────────────────────
  const saveLead = useCallback(async (data: Answers, eligible: boolean) => {
    if (!user) return;
    await (supabase.from('elevate_leads') as any).insert({
      user_id: user.id,
      investable_amount: data.investable_amount,
      concern: data.concern || null,
      focus: data.focus || null,
      eligible,
      ffr_score: ffrScore,
    });
  }, [user, ffrScore]);

  // ── Modal helpers ──────────────────────────────────────────
  const openModal = useCallback(() => {
    setStep('q1');
    setAnswers({ investable_amount: '', concern: '', focus: '' });
    setPhone('');
    setSelectedDate(undefined);
    setCalendarOpen(false);
    setSelectedSlot('');
    setAdditionalInfo('');
    setModalOpen(true);
  }, []);

  const goTo = useCallback((next: ModalStep) => {
    setSliding(true);
    setTimeout(() => { setStep(next); setSliding(false); }, 220);
  }, []);

  const handleQ1 = (investable_amount: string) => {
    const next = { ...answers, investable_amount };
    setAnswers(next);
    if (investable_amount === 'Less than this for now') {
      saveLead(next, false);
      goTo('ineligible');
    } else {
      goTo('q2');
    }
  };

  const handleQ2 = (concern: string) => {
    setAnswers((a) => ({ ...a, concern }));
    goTo('q3');
  };

  const handleQ3 = async (focus: string) => {
    const next = { ...answers, focus };
    setAnswers(next);
    await saveLead(next, true);
    // Skip phone step if profile already has one
    goTo(profilePhone ? 'booking' : 'phone');
  };

  // ── Pre-fill booking form when profile data loads ─────────
  useEffect(() => {
    if (profileName)  setBookingName(profileName);
    if (profilePhone) setBookingPhone(profilePhone);
  }, [profileName, profilePhone]);

  // ── Submit booking to consultation_bookings + Zoho Bookings ──
  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedSlot || !user) return;
    setBookingLoading(true);

    const name          = bookingName || profileName;
    const phone         = bookingPhone || profilePhone || '';
    const preferredDate = format(selectedDate, 'yyyy-MM-dd');

    await (supabase.from('consultation_bookings') as any).insert({
      user_id:             user.id,
      full_name:           name,
      email:               profileEmail,
      phone,
      preferred_date:      preferredDate,
      preferred_time_slot: selectedSlot,
      consultation_type:   'elevate_consultation',
      additional_info:     additionalInfo || null,
      status:              'pending',
    });

    // Sync to Zoho Bookings (fire-and-forget — don't block success screen on API errors)
    supabase.functions.invoke('zoho-booking', {
      body: {
        preferred_date:      preferredDate,
        preferred_time_slot: selectedSlot,
        full_name:           name,
        email:               profileEmail,
        phone,
      },
    }).then(({ error }) => {
      if (error) console.error('Zoho Booking sync failed:', error);
    });

    setBookingLoading(false);
    goTo('booked');
  };

  const handlePhone = async () => {
    if (!phone.trim() || !user) return;
    setPhoneLoading(true);
    await supabase.from('profiles').update({ phone: phone.trim() }).eq('id', user.id);
    setPhoneLoading(false);
    goTo('booking');
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
            className="bg-white rounded-3xl w-full shadow-2xl max-w-lg p-12 max-md:p-8"
            style={{
              opacity: sliding ? 0 : 1,
              transform: sliding ? 'translateX(20px)' : 'translateX(0)',
              transition: 'opacity 0.22s ease, transform 0.22s ease',
            }}
          >
            {/* Q1 — eligibility gate */}
            {step === 'q1' && (
              <QuestionScreen
                stepIndex={0}
                question="How much are you ready to invest?"
                options={[
                  '₹25,000+/month via SIP',
                  '₹10 lakh+ as a lump sum',
                  'Both',
                  'Less than this for now',
                ]}
                onSelect={handleQ1}
              />
            )}

            {/* Q2 — classification only */}
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

            {/* Q3 — classification only */}
            {step === 'q3' && (
              <QuestionScreen
                stepIndex={2}
                question="What is your primary focus?"
                options={[
                  'Planning for retirement',
                  'Building wealth for my family',
                  'Both retirement and wealth building',
                  'Not sure yet — I need guidance',
                ]}
                onSelect={handleQ3}
              />
            )}

            {/* Phone — only if profile.phone is null */}
            {step === 'phone' && (
              <div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg mb-6"
                  style={{ background: '#F0FDF4', border: `2px solid ${GREEN}`, color: GREEN }}
                >✓</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You are eligible for Elevate</h2>
                <p className="text-gray-500 text-sm mb-8">One last thing — what number should your wealth manager call you on?</p>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-green-500 transition-colors mb-4"
                />
                <button
                  onClick={handlePhone}
                  disabled={!phone.trim() || phoneLoading}
                  className="w-full py-4 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ background: GREEN }}
                >
                  {phoneLoading ? 'Saving...' : 'Continue to Booking →'}
                </button>
                <button
                  onClick={() => goTo('booking')}
                  className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            )}

            {/* Booking form */}
            {step === 'booking' && (() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
              const canSubmit = selectedDate && selectedSlot && !bookingLoading;
              return (
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#F0FDF4', border: `1.5px solid ${GREEN}`, color: GREEN, fontSize: 16 }}>✓</div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 leading-tight">Book your free consultation</h2>
                      <p className="text-sm text-gray-400">A wealth manager will call you at the chosen slot.</p>
                    </div>
                  </div>

                  {/* Your details */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Your details</p>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={bookingName}
                        onChange={e => setBookingName(e.target.value)}
                        placeholder="Full name"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors"
                      />
                      <input
                        type="text"
                        value={profileEmail}
                        disabled
                        className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                      <input
                        type="tel"
                        value={bookingPhone}
                        onChange={e => setBookingPhone(e.target.value)}
                        placeholder="Phone number"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Select a date</p>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-left focus:outline-none focus:border-green-500 transition-colors flex items-center justify-between"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          <span className={selectedDate ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                            {selectedDate ? format(selectedDate, 'dd MMMM yyyy') : 'Pick a date'}
                          </span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl border border-gray-100 shadow-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => { setSelectedDate(date); setCalendarOpen(false); }}
                          disabled={{ before: today }}
                          classNames={{
                            months: 'w-full',
                            month: 'w-full',
                            caption: 'flex justify-between items-center px-4 py-3 border-b border-gray-100',
                            caption_label: 'text-sm font-bold text-gray-900',
                            nav: 'flex gap-1',
                            nav_button: 'w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors bg-white',
                            nav_button_previous: 'static',
                            nav_button_next: 'static',
                            table: 'w-full px-3 pb-3',
                            head_row: 'flex justify-between mt-3',
                            head_cell: 'text-gray-400 font-medium text-xs w-9 text-center',
                            row: 'flex justify-between mt-1',
                            cell: 'w-9 h-9 text-center p-0',
                            day: 'w-9 h-9 rounded-xl text-sm font-medium hover:bg-green-50 hover:text-green-700 transition-colors',
                            day_selected: '!bg-green-600 !text-white hover:!bg-green-600 hover:!text-white rounded-xl font-semibold',
                            day_today: 'text-green-600 font-bold',
                            day_disabled: 'text-gray-200 cursor-not-allowed hover:bg-transparent hover:text-gray-200',
                            day_outside: 'text-gray-200',
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time slots */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Select a time</p>
                    <div className="grid grid-cols-4 gap-2 max-md:grid-cols-3">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className="py-2.5 px-3 rounded-xl text-sm font-medium border transition-all duration-150"
                          style={selectedSlot === slot
                            ? { background: GREEN, color: 'white', border: `1.5px solid ${GREEN}` }
                            : { background: 'white', color: '#374151', border: '1.5px solid #E5E7EB' }
                          }
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-8">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Anything specific? <span className="normal-case font-normal">(optional)</span></p>
                    <textarea
                      value={additionalInfo}
                      onChange={e => setAdditionalInfo(e.target.value)}
                      placeholder="E.g. I want to discuss early retirement planning..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleBookingSubmit}
                    disabled={!canSubmit}
                    className="w-full py-4 rounded-xl font-semibold text-white text-sm transition-all duration-150 disabled:opacity-40"
                    style={{ background: GREEN }}
                  >
                    {bookingLoading ? 'Booking...' : 'Book My Consultation →'}
                  </button>
                </div>
              );
            })()}

            {/* Success */}
            {step === 'booked' && (
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-6"
                  style={{ background: '#F0FDF4', border: `2px solid ${GREEN}`, color: GREEN }}
                >✓</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultation booked!</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">
                  We've received your request for <strong>{selectedSlot}</strong> on <strong>{selectedDate && format(selectedDate, 'dd MMMM yyyy')}</strong>.
                </p>
                <p className="text-gray-400 text-sm mb-8">A confirmation will be sent to <strong>{profileEmail}</strong>.</p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-8 py-3 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90"
                  style={{ background: GREEN }}
                >
                  Done
                </button>
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
                <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                  Elevate works best when you have at least ₹25K/month to invest via SIP or ₹10 lakh as a lump sum.
                  Start by building your foundation with VincaWealth.
                </p>

                <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left max-w-sm mx-auto">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Have a special situation?</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Write to us at{' '}
                    <a
                      href="mailto:support@vincawealth.com?subject=Elevate Eligibility"
                      className="font-semibold underline"
                      style={{ color: GREEN }}
                    >
                      support@vincawealth.com
                    </a>
                    {' '}— share your situation and we'll help you understand the right path forward.
                  </p>
                </div>

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
