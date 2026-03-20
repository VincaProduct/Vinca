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
}

interface ResultContent {
  eyebrow: string;
  headlineRegular: string;
  headlineItalic: string;
  body: string;
  ctaLabel: string;
  services: ServiceCard[];
  showCta: boolean;
  ctaSecondary?: string;
}

// ─── Services Master List ─────────────────────────────────────────────────────

const ALL_SERVICES: Record<string, ServiceCard> = {
  clarity: {
    tag: 'Most booked',
    title: '30-Minute Clarity Session',
    description: 'One conversation with a Vinca Wealth Manager. Your FFR numbers on the table. Walk out with a specific sequence — not a report, not options.',
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
    tag: 'Risk',
    title: 'Protection Gap Analysis',
    description: 'A dedicated session to cross-reference your health and income exposure from FFR against your actual coverage. Verified. Not estimated.',
  },
  secondOpinion: {
    tag: 'Validation',
    title: 'Second Opinion Session',
    description: 'Bring your existing plan, advisor\'s recommendations, or your own numbers. A Vinca Wealth Manager reads them independently and tells you what they see.',
  },
  peer: {
    tag: 'Professional',
    title: 'Professional Peer Review',
    description: 'A conversation between professionals. Your financial knowledge, our full-time focus on wealth outcomes. Compare approaches, not credentials.',
  },
};

// ─── Result Content Map ───────────────────────────────────────────────────────

function getResult(answers: Partial<Answers>): ResultContent {
  const { confidence, confidentPath, confusedPath } = answers;

  // ── CONFIDENT → FINANCIAL PROFESSIONAL ──
  if (confidence === 'confident' && confidentPath === 'professional') {
    return {
      eyebrow: 'Your Vector result',
      headlineRegular: 'You have the expertise.',
      headlineItalic: 'A second set of eyes never costs anything.',
      body: `You know how to read these numbers. You understand what a corpus gap means, what SIP calibration requires, and how to think about protection.\n\nVinca doesn't offer you advice. We offer you a peer conversation — one where both sides speak in numbers, not in general principles.\n\nThe best financial professionals we've worked with use us not because they need guidance, but because an independent read on their own plan catches what proximity misses.`,
      ctaLabel: 'Book a peer session',
      showCta: true,
      ctaSecondary: 'A professional conversation. No pitch. No basics.',
      services: [ALL_SERVICES.peer, ALL_SERVICES.secondOpinion, ALL_SERVICES.review],
    };
  }

  // ── CONFIDENT → HAS UNDERSTANDING ──
  if (confidence === 'confident' && confidentPath === 'understanding') {
    return {
      eyebrow: 'Your Vector result',
      headlineRegular: 'Understanding the numbers is the first half.',
      headlineItalic: 'Acting on them correctly is the second.',
      body: `You can read your FFR results. You know what your corpus gap means and roughly what needs to happen. That puts you ahead of most people.\n\nWhat you don't yet have is a verified sequence — the specific order in which to act, given your income, your timeline, and your protection position. Understanding and sequencing are different skills.\n\nOne conversation with a Vinca Wealth Manager converts your understanding into a plan you can start this week.`,
      ctaLabel: 'Book my clarity session',
      showCta: true,
      ctaSecondary: '30 minutes. Your numbers. A clear next step.',
      services: [ALL_SERVICES.clarity, ALL_SERVICES.plan, ALL_SERVICES.review],
    };
  }

  // ── CONFIDENT → WILL GOOGLE / USE ANOTHER APP ──
  if (confidence === 'confident' && confidentPath === 'google') {
    return {
      eyebrow: 'Your Vector result',
      headlineRegular: 'General answers exist everywhere.',
      headlineItalic: 'The answer for your specific numbers doesn\'t.',
      body: `Search results and financial apps give you frameworks. They can tell you what SIP rate to target in general, what insurance coverage looks like on average, what a good corpus milestone might be.\n\nYour FFR results are not general. Your corpus gap, your lifestyle number, your protection exposure — these are specific. And specific problems don't resolve through general answers.\n\nA Vinca Wealth Manager looks at your specific numbers and tells you exactly what to do. Not what people in your situation usually do.`,
      ctaLabel: 'Book my clarity session',
      showCta: true,
      ctaSecondary: '30 minutes. Built for your FFR results specifically.',
      services: [ALL_SERVICES.clarity, ALL_SERVICES.plan, ALL_SERVICES.protection],
    };
  }

  // ── CONFIDENT → HAS SOMEONE (advisor/family/friend) ──
  if (confidence === 'confident' && confidentPath === 'someone') {
    return {
      eyebrow: 'Your Vector result',
      headlineRegular: 'Having someone is good.',
      headlineItalic: 'Having someone accountable to your outcome is different.',
      body: `Advisors, family members, knowledgeable friends — their guidance comes from a good place. But there is a difference between someone who has knowledge and someone who is professionally accountable to your specific financial outcome.\n\nVinca Wealth Managers work only with your actual numbers. They are not giving general guidance — they are accountable to the corpus target your FFR identified, the lifestyle your plan needs to protect, and the gaps it currently has.\n\nOne session to compare what you've been told against what your numbers say.`,
      ctaLabel: 'Book my clarity session',
      showCta: true,
      ctaSecondary: 'Your numbers. An independent read. 30 minutes.',
      services: [ALL_SERVICES.secondOpinion, ALL_SERVICES.clarity, ALL_SERVICES.plan],
    };
  }

  // ── CONFUSED → NEXT STEP ──
  if (confidence === 'confused' && confusedPath === 'next-step') {
    return {
      eyebrow: 'Your Vector result',
      headlineRegular: 'You have the picture.',
      headlineItalic: 'What\'s missing is the sequence.',
      body: `Your FFR gave you the full picture — your corpus gap, the SIP required to close it, what lifestyle you can sustain, where your protection falls short. Knowing all of this and not knowing what to do first is not a failure of understanding.\n\nIt is exactly what a wealth manager is for.\n\nA Vinca Wealth Manager takes your FFR results and does one thing: tells you what to do first, what to do next, and what to leave for later. Not a report. A sequence you can start this week.`,
      ctaLabel: 'Book my clarity session',
      showCta: true,
      ctaSecondary: '30 minutes. Your FFR numbers. A specific first step.',
      services: [ALL_SERVICES.clarity, ALL_SERVICES.plan, ALL_SERVICES.review],
    };
  }

  // ── CONFUSED → DOESN'T TRUST THE NUMBERS ──
  if (confidence === 'confused' && confusedPath === 'wrong-numbers') {
    return {
      eyebrow: 'Your Vector result',
      headlineRegular: 'If the numbers feel wrong,',
      headlineItalic: 'the right move is to verify them with someone you trust.',
      body: `Your FFR results are built on the inputs you gave it — your income, your goals, your timeline, your coverage. If any of those inputs were off, the outputs will be off too. That is not a flaw in the model. It is a reason to sit with someone who can verify them.\n\nA Vinca Wealth Manager will go through your FFR results with you — not to defend them, but to test them. If the numbers are right, you leave knowing that. If something needs correcting, that correction happens in the same session.\n\nThe worst outcome is making decisions based on numbers you don't trust. One conversation resolves that.`,
      ctaLabel: 'Book a verification session',
      showCta: true,
      ctaSecondary: 'Verify your numbers. With someone accountable to getting them right.',
      services: [ALL_SERVICES.secondOpinion, ALL_SERVICES.clarity, ALL_SERVICES.protection],
    };
  }

  // ── DISBELIEVE ──
  if (confidence === 'disbelieve') {
    return {
      eyebrow: 'Your Vector result',
      headlineRegular: 'Scepticism is the right starting point.',
      headlineItalic: 'It deserves a proper answer, not reassurance.',
      body: `If your FFR results don't feel right — if the corpus gap seems too large, the SIP too high, or the lifestyle number too conservative — you are right to question it before acting on it.\n\nThe right response to a number you don't believe is not to dismiss it and not to accept it. It is to sit with someone who can take it apart with you — input by input — and show you exactly where it comes from and whether it holds.\n\nA Vinca Wealth Manager will verify your FFR results against your actual situation. You leave knowing whether the number is right, and if not, what the right number is.`,
      ctaLabel: 'Book a verification session',
      showCta: true,
      ctaSecondary: 'Your numbers tested. Not explained — verified.',
      services: [ALL_SERVICES.secondOpinion, ALL_SERVICES.clarity, ALL_SERVICES.plan],
    };
  }

  // Default fallback
  return {
    eyebrow: 'Your Vector result',
    headlineRegular: 'You have the numbers.',
    headlineItalic: 'Now get the sequence.',
    body: `Your FFR gave you clarity on what you need. Vinca Vector gives you the guided path to achieve it — starting with one conversation that converts your results into a specific next step.`,
    ctaLabel: 'Book my clarity session',
    showCta: true,
    ctaSecondary: '30 minutes. Free. No commitment.',
    services: [ALL_SERVICES.clarity, ALL_SERVICES.plan, ALL_SERVICES.review],
  };
}

// ─── Intro ────────────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="intro-wrap">
      <div className="intro-glow intro-glow-a" />
      <div className="intro-glow intro-glow-b" />
      <div className="intro-inner">
        <div className="intro-label">
          <span className="pulse-dot" />
          VINCA VECTOR
        </div>
        <h1 className="intro-headline">
          You know how much<br />
          you need to retire.<br />
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
  const [cursor, setCursor] = useState(true);
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
      setWordIndex(p => { if (p < words.length) return p + 1; clearInterval(hi); return p; });
    }, 90);
    const ci = setInterval(() => setCursor(p => !p), 530);
    lines.forEach((_, i) => {
      setTimeout(() => setVisibleLines(p => [...p, i]), 1100 + i * 520);
    });
    const t1 = setTimeout(() => setDone(true), 2700);
    const t2 = setTimeout(() => onComplete(), 3500);
    return () => { clearInterval(hi); clearInterval(ci); clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div className="proc-wrap">
      <div className="proc-glow" />
      <div className="proc-content">
        <h2 className="proc-heading">
          {words.slice(0, wordIndex).join(' ')}
          {cursor && wordIndex <= words.length && <span className="proc-cursor">|</span>}
        </h2>
        <div className="proc-lines">
          {lines.map((line, i) => (
            <div key={i} className={`proc-line ${visibleLines.includes(i) ? 'visible' : ''}`}>{line}</div>
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

      {/* CTA — above the fold */}
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

      {/* Services */}
      <div className="services-section">
        <p className="services-label">What Vinca offers</p>
        <div className="services-grid">
          {result.services.map((svc, i) => (
            <div key={i} className={`service-card ${i === 0 ? 'featured' : ''}`}>
              <span className="service-tag">{svc.tag}</span>
              <h3 className="service-title">{svc.title}</h3>
              <p className="service-desc">{svc.description}</p>
              {i === 0 && (
                <button className="service-cta" onClick={onBook}>
                  Book this session <ArrowRight size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Messaging strip */}
      <div className="message-strip">
        <p className="message-strip-text">
          Every Vinca Wealth Manager works exclusively with your FFR data — not general market advice. Your corpus target, your lifestyle number, your protection gap. That is what they are accountable to.
        </p>
      </div>

      {/* Testimonials */}
      <div className="testimonials">
        <p className="testimonials-label">From people who've had the session</p>
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-item">
            <p className="testimonial-quote">"{t.quote}"</p>
            <p className="testimonial-attr">
              — {t.name}, <span className="testimonial-role">{t.role}</span>
            </p>
            {i < testimonials.length - 1 && <div className="testimonial-divider" />}
          </div>
        ))}
      </div>

      {/* Final CTA */}
      {result.showCta && (
        <div className="result-final-cta">
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

type Screen =
  | 'intro'
  | 'q1'           // How do you feel about your FFR results?
  | 'q2-confident' // Confident sub-question
  | 'q2-confused'  // Confused sub-question
  | 'processing'
  | 'result';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnchorPage() {
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

  // Q1 choices
  const q1Options: QuestionOption[] = [
    {
      id: 'confident',
      label: 'I feel confident — I know what I need to do next.',
      sub: 'The numbers make sense. I have a plan or someone helping me.',
    },
    {
      id: 'confused',
      label: 'I understand the results but I\'m not sure what to do with them.',
      sub: 'The picture is clear. The next step isn\'t.',
    },
    {
      id: 'disbelieve',
      label: 'Honestly, I\'m not sure I believe these numbers.',
      sub: 'Something feels off. I\'m not ready to act on this.',
    },
  ];

  // Q2 for confident
  const q2ConfidentOptions: QuestionOption[] = [
    {
      id: 'professional',
      label: 'I\'m a financial professional — I can handle this myself.',
      sub: 'I have the expertise to read and act on these numbers.',
    },
    {
      id: 'understanding',
      label: 'I have a good understanding of personal finance.',
      sub: 'I know what SIPs, corpus, and protection mean and roughly what to do.',
    },
    {
      id: 'google',
      label: 'I\'ll figure it out — I\'ll research or use another app.',
      sub: 'I\'m comfortable finding the answers on my own.',
    },
    {
      id: 'someone',
      label: 'I have someone — an advisor, family member, or friend helping me.',
      sub: 'I\'m not alone on this. Someone I trust is already involved.',
    },
  ];

  // Q2 for confused
  const q2ConfusedOptions: QuestionOption[] = [
    {
      id: 'next-step',
      label: 'I trust the numbers — I just don\'t know what to do first.',
      sub: 'The results are real. The sequence to act on them isn\'t clear.',
    },
    {
      id: 'wrong-numbers',
      label: 'Something feels wrong — I\'m not sure I can trust what it\'s telling me.',
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
      else transition('processing'); // disbelieve → straight to result
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
    else if (screen === 'result') {
      const back = answers.confidence === 'confident' ? 'q2-confident'
        : answers.confidence === 'confused' ? 'q2-confused'
        : 'q1';
      transition(back);
    }
    else if (screen === 'processing') {
      const back = answers.confidence === 'confident' ? 'q2-confident'
        : answers.confidence === 'confused' ? 'q2-confused'
        : 'q1';
      transition(back);
    }
  };

  const result = getResult(answers);

  const stepLabel = screen === 'q1' ? 'Step 1 of 2'
    : screen === 'q2-confident' || screen === 'q2-confused' ? 'Step 2 of 2'
    : '';

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; max-width: 100%; }

    :root {
      --bg: hsl(184, 100%, 99%);
      --fg: hsl(185, 25%, 13%);
      --fg-muted: hsl(185, 12%, 42%);
      --fg-faint: hsl(184, 20%, 82%);
      --border: hsl(184, 28%, 88%);
      --border-hover: hsl(184, 28%, 72%);
      --accent: hsl(158, 60%, 48%);
      --accent-hover: hsl(158, 60%, 40%);
      --accent-light: hsl(158, 40%, 95%);
      --accent-text: hsl(158, 55%, 30%);
      --accent-rgb: 45, 196, 140;
      --contrast: #fff;
      --card-bg: hsl(184, 35%, 97%);
      --card-featured-bg: hsl(185, 25%, 13%);
      --card-featured-fg: hsl(184, 100%, 99%);
      --card-featured-muted: hsl(185, 15%, 65%);
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
      --accent: hsl(158, 60%, 50%);
      --accent-hover: hsl(158, 60%, 58%);
      --accent-light: hsl(158, 40%, 14%);
      --accent-text: hsl(158, 55%, 58%);
      --card-bg: hsl(185, 22%, 11%);
      --card-featured-bg: hsl(158, 30%, 16%);
      --card-featured-fg: hsl(184, 60%, 97%);
      --card-featured-muted: hsl(158, 20%, 55%);
    }

    html, body, #root {
      background: var(--bg);
      width: 100%;
      height: 100%;
      overflow-x: hidden;
    }

    /* ── Page Shell ── */
    .vec-page {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: var(--bg);
      color: var(--fg);
      width: 100%;
      min-height: calc(100vh - var(--navbar-height, 64px));
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .vec-page::before {
      content: '';
      position: fixed;
      top: -220px; right: -220px;
      width: 580px; height: 580px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
      opacity: 0.06;
      pointer-events: none;
      z-index: 0;
    }
    .vec-page::after {
      content: '';
      position: fixed;
      bottom: -200px; left: -120px;
      width: 500px; height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
      opacity: 0.04;
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
      max-width: 740px;
      margin: 0 auto;
      padding: 52px 24px 80px;
      box-sizing: border-box;
    }

    /* ── Pulse dot ── */
    @keyframes pdot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.35; transform: scale(0.55); }
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

    /* ── Intro ── */
    .intro-wrap {
      width: 100%;
      min-height: calc(100vh - var(--navbar-height, 64px));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      position: relative;
      overflow: hidden;
    }
    .intro-glow {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
    }
    .intro-glow-a {
      top: -200px; right: -200px;
      width: 600px; height: 600px;
      background: radial-gradient(circle, var(--accent) 0%, transparent 68%);
      opacity: 0.07;
    }
    .intro-glow-b {
      bottom: -220px; left: -130px;
      width: 520px; height: 520px;
      background: radial-gradient(circle, var(--accent) 0%, transparent 68%);
      opacity: 0.04;
    }
    .intro-inner {
      position: relative;
      z-index: 1;
      max-width: 600px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
    }
    .intro-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.66rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--accent-text);
      margin-bottom: 24px;
    }
    .intro-headline {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(2.6rem, 6.5vw, 4.4rem);
      font-weight: 600;
      line-height: 1.06;
      letter-spacing: -0.025em;
      color: var(--fg);
      margin-bottom: 24px;
    }
    .intro-headline em {
      font-style: italic;
      color: var(--accent-text);
    }
    .intro-sub {
      font-size: clamp(0.9rem, 2vw, 1.05rem);
      font-weight: 300;
      color: var(--fg-muted);
      line-height: 1.75;
      margin-bottom: 36px;
      max-width: 520px;
    }
    .intro-divider {
      width: 48px;
      height: 1px;
      background: var(--border);
      margin-bottom: 32px;
    }
    .intro-cta {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--accent);
      color: var(--contrast);
      font-family: 'DM Sans', system-ui, sans-serif;
      font-weight: 600;
      font-size: 1rem;
      padding: 16px 36px;
      border-radius: var(--radius);
      border: none;
      cursor: pointer;
      transition: all 0.22s ease;
      margin-bottom: 14px;
    }
    .intro-cta:hover {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 14px 36px rgba(var(--accent-rgb), 0.3);
    }
    .intro-note {
      font-size: 0.70rem;
      color: var(--fg-faint);
    }

    /* ── Scene transitions ── */
    .scene {
      width: 100%;
      transition: opacity 0.28s ease, transform 0.28s ease;
    }
    .scene.out { opacity: 0; transform: translateY(18px); }
    .scene.in { opacity: 1; transform: translateY(0); }

    /* ── Back button ── */
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 0.80rem;
      color: var(--fg-muted);
      padding: 6px 0;
      margin-bottom: 28px;
      transition: color 0.16s;
    }
    .back-btn:hover { color: var(--fg); }

    /* ── Step marker ── */
    .step-marker {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.66rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--accent-text);
      margin-bottom: 16px;
    }

    /* ── Question ── */
    .question-hl {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(2rem, 5.2vw, 3.6rem);
      font-weight: 600;
      line-height: 1.07;
      letter-spacing: -0.022em;
      color: var(--fg);
      margin-bottom: 12px;
    }
    .question-sub {
      font-size: 0.88rem;
      font-weight: 300;
      font-style: italic;
      color: var(--fg-muted);
      line-height: 1.6;
      margin-bottom: 36px;
    }

    /* ── Choices ── */
    .choices {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .choice {
      border: 1px solid var(--border);
      background: var(--card-bg);
      border-radius: var(--radius);
      padding: 18px 56px 18px 20px;
      cursor: pointer;
      text-align: left;
      position: relative;
      width: 100%;
      transition: all 0.2s ease;
    }
    .choice:hover {
      border-color: var(--border-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 18px rgba(0,0,0,0.05);
    }
    .choice.sel {
      border-color: var(--accent);
      background: var(--accent-light);
      box-shadow: 0 4px 20px rgba(var(--accent-rgb), 0.12);
    }
    .choice-indicator {
      position: absolute;
      top: 50%; right: 20px;
      transform: translateY(-50%);
      width: 20px; height: 20px;
      border-radius: 50%;
      border: 1.5px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .choice.sel .choice-indicator {
      background: var(--accent);
      border-color: var(--accent);
    }
    .choice-indicator svg { opacity: 0; transition: opacity 0.16s; }
    .choice.sel .choice-indicator svg { opacity: 1; }
    .choice-label {
      font-size: 0.96rem;
      font-weight: 500;
      color: var(--fg);
      line-height: 1.35;
      margin-bottom: 4px;
    }
    .choice-sub {
      font-size: 0.76rem;
      font-weight: 300;
      color: var(--fg-muted);
      line-height: 1.45;
    }

    /* ── Processing ── */
    .proc-wrap {
      width: 100%;
      min-height: 55vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 48px 24px;
    }
    .proc-glow {
      position: absolute;
      width: 420px; height: 420px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(var(--accent-rgb), 0.07) 0%, transparent 70%);
      pointer-events: none;
    }
    .proc-content {
      position: relative;
      z-index: 1;
      max-width: 540px;
      width: 100%;
      text-align: center;
    }
    .proc-heading {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(1.9rem, 5.2vw, 3rem);
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--fg);
      margin-bottom: 44px;
    }
    .proc-cursor {
      display: inline-block;
      width: 2px;
      height: 1em;
      background: var(--accent);
      margin-left: 3px;
      vertical-align: middle;
    }
    @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
    .proc-cursor { animation: blink 1s infinite; }
    .proc-lines { margin-bottom: 28px; }
    .proc-line {
      font-size: 1rem;
      color: var(--fg-muted);
      font-weight: 300;
      margin: 10px 0;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.38s ease, transform 0.38s ease;
    }
    .proc-line.visible { opacity: 1; transform: translateY(0); }
    .proc-final {
      font-size: 1.05rem;
      font-weight: 500;
      color: var(--accent-text);
      margin-top: 24px;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.38s ease 0.2s, transform 0.38s ease 0.2s;
    }
    .proc-final.visible { opacity: 1; transform: translateY(0); }

    /* ── Result page ── */
    .result-eyebrow {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.66rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent-text);
      margin-bottom: 20px;
      margin-top: 8px;
    }
    .result-headline {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(2.1rem, 5.4vw, 3.6rem);
      font-weight: 600;
      line-height: 1.08;
      letter-spacing: -0.022em;
      color: var(--fg);
      margin-bottom: 28px;
    }
    .result-headline-em {
      font-style: italic;
      color: var(--accent-text);
    }
    .result-body {
      margin-bottom: 36px;
      max-width: 620px;
    }
    .result-body p {
      font-size: 1rem;
      font-weight: 300;
      color: var(--fg-muted);
      line-height: 1.82;
      margin-bottom: 18px;
    }
    .result-body p:last-child { margin-bottom: 0; }

    /* ── Main CTA block ── */
    .result-cta-block {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 60px;
      width: 100%;
    }
    .main-cta {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--accent);
      color: var(--contrast);
      font-family: 'DM Sans', system-ui, sans-serif;
      font-weight: 600;
      font-size: 1rem;
      padding: 16px 32px;
      border-radius: var(--radius);
      border: none;
      cursor: pointer;
      transition: all 0.22s ease;
    }
    .main-cta:hover {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 14px 36px rgba(var(--accent-rgb), 0.28);
    }
    .cta-secondary-note {
      font-size: 0.72rem;
      font-weight: 300;
      color: var(--fg-muted);
    }

    /* ── Services ── */
    .services-section {
      width: 100%;
      margin-bottom: 48px;
    }
    .services-label {
      font-size: 0.66rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--fg-muted);
      margin-bottom: 16px;
    }
    .services-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .service-card {
      border: 1px solid var(--border);
      background: var(--card-bg);
      border-radius: var(--radius);
      padding: 22px 24px;
      transition: all 0.2s ease;
    }
    .service-card:hover {
      border-color: var(--border-hover);
      transform: translateY(-1px);
    }
    .service-card.featured {
      background: var(--card-featured-bg);
      border-color: transparent;
      padding: 26px 28px;
    }
    .service-tag {
      display: inline-block;
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent-text);
      background: var(--accent-light);
      padding: 3px 10px;
      border-radius: 40px;
      margin-bottom: 12px;
    }
    .service-card.featured .service-tag {
      color: var(--accent);
      background: rgba(var(--accent-rgb), 0.15);
    }
    .service-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--fg);
      margin-bottom: 8px;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .service-card.featured .service-title {
      color: var(--card-featured-fg);
      font-size: 1.35rem;
    }
    .service-desc {
      font-size: 0.86rem;
      font-weight: 300;
      color: var(--fg-muted);
      line-height: 1.65;
      margin-bottom: 0;
    }
    .service-card.featured .service-desc {
      color: var(--card-featured-muted);
      margin-bottom: 20px;
    }
    .service-cta {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: var(--accent);
      color: var(--contrast);
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 0.84rem;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .service-cta:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
    }

    /* ── Message strip ── */
    .message-strip {
      width: 100%;
      border-left: 2px solid var(--accent);
      padding-left: 20px;
      margin-bottom: 52px;
    }
    .message-strip-text {
      font-size: 0.9rem;
      font-weight: 300;
      color: var(--fg-muted);
      line-height: 1.75;
      font-style: italic;
    }

    /* ── Testimonials ── */
    .testimonials {
      width: 100%;
      border-top: 1px solid var(--border);
      padding-top: 44px;
      margin-bottom: 52px;
    }
    .testimonials-label {
      font-size: 0.66rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--fg-muted);
      margin-bottom: 28px;
    }
    .testimonial-item { }
    .testimonial-quote {
      font-size: 0.95rem;
      font-style: italic;
      font-weight: 300;
      color: var(--fg-muted);
      line-height: 1.78;
      margin-bottom: 12px;
    }
    .testimonial-attr {
      font-size: 0.76rem;
      font-weight: 500;
      color: var(--fg);
    }
    .testimonial-role {
      font-weight: 300;
      color: var(--fg-muted);
    }
    .testimonial-divider {
      border: none;
      border-top: 1px solid var(--border);
      margin: 28px 0;
    }

    /* ── Final CTA ── */
    .result-final-cta {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      width: 100%;
      padding-top: 8px;
    }

    /* ── Privacy ── */
    .vec-privacy {
      font-size: 0.67rem;
      color: var(--fg-faint);
      text-align: center;
      padding: 0 24px 24px;
      margin-top: auto;
    }

    @media (max-width: 640px) {
      .vec-main { padding: 40px 20px 60px; }
      .intro-wrap { padding: 48px 20px 48px; align-items: flex-start; padding-top: 72px; }
      .choices { gap: 8px; }
      .result-cta-block { align-items: stretch; }
      .main-cta { justify-content: center; }
      .result-final-cta { align-items: stretch; }
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
                  sub="This determines the most useful thing we can offer you."
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
    </>
  );
}