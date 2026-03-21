import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

type Confidence = 'confident' | 'confused' | 'disbelieve';
type ConfidentPath = 'professional' | 'understanding' | 'google' | 'someone';
type ConfusedPath = 'next-step' | 'wrong-numbers';

interface Answers {
  confidence: Confidence;
  confidentPath?: ConfidentPath;
  confusedPath?: ConfusedPath;
}

interface ServiceCard {
  title: string;
  description: string;
  tag: string;
  isPrimary?: boolean;
}

interface ResultContent {
  eyebrow: string;
  headlineRegular: string;
  headlineItalic: string;
  body: string;
  ctaLabel: string;
  primaryService: ServiceCard;
  primaryServiceReason: string;
  additionalServices: ServiceCard[];
  additionalServicesNote: string;
  showCta: boolean;
  ctaSecondary?: string;
}

// ─── Services Master List ─────────────────────────────────────────────────────

const SERVICES: Record<string, ServiceCard> = {
  clarity: {
    tag: 'Most booked',
    title: '30-Minute Clarity Session',
    description: 'One conversation with a Vinca Wealth Manager. Your FFR numbers on the table. Walk out with a specific sequence — not a report, not options.',
    isPrimary: true,
  },
  plan: {
    tag: 'Foundation',
    title: 'Financial Plan Build',
    description: 'A wealth manager builds your complete plan from your FFR data — SIP calibration, corpus milestones, protection gaps — mapped to your actual life.',
  },
  review: {
    tag: 'Ongoing',
    title: 'Portfolio & SIP Review',
    description: 'Your existing investments reviewed against your FFR targets. What to keep, what to restructure, what is silently working against your corpus goal.',
  },
  protection: {
    tag: 'Protection',
    title: 'Protection Gap Analysis',
    description: 'A dedicated session to cross-reference your health and income exposure from FFR against your actual coverage. Verified. Not estimated.',
  },
  secondOpinion: {
    tag: 'Validation',
    title: 'Second Opinion Session',
    description: 'Bring your existing plan, advisor\'s recommendations, or your own numbers. A Vinca Wealth Manager reads them independently and tells you what they see.',
  },
  peer: {
    tag: 'For professionals',
    title: 'Professional Peer Review',
    description: 'A conversation between professionals. Your financial knowledge, our full-time focus on wealth outcomes. Same numbers, different vantage point.',
  },
};

// ─── Result Content Map ───────────────────────────────────────────────────────

function getResult(answers: Partial<Answers>): ResultContent {
  const { confidence, confidentPath, confusedPath } = answers;

  if (confidence === 'confident' && confidentPath === 'professional') {
    return {
      eyebrow: 'Your Vector path',
      headlineRegular: 'You have the expertise.',
      headlineItalic: 'A peer read catches what proximity misses.',
      body: `You understand what your FFR numbers mean. You know how to read a corpus gap, calibrate a SIP, and think about protection ratios. That expertise is real.\n\nBut even the best financial professionals carry a blind spot: when it's your own plan, you optimise for what you know you know. An independent read by someone who looks at these numbers every day — without your assumptions — is not about guidance. It's about catching what familiarity hides.\n\nThis is a conversation between professionals. No basics. No pitch. Your numbers, our full-time focus on outcomes.`,
      ctaLabel: 'Book a peer review session',
      showCta: true,
      ctaSecondary: 'A professional conversation. Numbers only.',
      primaryService: SERVICES.peer,
      primaryServiceReason: 'Because you don\'t need advice — you need an independent read from someone equally fluent in the numbers.',
      additionalServices: [SERVICES.secondOpinion, SERVICES.review, SERVICES.plan],
      additionalServicesNote: 'We also offer these if your situation calls for it',
    };
  }

  if (confidence === 'confident' && confidentPath === 'understanding') {
    return {
      eyebrow: 'Your Vector path',
      headlineRegular: 'Understanding is the first half.',
      headlineItalic: 'The sequence to act on it is the second.',
      body: `You can read your FFR results. You know what your corpus gap means, roughly what the SIP needs to be, and where your protection exposure sits. That puts you in a better position than most.\n\nBut understanding and sequencing are two different skills. Understanding tells you what the numbers say. Sequencing tells you which one to act on first — given your income, your timeline, and what a wrong first move would cost you.\n\nOne conversation with a Vinca Wealth Manager converts your understanding into a specific, ordered plan you can start this week.`,
      ctaLabel: 'Book my clarity session',
      showCta: true,
      ctaSecondary: '30 minutes. Your numbers. A clear first step.',
      primaryService: SERVICES.clarity,
      primaryServiceReason: 'Because you already understand the picture — what\'s missing is the sequence to act on it without getting the order wrong.',
      additionalServices: [SERVICES.plan, SERVICES.review, SERVICES.protection],
      additionalServicesNote: 'Depending on where your plan goes, we also offer',
    };
  }

  if (confidence === 'confident' && confidentPath === 'google') {
    return {
      eyebrow: 'Your Vector path',
      headlineRegular: 'General answers are everywhere.',
      headlineItalic: 'The answer for your specific numbers isn\'t.',
      body: `Search results and financial apps give you frameworks — what SIP rate looks right in general, what coverage is usually adequate, what a reasonable corpus target might be. That information is accurate. It's just not about you.\n\nYour FFR results are specific. Your corpus gap is not the average gap. Your protection exposure is not the average exposure. And the sequence that resolves your situation is not the sequence that resolves someone else's.\n\nA Vinca Wealth Manager works only with your numbers — not what people in your situation usually do, but what your specific situation requires.`,
      ctaLabel: 'Book my clarity session',
      showCta: true,
      ctaSecondary: '30 minutes. Your FFR results. Your specific sequence.',
      primaryService: SERVICES.clarity,
      primaryServiceReason: 'Because the gap between a general answer and your specific answer is exactly where financial plans quietly break.',
      additionalServices: [SERVICES.plan, SERVICES.protection, SERVICES.review],
      additionalServicesNote: 'Once your sequence is clear, we can also help with',
    };
  }

  if (confidence === 'confident' && confidentPath === 'someone') {
    return {
      eyebrow: 'Your Vector path',
      headlineRegular: 'Having someone is good.',
      headlineItalic: 'Having someone accountable to your outcome is different.',
      body: `Advisors, family members, knowledgeable friends — they're giving you their best, and that means something. But there's a distinction worth understanding: between someone who has knowledge and someone who is professionally accountable to your specific financial outcome.\n\nA Vinca Wealth Manager is not giving you general guidance. They are accountable to the corpus target your FFR identified, the lifestyle your plan needs to protect, and the gaps it currently has. That accountability changes the conversation.\n\nOne session to test what you've been told against what your actual numbers say.`,
      ctaLabel: 'Book my clarity session',
      showCta: true,
      ctaSecondary: 'An independent read on what you\'ve already been told.',
      primaryService: SERVICES.secondOpinion,
      primaryServiceReason: 'Because when someone else is advising you, the most valuable thing is an independent verification — not a replacement.',
      additionalServices: [SERVICES.clarity, SERVICES.plan, SERVICES.review],
      additionalServicesNote: 'We also offer these as your situation develops',
    };
  }

  if (confidence === 'confused' && confusedPath === 'next-step') {
    return {
      eyebrow: 'Your Vector path',
      headlineRegular: 'You have the full picture.',
      headlineItalic: 'What\'s missing is the sequence to act on it.',
      body: `Your FFR gave you everything — your corpus gap, the SIP required to close it, the lifestyle your plan can sustain, where your protection falls short. Knowing all of this and not knowing what to do first is not a failure of understanding.\n\nIt is exactly the problem a wealth manager is built to solve.\n\nA Vinca Wealth Manager takes your FFR results and does one specific thing: tells you what to do first, what to do next, and what to leave for later. Not a report with options. A sequence you can act on this week — starting from where you actually are.`,
      ctaLabel: 'Book my clarity session',
      showCta: true,
      ctaSecondary: '30 minutes. Your FFR numbers. A specific first step.',
      primaryService: SERVICES.clarity,
      primaryServiceReason: 'Because the picture is clear — what\'s missing is a person who can tell you which part of it to act on first.',
      additionalServices: [SERVICES.plan, SERVICES.review, SERVICES.protection],
      additionalServicesNote: 'Once the sequence is set, we also offer',
    };
  }

  if (confidence === 'confused' && confusedPath === 'wrong-numbers') {
    return {
      eyebrow: 'Your Vector path',
      headlineRegular: 'If the numbers feel wrong,',
      headlineItalic: 'verify them before you act on them — or dismiss them.',
      body: `Your FFR results are built on the inputs you gave it — income, goals, timeline, coverage. If any of those inputs were off, the outputs will be off too. That is not a flaw in the model. It is a reason to sit with someone who can test them properly.\n\nA Vinca Wealth Manager will go through your FFR results with you — not to defend them, but to verify them. Input by input. If the numbers are right, you leave knowing that with confidence. If something needs correcting, that correction happens in the same session.\n\nThe most expensive outcome is acting on numbers you don't trust — or doing nothing because you can't verify them. One conversation ends that uncertainty.`,
      ctaLabel: 'Book a verification session',
      showCta: true,
      ctaSecondary: 'Verify your numbers. With someone accountable to getting them right.',
      primaryService: SERVICES.secondOpinion,
      primaryServiceReason: 'Because the right response to numbers you don\'t trust is to test them — not dismiss them, not accept them.',
      additionalServices: [SERVICES.clarity, SERVICES.plan, SERVICES.protection],
      additionalServicesNote: 'Once your numbers are verified, we can also help with',
    };
  }

  if (confidence === 'disbelieve') {
    return {
      eyebrow: 'Your Vector path',
      headlineRegular: 'Scepticism is the right starting point.',
      headlineItalic: 'It deserves a real answer — not reassurance.',
      body: `If your FFR results don't feel right — the corpus gap too large, the SIP too high, the lifestyle number too conservative — you are right to question it before acting on it or walking away from it.\n\nThe right response is not to accept and act, and not to dismiss and ignore. It is to sit with someone who can take it apart — input by input — and show you exactly where each number comes from and whether it holds under scrutiny.\n\nA Vinca Wealth Manager will verify your FFR results against your actual situation. You leave knowing whether the number is right, and if not, what the correct number is. That is the only way to move forward with conviction.`,
      ctaLabel: 'Book a verification session',
      showCta: true,
      ctaSecondary: 'Your numbers tested. Not explained — verified.',
      primaryService: SERVICES.secondOpinion,
      primaryServiceReason: 'Because scepticism without verification leaves you stuck. This session exists specifically for that.',
      additionalServices: [SERVICES.clarity, SERVICES.plan, SERVICES.protection],
      additionalServicesNote: 'Once your numbers are verified, we also offer',
    };
  }

  return {
    eyebrow: 'Your Vector path',
    headlineRegular: 'You have the numbers.',
    headlineItalic: 'Now get the sequence.',
    body: `Your FFR gave you clarity on what you need. Vinca Vector gives you the guided path to achieve it — starting with one conversation that converts your results into a specific next step.`,
    ctaLabel: 'Book my clarity session',
    showCta: true,
    ctaSecondary: '30 minutes. Free. No commitment.',
    primaryService: SERVICES.clarity,
    primaryServiceReason: 'The starting point for turning your FFR results into action.',
    additionalServices: [SERVICES.plan, SERVICES.review, SERVICES.protection],
    additionalServicesNote: 'We also offer',
  };
}

// ─── Intro ────────────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="intro-wrap">
      <div className="intro-glow intro-glow-a" />
      <div className="intro-glow intro-glow-b" />
      <div className="intro-inner">
        <h1 className="intro-headline">
          You know how much<br />
          you need to be<br />
          Financially Ready.<br />
          <em>Now let's build<br />the path to get there.</em>
        </h1>
        <p className="intro-sub">
          Your FFR showed you the target — your corpus gap, the life you can afford, and whether you're protected against a health crisis. Vector gives you the guided path to achieve it.
        </p>
        <div className="intro-divider" />
        <button className="intro-cta" onClick={onStart}>
          Find my path <ArrowRight size={16} />
        </button>
        <p className="intro-note">Based on your FFR results · Free · 2 minutes</p>
      </div>
    </div>
  );
}

// ─── Processing ───────────────────────────────────────────────────────────────

function ProcessingScreen({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [done, setDone] = useState(false);

  const heading = "Building your path...";
  const words = heading.split(' ');
  const lines = [
    'Reading your FFR results and confidence level',
    'Mapping the right guided path for your situation',
    'Preparing your next step',
  ];

  useEffect(() => {
    const hi = setInterval(() => {
      setWordIndex(p => {
        if (p < words.length) return p + 1;
        clearInterval(hi);
        return p;
      });
    }, 90);

    lines.forEach((_, i) => {
      setTimeout(() => setVisibleLines(p => [...p, i]), 1100 + i * 520);
    });

    const t1 = setTimeout(() => setDone(true), 2700);
    const t2 = setTimeout(() => onComplete(), 3500);
    return () => {
      clearInterval(hi);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div className="proc-wrap">
      <div className="proc-glow" />
      <div className="proc-content">
        <h2 className="proc-heading">
          {words.slice(0, wordIndex).join(' ')}
        </h2>
        <div className="proc-lines">
          {lines.map((line, i) => (
            <div key={i} className={`proc-line ${visibleLines.includes(i) ? 'visible' : ''}`}>
              {line}
            </div>
          ))}
        </div>
        <div className={`proc-final ${visibleLines.length === lines.length && done ? 'visible' : ''}`}>
          Your path is ready.
        </div>
      </div>
    </div>
  );
}

// ─── Question Screen ──────────────────────────────────────────────────────────

interface QuestionOption { id: string; label: string; sub: string; }

function QuestionScreen({
  stepLabel,
  question,
  sub,
  options,
  selected,
  onSelect,
  onBack,
  animOut,
}: {
  stepLabel: string;
  question: string;
  sub: string;
  options: QuestionOption[];
  selected: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  animOut: boolean;
}) {
  return (
    <div className={`scene ${animOut ? 'out' : 'in'}`}>
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={13} /> Back
      </button>
      <p className="step-marker">
        <span className="pulse-dot small" />
        {stepLabel}
      </p>
      <h2 className="question-hl" style={{ whiteSpace: 'pre-line' }}>{question}</h2>
      <p className="question-sub">{sub}</p>
      <div className="choices">
        {options.map(opt => (
          <button
            key={opt.id}
            className={`choice ${selected === opt.id ? 'sel' : ''}`}
            onClick={() => onSelect(opt.id)}
          >
            <div className="choice-indicator">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="choice-label">{opt.label}</div>
            <div className="choice-sub">{opt.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────

function ResultScreen({
  result,
  onBook,
  onBack,
  animOut,
}: {
  result: ResultContent;
  onBook: () => void;
  onBack: () => void;
  animOut: boolean;
}) {
  const testimonials = [
    {
      quote: 'Vinca gave me clarity on my actual financial goals — not just what to invest, but why and how much. That changed how I think about my plan.',
      name: 'Kalyan',
      role: 'Assistant Consultant, TCS',
    },
    {
      quote: "I'd been thinking about early retirement without knowing what it actually required. One conversation with Vinca made it real and mapped it out.",
      name: 'Nagarajan M',
      role: 'Global Workplace Manager, Hewlett Packard Enterprise',
    },
  ];

  const bodyParagraphs = result.body.split('\n\n');

  return (
    <div className={`scene ${animOut ? 'out' : 'in'}`}>
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={13} /> Back
      </button>

      {/* Eyebrow */}
      <p className="result-eyebrow">
        <span className="pulse-dot small" />
        {result.eyebrow}
      </p>

      {/* Headline */}
      <h2 className="result-headline">
        {result.headlineRegular}
        <br />
        <em className="result-headline-em">{result.headlineItalic}</em>
      </h2>

      {/* Body */}
      <div className="result-body">
        {bodyParagraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Primary CTA */}
      {result.showCta && (
        <div className="result-cta-block">
          <button className="main-cta" onClick={onBook}>
            {result.ctaLabel} <ArrowRight size={17} />
          </button>
          {result.ctaSecondary && (
            <p className="cta-secondary-note">{result.ctaSecondary}</p>
          )}
        </div>
      )}

      {/* ── SERVICES SECTION ── */}
      <div className="services-section">

        {/* Primary service — case-matched */}
        <div className="services-primary-block">
          <p className="services-section-label">
            <span className="services-label-dot" />
            Where to start for your situation
          </p>
          <div className="primary-service-card">
            <div className="primary-service-top">
              <span className="service-tag primary">{result.primaryService.tag}</span>
              <h3 className="primary-service-title">{result.primaryService.title}</h3>
              <p className="primary-service-desc">{result.primaryService.description}</p>
            </div>
            <div className="primary-service-reason">
              <span className="reason-icon">→</span>
              <p>{result.primaryServiceReason}</p>
            </div>
            <button className="primary-service-cta" onClick={onBook}>
              {result.ctaLabel} <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Additional services — full offering */}
        <div className="services-additional-block">
          <p className="services-section-label secondary">
            <span className="services-label-dot muted" />
            {result.additionalServicesNote}
          </p>
          <div className="additional-services-grid">
            {result.additionalServices.map((svc, i) => (
              <div key={i} className="additional-service-card">
                <span className="service-tag secondary">{svc.tag}</span>
                <h4 className="additional-service-title">{svc.title}</h4>
                <p className="additional-service-desc">{svc.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Accountability strip */}
      <div className="accountability-strip">
        <div className="accountability-strip-bar" />
        <p className="accountability-strip-text">
          Every Vinca Wealth Manager works exclusively with your FFR data. Your corpus target, your lifestyle number, your protection gap — that is what they are accountable to. Not a general plan. Yours.
        </p>
      </div>

      {/* Testimonials */}
      <div className="testimonials-section">
        <p className="testimonials-label">From people who've had the session</p>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-attr">
                <span className="testimonial-name">{t.name}</span>
                <span className="testimonial-role">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      {result.showCta && (
        <div className="result-final-cta">
          <p className="final-cta-nudge">Ready to turn your FFR results into a plan?</p>
          <button className="main-cta" onClick={onBook}>
            {result.ctaLabel} <ArrowRight size={17} />
          </button>
          <p className="cta-secondary-note">30 minutes · Free · No commitment</p>
        </div>
      )}
    </div>
  );
}

// ─── Flow State Machine ───────────────────────────────────────────────────────

type Screen = 'intro' | 'q1' | 'q2-confident' | 'q2-confused' | 'processing' | 'result';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Vincavector() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('intro');
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [animOut, setAnimOut] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);

  const transition = (next: Screen) => {
    if (isAnimating) return;
    setAnimOut(true);
    setIsAnimating(true);
    setTimeout(() => {
      setScreen(next);
      setSelected(null);
      setAnimOut(false);
      if (next === 'result') {
        setResultVisible(false);
        setTimeout(() => setResultVisible(true), 60);
      }
      setTimeout(() => setIsAnimating(false), 60);
    }, 300);
  };

  const q1Options: QuestionOption[] = [
    {
      id: 'confident',
      label: 'I feel confident — I know what I need to do next.',
      sub: 'The numbers make sense. I have a plan or someone helping me.',
    },
    {
      id: 'confused',
      label: "I understand the results but I'm not sure what to do with them.",
      sub: 'The picture is clear. The next step isn\'t.',
    },
    {
      id: 'disbelieve',
      label: "Honestly, I'm not sure I believe these numbers.",
      sub: 'Something feels off. I\'m not ready to act on this.',
    },
  ];

  const q2ConfidentOptions: QuestionOption[] = [
    {
      id: 'professional',
      label: "I'm a financial professional — I can handle this myself.",
      sub: 'I have the expertise to read and act on these numbers.',
    },
    {
      id: 'understanding',
      label: 'I have a good understanding of personal finance.',
      sub: 'I know what SIPs, corpus, and protection mean and roughly what to do.',
    },
    {
      id: 'google',
      label: "I'll figure it out — I'll research or use another app.",
      sub: "I'm comfortable finding the answers on my own.",
    },
    {
      id: 'someone',
      label: 'I have someone — an advisor, family member, or friend helping me.',
      sub: "I'm not alone on this. Someone I trust is already involved.",
    },
  ];

  const q2ConfusedOptions: QuestionOption[] = [
    {
      id: 'next-step',
      label: "I trust the numbers — I just don't know what to do first.",
      sub: "The results are real. The sequence to act on them isn't clear.",
    },
    {
      id: 'wrong-numbers',
      label: "Something feels wrong — I'm not sure I can trust what it's telling me.",
      sub: 'I want to verify these numbers before I do anything.',
    },
  ];

  const handleQ1 = (id: string) => {
    if (isAnimating) return;
    setSelected(id);
    const newAnswers = { ...answers, confidence: id as Confidence };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (id === 'confident') transition('q2-confident');
      else if (id === 'confused') transition('q2-confused');
      else transition('processing');
    }, 600);
  };

  const handleQ2Confident = (id: string) => {
    if (isAnimating) return;
    setSelected(id);
    setAnswers(prev => ({ ...prev, confidentPath: id as ConfidentPath }));
    setTimeout(() => transition('processing'), 600);
  };

  const handleQ2Confused = (id: string) => {
    if (isAnimating) return;
    setSelected(id);
    setAnswers(prev => ({ ...prev, confusedPath: id as ConfusedPath }));
    setTimeout(() => transition('processing'), 600);
  };

  const handleBack = () => {
    if (screen === 'q2-confident' || screen === 'q2-confused') transition('q1');
    else if (screen === 'q1') transition('intro');
    else if (screen === 'result' || screen === 'processing') {
      const back: Screen = answers.confidence === 'confident' ? 'q2-confident'
        : answers.confidence === 'confused' ? 'q2-confused'
        : 'q1';
      transition(back);
    }
  };

  const result = getResult(answers);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; max-width: 100%; }

    :root {
      --bg: hsl(184, 100%, 99%);
      --fg: hsl(185, 25%, 13%);
      --fg-muted: hsl(185, 12%, 42%);
      --fg-faint: hsl(184, 20%, 78%);
      --border: hsl(184, 28%, 88%);
      --border-hover: hsl(184, 28%, 72%);
      --accent: hsl(158, 58%, 44%);
      --accent-hover: hsl(158, 58%, 37%);
      --accent-light: hsl(158, 45%, 94%);
      --accent-border: hsl(158, 45%, 82%);
      --accent-text: hsl(158, 52%, 28%);
      --accent-rgb: 38, 180, 126;
      --contrast: #fff;
      --card-bg: hsl(184, 30%, 97%);
      --card-bg-hover: hsl(184, 28%, 94%);
      --primary-card-bg: hsl(158, 45%, 92%);
      --primary-card-fg: hsl(185, 25%, 13%);
      --primary-card-muted: hsl(185, 12%, 42%);
      --primary-card-reason-bg: hsl(158, 45%, 86%);
      --tag-bg: hsl(158, 45%, 92%);
      --tag-fg: hsl(158, 52%, 28%);
      --tag-bg-secondary: hsl(184, 28%, 92%);
      --tag-fg-secondary: hsl(185, 20%, 40%);
      --radius: 14px;
      --radius-lg: 20px;
    }

    .dark {
      --bg: hsl(185, 25%, 8%);
      --fg: hsl(184, 60%, 97%);
      --fg-muted: hsl(185, 12%, 60%);
      --fg-faint: hsl(185, 20%, 22%);
      --border: hsl(185, 20%, 18%);
      --border-hover: hsl(185, 20%, 28%);
      --accent: hsl(158, 58%, 50%);
      --accent-hover: hsl(158, 58%, 58%);
      --accent-light: hsl(158, 40%, 13%);
      --accent-border: hsl(158, 40%, 22%);
      --accent-text: hsl(158, 52%, 58%);
      --card-bg: hsl(185, 22%, 11%);
      --card-bg-hover: hsl(185, 22%, 14%);
      --primary-card-bg: hsl(158, 28%, 15%);
      --primary-card-fg: hsl(184, 60%, 97%);
      --primary-card-muted: hsl(158, 18%, 58%);
      --primary-card-reason-bg: hsl(158, 25%, 12%);
      --tag-bg: hsl(158, 40%, 18%);
      --tag-fg: hsl(158, 52%, 58%);
      --tag-bg-secondary: hsl(185, 20%, 16%);
      --tag-fg-secondary: hsl(185, 12%, 55%);
    }

    html, body, #root {
      background: var(--bg);
      width: 100%;
      height: 100%;
      overflow-x: hidden;
    }

    .vec-page {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: transparent;
      color: var(--fg);
      width: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .vec-page::before {
      content: '';
      position: fixed;
      top: -220px; right: -220px;
      width: 560px; height: 560px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
      opacity: 0.055;
      pointer-events: none;
      z-index: 0;
    }
    .vec-page::after {
      content: '';
      position: fixed;
      bottom: -200px; left: -120px;
      width: 480px; height: 480px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
      opacity: 0.035;
      pointer-events: none;
      z-index: 0;
    }

    .vec-inner {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 1;
    }

    .vec-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 24px 80px;
      box-sizing: border-box;
    }

    /* ── Pulse dot ── */
    @keyframes pdot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(0.5); }
    }
    .pulse-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--accent);
      display: inline-block;
      animation: pdot 2.2s ease infinite;
      flex-shrink: 0;
    }
    .pulse-dot.small { width: 5px; height: 5px; }
    .pulse-dot.muted { background: var(--fg-faint); animation: none; }

    /* ── Intro ── */
    .intro-wrap {
      width: 100%;
      min-height: 72vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      position: relative;
      overflow: hidden;
    }
    .intro-glow { position: fixed; border-radius: 50%; pointer-events: none; }
    .intro-glow-a {
      top: -200px; right: -200px;
      width: 580px; height: 580px;
      background: radial-gradient(circle, var(--accent) 0%, transparent 68%);
      opacity: 0.07;
    }
    .intro-glow-b {
      bottom: -220px; left: -130px;
      width: 500px; height: 500px;
      background: radial-gradient(circle, var(--accent) 0%, transparent 68%);
      opacity: 0.04;
    }
    .intro-inner {
      position: relative; z-index: 1;
      max-width: 580px; width: 100%;
      display: flex; flex-direction: column; align-items: flex-start;
    }
    .intro-headline {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(1.8rem, 4.5vw, 3.2rem);
      font-weight: 600;
      line-height: 1.08;
      letter-spacing: -0.022em;
      color: var(--fg);
      margin-bottom: 22px;
    }
    .intro-headline em { font-style: italic; color: var(--accent-text); }
    .intro-sub {
      font-size: clamp(0.88rem, 2vw, 1rem);
      font-weight: 300;
      color: var(--fg-muted);
      line-height: 1.78;
      margin-bottom: 32px;
      max-width: 500px;
    }
    .intro-divider {
      width: 40px; height: 1px;
      background: var(--border);
      margin-bottom: 28px;
    }
    .intro-cta {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--accent);
      color: var(--contrast);
      font-family: 'DM Sans', system-ui, sans-serif;
      font-weight: 600;
      font-size: 0.97rem;
      padding: 15px 32px;
      border-radius: var(--radius);
      border: none;
      cursor: pointer;
      transition: all 0.22s ease;
      margin-bottom: 12px;
    }
    .intro-cta:hover {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(var(--accent-rgb), 0.28);
    }
    .intro-note { font-size: 0.68rem; color: var(--fg-faint); }

    /* ── Scene ── */
    .scene { width: 100%; transition: opacity 0.28s ease, transform 0.28s ease; }
    .scene.out { opacity: 0; transform: translateY(16px); }
    .scene.in { opacity: 1; transform: translateY(0); }

    /* ── Back ── */
    .back-btn {
      display: inline-flex; align-items: center; gap: 5px;
      background: none; border: none; cursor: pointer;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 0.78rem; color: var(--fg-muted);
      padding: 6px 0; margin-bottom: 28px; transition: color 0.16s;
    }
    .back-btn:hover { color: var(--fg); }

    /* ── Step marker ── */
    .step-marker {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.64rem; font-weight: 600;
      letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--accent-text); margin-bottom: 16px;
    }

    /* ── Question ── */
    .question-hl {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(1.7rem, 4.2vw, 3rem);
      font-weight: 600; line-height: 1.08;
      letter-spacing: -0.02em; color: var(--fg); margin-bottom: 10px;
    }
    .question-sub {
      font-size: 0.86rem; font-weight: 300; font-style: italic;
      color: var(--fg-muted); line-height: 1.6; margin-bottom: 32px;
    }

    /* ── Choices ── */
    .choices { display: flex; flex-direction: column; gap: 9px; }
    .choice {
      border: 1px solid var(--border);
      background: var(--card-bg);
      border-radius: var(--radius);
      padding: 16px 52px 16px 18px;
      cursor: pointer; text-align: left; position: relative; width: 100%;
      transition: all 0.18s ease;
    }
    .choice:hover {
      border-color: var(--border-hover);
      background: var(--card-bg-hover);
      transform: translateY(-1px);
      box-shadow: 0 3px 14px rgba(0,0,0,0.04);
    }
    .choice.sel {
      border-color: var(--accent-border);
      background: var(--accent-light);
      box-shadow: 0 3px 16px rgba(var(--accent-rgb), 0.1);
    }
    .choice-indicator {
      position: absolute; top: 50%; right: 18px;
      transform: translateY(-50%);
      width: 19px; height: 19px; border-radius: 50%;
      border: 1.5px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.18s ease;
    }
    .choice.sel .choice-indicator { background: var(--accent); border-color: var(--accent); }
    .choice-indicator svg { opacity: 0; transition: opacity 0.16s; }
    .choice.sel .choice-indicator svg { opacity: 1; }
    .choice-label {
      font-size: 0.94rem; font-weight: 500; color: var(--fg);
      line-height: 1.32; margin-bottom: 3px;
    }
    .choice-sub { font-size: 0.74rem; font-weight: 300; color: var(--fg-muted); line-height: 1.42; }

    /* ── Processing ── */
    .proc-wrap {
      width: 100%; min-height: 52vh;
      display: flex; align-items: center; justify-content: center;
      position: relative; padding: 48px 24px;
    }
    .proc-glow {
      position: absolute; width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(var(--accent-rgb), 0.06) 0%, transparent 70%);
      pointer-events: none;
    }
    .proc-content {
      position: relative; z-index: 1;
      max-width: 520px; width: 100%; text-align: center;
    }
    .proc-heading {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(1.9rem, 5vw, 2.9rem);
      font-weight: 600; letter-spacing: -0.02em;
      color: var(--fg); margin-bottom: 44px;
    }
    .proc-lines { margin-bottom: 28px; }
    .proc-line {
      font-size: 0.97rem; color: var(--fg-muted); font-weight: 300;
      margin: 10px 0; opacity: 0; transform: translateY(10px);
      transition: opacity 0.36s ease, transform 0.36s ease;
    }
    .proc-line.visible { opacity: 1; transform: translateY(0); }
    .proc-final {
      font-size: 1rem; font-weight: 500; color: var(--accent-text);
      margin-top: 22px; opacity: 0; transform: translateY(8px);
      transition: opacity 0.36s ease 0.2s, transform 0.36s ease 0.2s;
    }
    .proc-final.visible { opacity: 1; transform: translateY(0); }

    /* ── Result ── */
    .result-eyebrow {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.64rem; font-weight: 600;
      letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--accent-text); margin-bottom: 18px; margin-top: 6px;
    }
    .result-headline {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(2rem, 5.2vw, 3.5rem);
      font-weight: 600; line-height: 1.08;
      letter-spacing: -0.022em; color: var(--fg); margin-bottom: 26px;
    }
    .result-headline-em { font-style: italic; color: var(--accent-text); }
    .result-body { margin-bottom: 32px; max-width: 620px; }
    .result-body p {
      font-size: 0.98rem; font-weight: 300; color: var(--fg-muted);
      line-height: 1.84; margin-bottom: 16px;
    }
    .result-body p:last-child { margin-bottom: 0; }

    /* ── CTA block ── */
    .result-cta-block {
      display: flex; flex-direction: column; align-items: flex-start;
      gap: 10px; margin-bottom: 56px; width: 100%;
    }
    .main-cta {
      display: inline-flex; align-items: center; gap: 10px;
      background: var(--accent); color: var(--contrast);
      font-family: 'DM Sans', system-ui, sans-serif;
      font-weight: 600; font-size: 0.97rem;
      padding: 15px 30px; border-radius: var(--radius);
      border: none; cursor: pointer; transition: all 0.22s ease;
    }
    .main-cta:hover {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(var(--accent-rgb), 0.26);
    }
    .cta-secondary-note { font-size: 0.70rem; font-weight: 300; color: var(--fg-muted); }

    /* ── Services section ── */
    .services-section { width: 100%; margin-bottom: 44px; }

    .services-section-label {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.63rem; font-weight: 600;
      letter-spacing: 0.15em; text-transform: uppercase;
      color: var(--accent-text); margin-bottom: 14px;
    }
    .services-section-label.secondary { color: var(--fg-muted); margin-top: 28px; }
    .services-label-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--accent); flex-shrink: 0;
    }

    /* Primary service card — dark, featured */
    .primary-service-card {
      background: var(--primary-card-bg);
      border-radius: var(--radius-lg);
      padding: 28px 28px 24px;
      border: 1px solid transparent;
    }
    .primary-service-top { margin-bottom: 18px; }
    .primary-service-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.55rem; font-weight: 600;
      color: var(--primary-card-fg);
      letter-spacing: -0.015em; line-height: 1.15;
      margin-bottom: 10px;
    }
    .primary-service-desc {
      font-size: 0.88rem; font-weight: 300;
      color: var(--primary-card-muted); line-height: 1.68;
    }
    .primary-service-reason {
      display: flex; gap: 10px; align-items: flex-start;
      background: var(--primary-card-reason-bg);
      border-radius: 10px; padding: 14px 16px;
      margin-bottom: 20px;
    }
    .reason-icon {
      font-size: 0.9rem; color: var(--accent);
      flex-shrink: 0; margin-top: 1px; font-weight: 500;
    }
    .primary-service-reason p {
      font-size: 0.82rem; font-weight: 300;
      color: var(--primary-card-muted); line-height: 1.58;
      font-style: italic;
    }
    .primary-service-cta {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--accent); color: var(--contrast);
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 0.86rem; font-weight: 600;
      padding: 11px 22px; border-radius: 10px;
      border: none; cursor: pointer; transition: all 0.2s ease;
    }
    .primary-service-cta:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
    }

    /* Service tags */
    .service-tag {
      display: inline-block;
      font-size: 0.60rem; font-weight: 600;
      letter-spacing: 0.13em; text-transform: uppercase;
      padding: 3px 10px; border-radius: 40px;
      margin-bottom: 11px;
    }
    .service-tag.primary { background: rgba(var(--accent-rgb), 0.18); color: var(--accent); }
    .service-tag.secondary { background: var(--tag-bg-secondary); color: var(--tag-fg-secondary); }

    /* Additional services grid */
    .additional-services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }
    .additional-service-card {
      border: 1px solid var(--border);
      background: var(--card-bg);
      border-radius: var(--radius);
      padding: 18px 20px;
      transition: all 0.18s ease;
    }
    .additional-service-card:hover {
      border-color: var(--border-hover);
      background: var(--card-bg-hover);
      transform: translateY(-1px);
    }
    .additional-service-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.05rem; font-weight: 600;
      color: var(--fg); line-height: 1.2;
      letter-spacing: -0.01em; margin-bottom: 7px;
    }
    .additional-service-desc {
      font-size: 0.78rem; font-weight: 300;
      color: var(--fg-muted); line-height: 1.58;
    }

    /* ── Accountability strip ── */
    .accountability-strip {
      display: flex; gap: 16px; align-items: flex-start;
      width: 100%; margin-bottom: 48px;
    }
    .accountability-strip-bar {
      width: 2px; flex-shrink: 0;
      background: var(--accent-border);
      border-radius: 2px; align-self: stretch;
      min-height: 44px;
    }
    .accountability-strip-text {
      font-size: 0.87rem; font-weight: 300;
      color: var(--fg-muted); line-height: 1.76; font-style: italic;
    }

    /* ── Testimonials ── */
    .testimonials-section {
      width: 100%;
      border-top: 1px solid var(--border);
      padding-top: 40px; margin-bottom: 48px;
    }
    .testimonials-label {
      font-size: 0.63rem; font-weight: 600;
      letter-spacing: 0.15em; text-transform: uppercase;
      color: var(--fg-muted); margin-bottom: 24px;
    }
    .testimonials-grid { display: flex; flex-direction: column; gap: 0; }
    .testimonial-card {
      padding: 22px 0;
      border-bottom: 1px solid var(--border);
    }
    .testimonial-card:first-child { padding-top: 0; }
    .testimonial-card:last-child { border-bottom: none; padding-bottom: 0; }
    .testimonial-quote {
      font-size: 0.93rem; font-style: italic; font-weight: 300;
      color: var(--fg-muted); line-height: 1.78; margin-bottom: 12px;
    }
    .testimonial-attr { display: flex; flex-direction: column; gap: 2px; }
    .testimonial-name { font-size: 0.76rem; font-weight: 500; color: var(--fg); }
    .testimonial-role { font-size: 0.72rem; font-weight: 300; color: var(--fg-muted); }

    /* ── Final CTA ── */
    .result-final-cta {
      display: flex; flex-direction: column; align-items: flex-start;
      gap: 10px; width: 100%; padding-top: 4px;
    }
    .final-cta-nudge {
      font-size: 0.86rem; font-weight: 400; color: var(--fg);
      margin-bottom: 2px;
    }

    /* ── Privacy ── */
    .vec-privacy {
      font-size: 0.66rem; color: var(--fg-faint);
      text-align: center; padding: 0 24px 24px; margin-top: auto;
    }

    @media (max-width: 640px) {
      .vec-main { padding: 36px 18px 72px; }
      .intro-wrap { padding: 48px 20px; align-items: flex-start; padding-top: 60px; }
      .additional-services-grid { grid-template-columns: 1fr; }
      .result-cta-block { align-items: stretch; }
      .main-cta { justify-content: center; }
      .result-final-cta { align-items: stretch; }
      .primary-service-card { padding: 22px 20px 20px; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="vec-page">
            <div className="vec-inner">

              {screen === 'intro' && (
                <IntroScreen onStart={() => transition('q1')} />
              )}

              {screen !== 'intro' && (
                <main className="vec-main">

                  {screen === 'q1' && (
                    <QuestionScreen
                      stepLabel="Step 1 of 2"
                      question={"Based on your FFR results —\nhow do you feel?"}
                      sub="Not the polished answer. The honest one."
                      options={q1Options}
                      selected={selected}
                      onSelect={handleQ1}
                      onBack={() => transition('intro')}
                      animOut={animOut}
                    />
                  )}

                  {screen === 'q2-confident' && (
                    <QuestionScreen
                      stepLabel="Step 2 of 2"
                      question={"Good. What gives you\nthat confidence?"}
                      sub="This shapes the most useful thing we can offer you."
                      options={q2ConfidentOptions}
                      selected={selected}
                      onSelect={handleQ2Confident}
                      onBack={() => transition('q1')}
                      animOut={animOut}
                    />
                  )}

                  {screen === 'q2-confused' && (
                    <QuestionScreen
                      stepLabel="Step 2 of 2"
                      question={"What's the source\nof the confusion?"}
                      sub="Be specific — the answer shapes your path."
                      options={q2ConfusedOptions}
                      selected={selected}
                      onSelect={handleQ2Confused}
                      onBack={() => transition('q1')}
                      animOut={animOut}
                    />
                  )}

                  {screen === 'processing' && (
                    <ProcessingScreen onComplete={() => transition('result')} />
                  )}

                  {screen === 'result' && resultVisible && (
                    <ResultScreen
                      result={result}
                      onBook={() => navigate('/dashboard/book-wealth-manager')}
                      onBack={handleBack}
                      animOut={animOut}
                    />
                  )}

                </main>
              )}

              {screen !== 'intro' && screen !== 'result' && screen !== 'processing' && (
                <p className="vec-privacy">
                  Your answers are matched to your FFR results to find your guided path — never shared.
                </p>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}