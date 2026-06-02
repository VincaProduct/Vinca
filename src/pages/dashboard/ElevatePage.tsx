import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { User, TrendingUp, Shield, Zap, Compass as CompassIcon } from 'lucide-react';

const GREEN   = '#06A969';
const DARK_BG = '#0D2818';

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
      c.style.transform = 'translateY(20px)';
      c.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    });
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        children.forEach((c, i) =>
          setTimeout(() => { c.style.opacity = '1'; c.style.transform = 'translateY(0)'; }, i * stagger)
        );
        obs.disconnect();
      }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [stagger]);
  return ref;
}

function useRevealLeft(stagger = 180) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((c) => {
      c.style.opacity = '0';
      c.style.transform = 'translateX(-28px)';
      c.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        children.forEach((c, i) =>
          setTimeout(() => { c.style.opacity = '1'; c.style.transform = 'translateX(0)'; }, i * stagger)
        );
        obs.disconnect();
      }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [stagger]);
  return ref;
}

// ─── Checkmark SVG ────────────────────────────────────────────
const Check = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
    <path d="M1 3.5L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Progress dots ────────────────────────────────────────────
function ProgressDots({ current }: { current: 0 | 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-2 rounded-full transition-all duration-300"
          style={{ width: i === current ? 24 : 8, background: i <= current ? GREEN : '#E5E7EB' }} />
      ))}
    </div>
  );
}

function QuestionScreen({ stepIndex, question, options, onSelect }: {
  stepIndex: 0 | 1 | 2; question: string; options: string[]; onSelect: (val: string) => void;
}) {
  return (
    <div>
      <ProgressDots current={stepIndex} />
      <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-snug">{question}</h2>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button key={opt} onClick={() => onSelect(opt)}
            className="text-left px-5 py-4 rounded-xl border-2 border-gray-200 text-gray-800 text-sm font-medium hover:border-green-500 hover:bg-green-50 transition-all duration-150 cursor-pointer">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function ElevatePage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [modalOpen, setModalOpen]       = useState(false);
  const [step, setStep]                 = useState<ModalStep>('q1');
  const [sliding, setSliding]           = useState(false);
  const [answers, setAnswers]           = useState<Answers>({ investable_amount: '', concern: '', focus: '' });
  const [phone, setPhone]               = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [profilePhone, setProfilePhone] = useState<string | null>(null);
  const [profileName, setProfileName]   = useState('');
  const [profileEmail, setProfileEmail] = useState('');

  const [bookingName, setBookingName]   = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [openFAQ, setOpenFAQ]           = useState<number | null>(null);

  // ffr score ref removed — not needed on this page

  const s2Ref    = useReveal(130);
  const storyRef = useReveal(120);
  const leftRef  = useRevealLeft(160);

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

  useEffect(() => {
    if (profileName)  setBookingName(profileName);
    if (profilePhone) setBookingPhone(profilePhone);
  }, [profileName, profilePhone]);

  const saveLead = useCallback(async (data: Answers, eligible: boolean) => {
    if (!user) return;
    await (supabase.from('elevate_leads') as any).insert({
      user_id: user.id, investable_amount: data.investable_amount,
      concern: data.concern || null, focus: data.focus || null, eligible,
    });
  }, [user]);

  const openModal = useCallback(() => {
    setStep('q1'); setAnswers({ investable_amount: '', concern: '', focus: '' });
    setPhone(''); setSelectedDate(undefined); setCalendarOpen(false);
    setSelectedSlot(''); setAdditionalInfo(''); setModalOpen(true);
  }, []);

  const goTo = useCallback((next: ModalStep) => {
    setSliding(true);
    setTimeout(() => { setStep(next); setSliding(false); }, 220);
  }, []);

  const handleQ1 = (investable_amount: string) => {
    const next = { ...answers, investable_amount };
    setAnswers(next);
    if (investable_amount === 'Less than this for now') { saveLead(next, false); goTo('ineligible'); }
    else goTo('q2');
  };

  const handleQ2 = (concern: string) => { setAnswers((a) => ({ ...a, concern })); goTo('q3'); };

  const handleQ3 = async (focus: string) => {
    const next = { ...answers, focus }; setAnswers(next);
    await saveLead(next, true);
    goTo(profilePhone ? 'booking' : 'phone');
  };

  const handlePhone = async () => {
    if (!phone.trim() || !user) return;
    setPhoneLoading(true);
    await supabase.from('profiles').update({ phone: phone.trim() }).eq('id', user.id);
    setPhoneLoading(false); goTo('booking');
  };

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedSlot || !user) return;
    setBookingLoading(true);
    const name = bookingName || profileName;
    const ph   = bookingPhone || profilePhone || '';
    const preferredDate = format(selectedDate, 'yyyy-MM-dd');
    const email = profileEmail || user.email || '';
    const { error: dbError } = await (supabase.from('consultation_bookings') as any).insert({
      user_id: user.id, full_name: name, email, phone: ph,
      preferred_date: preferredDate, preferred_time_slot: selectedSlot,
      consultation_type: 'elevate_consultation', additional_info: additionalInfo || null, status: 'pending',
    });
    if (dbError) console.error('Booking DB error:', dbError);
    const { data: zohoData, error: zohoError } = await supabase.functions.invoke('zoho-booking', {
      body: { preferred_date: preferredDate, preferred_time_slot: selectedSlot, full_name: name, email, phone: ph },
    });
    if (zohoError) console.error('Zoho error:', zohoError);
    else console.log('Zoho result:', JSON.stringify(zohoData));
    setBookingLoading(false); goTo('booked');
  };

  const s2Items = [
    { icon: <User size={22} color="white" />,       title: 'A dedicated point of contact',    desc: 'One wealth expert who knows your complete financial picture and guides every decision with you directly. The same person, every time.' },
    { icon: <TrendingUp size={22} color="white" />, title: 'Active portfolio management',     desc: 'Your portfolio is reviewed and rebalanced proactively, not reactively. Markets shift. Your plan adjusts.' },
    { icon: <Shield size={22} color="white" />,     title: 'Complete financial coverage',     desc: 'Insurance gaps, emergency fund, tax efficiency — mapped, reviewed, and optimised from day one. Nothing left unchecked.' },
    { icon: <Zap size={22} color="white" />,        title: 'Always responsive',               desc: 'Questions answered. Decisions supported. Same-day responses — not when a slot opens up, when you need them.' },
  ];

  const faqs = [
    { q: 'Is Compass right for me?',
      a: 'Compass is for people with a clear retirement goal who want a dedicated programme — not a product, not a generic advisor — actively working on it. If you want your retirement plan built, managed, and kept on track, Compass is for you.' },
    { q: 'What does Compass actually do?',
      a: 'Your retirement plan is reviewed, your portfolio rebalanced where needed, your insurance and tax position checked, and any life changes factored in. You receive a clear update and next steps — without having to ask.' },
    { q: 'What if my dedicated wealth expert changes?',
      a: 'Your entire retirement plan, portfolio history, and context lives in Vinca\'s system — not with any individual. If your primary contact changes, another expert picks up exactly where they left off. Your programme never restarts.' },
    { q: 'What does it cost?',
      a: 'Pricing is discussed after the eligibility check. We work with a limited number of clients specifically to protect quality.' },
    { q: 'How do I get started?',
      a: 'Answer 3 questions. Takes 2 minutes. If eligible, your Compass programme is activated within 48 hours.' },
    { q: 'Is my financial data safe?',
      a: 'Yes. Encrypted, never sold, never shared with third parties. Vinca is AMFI registered.' },
  ];

  const stories = [
    { initials: 'RM', name: 'Rahul M.', role: 'Engineering Manager, Bangalore',
      quote: '"I used to spend every Sunday stressing about my portfolio. Now I spend it with my kids."',
      result: 'Retirement readiness score: 31 → 74 in 4 months' },
    { initials: 'PS', name: 'Priya S.', role: 'Founder, Hyderabad',
      quote: '"I had savings but no plan. Compass gave me a plan that actually gets reviewed and updated."',
      result: 'Closed a ₹45K/month investment gap without changing lifestyle' },
    { initials: 'AT', name: 'Ankit T.', role: 'Senior Engineer, Pune',
      quote: '"I thought I needed to understand markets to retire well. Turns out I just needed the right programme."',
      result: 'Retirement plan secured 3 years ahead of schedule' },
  ];

  return (
    <div className="w-full" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* CSS animations — GPU-only (transform + opacity) */}
      <style>{`
        @keyframes cp-rise {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes cp-float {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-10px); }
        }
        @keyframes cp-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .cp-rise  { animation: cp-rise  0.7s cubic-bezier(.22,1,.36,1) both; }
        .cp-float { animation: cp-float 4.5s ease-in-out infinite; }
        .cp-fade  { animation: cp-fade  0.5s ease both; }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════ */}
      <section className="w-full min-h-screen bg-white flex items-center px-20 py-20 max-md:px-5 max-md:py-12">
        <div className="w-full max-w-7xl mx-auto flex items-center gap-20 max-md:flex-col max-md:gap-14">

          {/* Left */}
          <div className="flex-1 flex flex-col gap-7 max-w-lg">

            <div className="cp-rise" style={{ animationDelay: '0ms' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: DARK_BG }}>
                <CompassIcon size={13} color={GREEN} />
                <span className="text-[11px] font-bold tracking-widest text-white uppercase">Private Programme · Vinca Wealth</span>
              </div>
            </div>

            {/* Brand name as hero */}
            <div className="cp-rise" style={{ animationDelay: '80ms' }}>
              <p className="text-8xl font-black leading-none tracking-tight max-md:text-6xl" style={{ color: DARK_BG }}>
                Compass.
              </p>
            </div>

            <div className="cp-rise" style={{ animationDelay: '180ms' }}>
              <p className="text-xl font-medium leading-snug" style={{ color: 'rgba(13,40,24,0.5)' }}>
                Vinca's private retirement management programme.
              </p>
            </div>

            <p className="cp-rise text-base text-gray-500 leading-relaxed" style={{ animationDelay: '300ms' }}>
              A dedicated programme that actively manages your wealth and retirement plan — not a product you buy and forget, but an ongoing engagement that keeps your retirement on track.
            </p>

            <div className="cp-rise flex flex-col gap-3" style={{ animationDelay: '420ms' }}>
              <button onClick={openModal}
                className="w-fit px-8 py-4 rounded-full font-semibold text-white text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                style={{ background: GREEN }}>
                Check My Eligibility →
              </button>
              <span className="text-sm text-gray-400">Limited to 20 clients per month</span>
            </div>
          </div>

          {/* Right — Programme deliverables card */}
          <div className="flex-1 flex justify-center max-md:w-full cp-fade" style={{ animationDelay: '300ms' }}>
            <div className="cp-float w-full max-w-sm rounded-3xl overflow-hidden" style={{ background: DARK_BG, boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}>
              <div className="px-8 pt-8 pb-6">
                <div className="flex items-center gap-2 mb-6">
                  <CompassIcon size={13} color={GREEN} />
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: GREEN }}>Compass · Active</span>
                </div>
                <p className="text-white font-black text-xl mb-1" style={{ letterSpacing: '-0.02em' }}>Your programme, this month</p>
                <p className="text-xs mb-7" style={{ color: 'rgba(255,255,255,0.35)' }}>What Compass is working on for you right now</p>

                {[
                  { done: true,  text: 'Retirement roadmap — built and reviewed' },
                  { done: true,  text: 'Portfolio rebalanced — June' },
                  { done: true,  text: 'Insurance gap — identified and actioned' },
                  { done: false, text: 'Monthly update call — June 15' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-3 mb-3.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: item.done ? GREEN : 'rgba(255,255,255,0.08)' }}>
                      {item.done && <Check />}
                    </div>
                    <span className="text-sm" style={{ color: item.done ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-8 py-5" style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Retirement target</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold">January 2038</p>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(6,169,105,0.18)', color: GREEN }}>On track</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section className="w-full" style={{ background: '#F7FAF8' }}>
        <div className="max-w-6xl mx-auto px-20 py-20 max-md:px-5 max-md:py-12">
          <p className="text-[11px] tracking-widest uppercase text-gray-400 mb-12">How Compass works</p>

          <div className="grid grid-cols-3 gap-0 max-md:grid-cols-1" style={{ borderLeft: '1px solid #E5E7EB' }}>
            {[
              { step: '01', time: '2 minutes',  title: 'Check eligibility',
                body: 'Answer 3 questions about your investment capacity. Compass is selective — we want the programme to be right for you before we activate it.' },
              { step: '02', time: 'Within 48h', title: 'Your programme begins',
                body: 'Your retirement roadmap is built. Your portfolio reviewed. Your wealth expert has studied your complete picture before the first call.' },
              { step: '03', time: 'Every month', title: 'Active management, ongoing',
                body: 'Compass handles the work — reviews, rebalancing, tax, insurance. You stay informed. Your retirement date stays on track.' },
            ].map(s => (
              <div key={s.step} className="px-10 py-10 max-md:px-6 max-md:py-8" style={{ borderRight: '1px solid #E5E7EB' }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl font-black" style={{ color: 'rgba(13,40,24,0.18)' }}>{s.step}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(6,169,105,0.1)', color: GREEN }}>{s.time}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — WHAT COMPASS COVERS
      ══════════════════════════════════════════════════════ */}
      <section className="w-full" style={{ background: DARK_BG }}>
        <div className="max-w-6xl mx-auto px-20 py-24 max-md:px-5 max-md:py-14">
          <p className="text-[11px] tracking-widest uppercase mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            What Compass covers
          </p>
          <h2 className="text-5xl font-black text-white mb-20 max-w-lg leading-tight max-md:text-3xl">
            Active management.<br />Every month.
          </h2>

          <div ref={s2Ref} className="grid grid-cols-2 max-md:grid-cols-1"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
            {s2Items.map((item) => (
              <div key={item.title} className="p-12 max-md:p-8 transition-all duration-300 hover:bg-white/[0.02]"
                style={{ borderRight: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(6,169,105,0.15)' }}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — WHO IT'S FOR
      ══════════════════════════════════════════════════════ */}
      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-20 py-24 max-md:px-5 max-md:py-14">
          <div className="flex gap-24 max-md:flex-col max-md:gap-12">

            <div className="w-64 flex-shrink-0 max-md:w-full">
              <div className="sticky top-24">
                <p className="text-[11px] tracking-widest uppercase text-gray-400 mb-4">Who it's for</p>
                <h2 className="text-3xl font-black text-gray-900 leading-tight">
                  Compass is for people whose retirement deserves more than good intentions.
                </h2>
              </div>
            </div>

            <div ref={leftRef} className="flex-1 flex flex-col">
              <p className="text-xl text-gray-500 leading-relaxed mb-12 font-medium">
                A retirement plan that sits in a spreadsheet is not a plan. It needs to be actively managed, month after month.
              </p>

              {[
                { label: 'You have a retirement goal. No one is actively working toward it.',
                  body: 'You have the income and the intention. What is missing is a programme that actually executes — not a product, not a one-time plan, but ongoing active management.' },
                { label: 'Your wealth is growing. Your plan is not keeping up.',
                  body: 'Income has changed. Markets have moved. Life has happened. Without active management, even a good plan drifts off course.' },
                { label: 'You want to retire on time. Not approximately. On time.',
                  body: 'Compass holds your retirement date accountable — with monthly reviews, proactive course corrections, and a wealth expert who knows your numbers.' },
              ].map((item, i) => (
                <div key={i} className="py-8" style={{ borderTop: '1px solid #F0F0F0' }}>
                  <p className="font-bold text-gray-900 text-lg mb-2">{item.label}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}

              <div className="pt-8 mt-2" style={{ borderTop: '1px solid #F0F0F0' }}>
                <p className="text-sm text-gray-400 mb-1">Not ready for Compass yet?</p>
                <button onClick={() => navigate('/dashboard/ffr')}
                  className="text-sm font-semibold underline-offset-2 underline transition-colors"
                  style={{ color: GREEN }}>
                  Start with your Financial Freedom Score →
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — WHAT CLIENTS SAY
      ══════════════════════════════════════════════════════ */}
      <section className="w-full" style={{ background: '#F7FAF8' }}>
        <div className="max-w-6xl mx-auto px-20 py-24 max-md:px-5 max-md:py-14">
          <p className="text-[11px] tracking-widest uppercase text-gray-400 mb-16">What clients say</p>

          <div ref={storyRef} className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
            {stories.map((s) => (
              <div key={s.name} className="bg-white rounded-2xl p-8 flex flex-col" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                    style={{ background: DARK_BG }}>
                    {s.initials}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                    <p className="text-gray-400 text-xs">{s.role}</p>
                  </div>
                </div>
                <p className="text-base font-semibold text-gray-800 leading-relaxed italic flex-1 mb-6">{s.quote}</p>
                <div className="pt-4" style={{ borderTop: '1px solid #F0F0F0' }}>
                  <p className="text-xs font-semibold" style={{ color: GREEN }}>{s.result}</p>
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
        <div className="max-w-3xl mx-auto px-20 py-20 max-md:px-5 max-md:py-14">
          <p className="text-[11px] tracking-widest uppercase text-gray-400 mb-10">Questions</p>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #F0F0F0' }}>
              <button onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left bg-transparent border-none cursor-pointer group">
                <span className="text-base font-semibold text-gray-900 pr-6 group-hover:text-gray-700 transition-colors">{faq.q}</span>
                <span className="text-xl flex-shrink-0 transition-transform duration-200"
                  style={{ color: GREEN, transform: openFAQ === i ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}>+</span>
              </button>
              <div style={{ maxHeight: openFAQ === i ? '220px' : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                <p className="text-gray-500 text-sm leading-relaxed pb-6">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 7 — FINAL CTA
      ══════════════════════════════════════════════════════ */}
      <section className="w-full relative overflow-hidden text-center px-20 py-28 max-md:px-5" style={{ background: DARK_BG }}>
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-black leading-none" style={{ fontSize: 220, color: 'rgba(255,255,255,0.025)', letterSpacing: '-0.04em' }}>COMPASS</span>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <CompassIcon size={32} color={GREEN} className="mb-6" />
          <h2 className="text-5xl font-black text-white mb-4 max-md:text-3xl">
            Your retirement deserves<br />active management.
          </h2>
          <p className="text-gray-400 mb-10 text-base max-w-md">
            Compass. Vinca's private retirement management programme.<br />Limited to 20 clients per month.
          </p>
          <button onClick={openModal}
            className="bg-white font-bold px-10 py-4 rounded-full text-base transition-all duration-200 hover:scale-[1.03]"
            style={{ color: DARK_BG }}>
            Check My Eligibility →
          </button>
          <p className="text-sm mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>No obligation. No spam.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ELIGIBILITY MODAL
      ══════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.55)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <button onClick={() => setModalOpen(false)}
            className="fixed top-5 right-5 w-11 h-11 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 cursor-pointer z-50 shadow-md hover:bg-gray-50 transition-colors">
            ✕
          </button>

          <div className="bg-white rounded-3xl w-full shadow-2xl max-w-lg p-12 max-md:p-8"
            style={{ opacity: sliding ? 0 : 1, transform: sliding ? 'translateX(16px)' : 'translateX(0)', transition: 'opacity 0.22s ease, transform 0.22s ease' }}>

            {step === 'q1' && <QuestionScreen stepIndex={0} question="How much are you ready to invest?" options={['₹25,000+/month via SIP','₹10 lakh+ as a lump sum','Both','Less than this for now']} onSelect={handleQ1} />}
            {step === 'q2' && <QuestionScreen stepIndex={1} question="What is your biggest financial concern right now?" options={['I do not have a clear retirement plan','My savings are not growing fast enough','I keep postponing financial planning','I want to retire early but do not know how']} onSelect={handleQ2} />}
            {step === 'q3' && <QuestionScreen stepIndex={2} question="What is your primary focus?" options={['Planning for retirement','Building wealth for my family','Both retirement and wealth building','Not sure yet — I need guidance']} onSelect={handleQ3} />}

            {step === 'phone' && (
              <div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg mb-6"
                  style={{ background: '#F0FDF4', border: `2px solid ${GREEN}`, color: GREEN }}>✓</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You're eligible for Compass</h2>
                <p className="text-gray-500 text-sm mb-8">What number should your navigator call you on?</p>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210"
                  className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-green-500 transition-colors mb-4" />
                <button onClick={handlePhone} disabled={!phone.trim() || phoneLoading}
                  className="w-full py-4 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ background: GREEN }}>
                  {phoneLoading ? 'Saving...' : 'Continue to Booking →'}
                </button>
                <button onClick={() => goTo('booking')} className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">Skip for now</button>
              </div>
            )}

            {step === 'booking' && (() => {
              const today = new Date(); today.setHours(0,0,0,0);
              const TIME_SLOTS = ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];
              const canSubmit = selectedDate && selectedSlot && !bookingLoading;
              return (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#F0FDF4', border: `1.5px solid ${GREEN}`, color: GREEN, fontSize: 16 }}>✓</div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 leading-tight">Book your free consultation</h2>
                      <p className="text-sm text-gray-400">Your navigator will call at the chosen slot.</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Your details</p>
                    <div className="space-y-3">
                      <input type="text" value={bookingName} onChange={e => setBookingName(e.target.value)} placeholder="Full name"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors" />
                      <input type="text" value={profileEmail} disabled
                        className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                      <input type="tel" value={bookingPhone} onChange={e => setBookingPhone(e.target.value)} placeholder="Phone number"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Select a date</p>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-left focus:outline-none focus:border-green-500 transition-colors flex items-center justify-between"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          <span className={selectedDate ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                            {selectedDate ? format(selectedDate, 'dd MMMM yyyy') : 'Pick a date'}
                          </span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl border border-gray-100 shadow-xl" align="start">
                        <Calendar mode="single" selected={selectedDate}
                          onSelect={(date) => { setSelectedDate(date); setCalendarOpen(false); }}
                          disabled={{ before: today }}
                          classNames={{
                            months: 'w-full', month: 'w-full',
                            caption: 'flex justify-between items-center px-4 py-3 border-b border-gray-100',
                            caption_label: 'text-sm font-bold text-gray-900', nav: 'flex gap-1',
                            nav_button: 'w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors bg-white',
                            nav_button_previous: 'static', nav_button_next: 'static',
                            table: 'w-full px-3 pb-3', head_row: 'flex justify-between mt-3',
                            head_cell: 'text-gray-400 font-medium text-xs w-9 text-center',
                            row: 'flex justify-between mt-1', cell: 'w-9 h-9 text-center p-0',
                            day: 'w-9 h-9 rounded-xl text-sm font-medium hover:bg-green-50 hover:text-green-700 transition-colors',
                            day_selected: '!bg-green-600 !text-white hover:!bg-green-600 hover:!text-white rounded-xl font-semibold',
                            day_today: 'text-green-600 font-bold', day_disabled: 'text-gray-200 cursor-not-allowed hover:bg-transparent hover:text-gray-200', day_outside: 'text-gray-200',
                          }} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Select a time</p>
                    <div className="grid grid-cols-4 gap-2 max-md:grid-cols-3">
                      {TIME_SLOTS.map(slot => (
                        <button key={slot} onClick={() => setSelectedSlot(slot)}
                          className="py-2.5 px-3 rounded-xl text-sm font-medium border transition-all duration-150"
                          style={selectedSlot === slot ? { background: GREEN, color: 'white', border: `1.5px solid ${GREEN}` } : { background: 'white', color: '#374151', border: '1.5px solid #E5E7EB' }}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-8">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Anything specific? <span className="normal-case font-normal">(optional)</span></p>
                    <textarea value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)}
                      placeholder="E.g. I want to discuss early retirement planning..." rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors resize-none" />
                  </div>
                  <button onClick={handleBookingSubmit} disabled={!canSubmit}
                    className="w-full py-4 rounded-xl font-semibold text-white text-sm transition-all duration-150 disabled:opacity-40"
                    style={{ background: GREEN }}>
                    {bookingLoading ? 'Booking...' : 'Book My Consultation →'}
                  </button>
                </div>
              );
            })()}

            {step === 'booked' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-6"
                  style={{ background: '#F0FDF4', border: `2px solid ${GREEN}`, color: GREEN }}>✓</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultation booked.</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">
                  {selectedSlot} · {selectedDate && format(selectedDate, 'dd MMMM yyyy')}
                </p>
                <p className="text-gray-400 text-sm mb-8">Confirmation goes to <strong>{profileEmail}</strong>.</p>
                <button onClick={() => setModalOpen(false)}
                  className="px-8 py-3 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90"
                  style={{ background: GREEN }}>
                  Done
                </button>
              </div>
            )}

            {step === 'ineligible' && (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-5"
                  style={{ background: '#FEF3C7', border: '2px solid #F59E0B', color: '#92400E' }}>ℹ</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Not the right moment — yet.</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                  Compass works best with at least ₹25K/month via SIP or ₹10 lakh lump sum. Build your foundation first — then come back.
                </p>
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left max-w-sm mx-auto">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Special situation?</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Write to{' '}
                    <a href="mailto:support@vincawealth.com?subject=Compass Eligibility" className="font-semibold underline" style={{ color: GREEN }}>
                      support@vincawealth.com
                    </a>
                    {' '}and we'll help you find the right path forward.
                  </p>
                </div>
                <button onClick={() => { setModalOpen(false); navigate('/dashboard/ffr'); }}
                  className="px-8 py-3 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90"
                  style={{ background: GREEN }}>
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
