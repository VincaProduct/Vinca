import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  FileCheck2,
  PenLine,
  Send,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeaturedExperts from '@/components/experts/FeaturedExperts';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Public Expert Panel page: what the panel is, what members get,
 * and how to apply. Applying uses the normal sign-in (/auth), the same one the
 * team and admins use, then continues inside the dashboard.
 */

const APPLY_PATH = '/dashboard/expert-panel';

const BENEFITS = [
  {
    icon: UserRound,
    title: 'Your own profile page',
    text: 'Your own page at vincawealth.com/experts/your-name with your photo, bio, LinkedIn, every article you have published and its total views.',
  },
  {
    icon: PenLine,
    title: 'Your byline on every article',
    text: 'Your name on research-driven articles, on a platform for people planning their retirement.',
  },
  {
    icon: BarChart3,
    title: 'Proof of your work',
    text: 'See how many times each of your articles has been viewed, so you can show real numbers, not just a link.',
  },
  {
    icon: Award,
    title: 'A title for your CV',
    text: '"Member, Expert Panel at Vinca Wealth".',
  },
];

const STEPS = [
  { icon: Send, title: 'Apply', text: 'Sign in and tell us about yourself and what you want to write about.' },
  { icon: BadgeCheck, title: 'Get selected', text: 'Our team reviews every application. Not everyone is selected.' },
  { icon: PenLine, title: 'Write', text: 'Write articles on retirement, investing, tax, insurance and financial planning.' },
  { icon: FileCheck2, title: 'Review', text: 'Every article goes through editorial and compliance review before it is published.' },
  { icon: Users, title: 'Publish', text: 'Approved articles go live under your name, and you can track how they perform.' },
];

const CRITERIA = [
  'A genuine interest in personal finance and retirement planning',
  'Clear, original writing (no copied or AI-generated filler)',
  'Willingness to back what you write with data, examples or real experience',
  'Commitment to publish at least one article a month',
];

const ExpertPanelPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Same sign-in as everyone else; after signing in the visitor lands on the apply step
  const handleApply = () => {
    if (user) {
      navigate(APPLY_PATH);
      return;
    }
    localStorage.setItem('redirect_after_login', APPLY_PATH);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 sm:pt-28">
        {/* Hero */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <ShieldCheck className="h-4 w-4" />
              By selection only
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 text-foreground">
              The Vinca <span className="text-primary">Expert Panel</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto">
              A selected panel of finance writers and professionals helping India plan for retirement. Publish under
              your own name and build a body of work you can show.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={handleApply} className="gap-2">
                Apply to join <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/blog">Read our articles</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Verified writers who have published (shows nothing until someone has) */}
        <FeaturedExperts limit={5} />

        {/* What members get */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-10 text-center text-foreground">
              What members get
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-xl border bg-card p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-10 text-center text-foreground">
              How it works
            </h2>
            <ol className="space-y-4">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="flex gap-4 rounded-xl border bg-card p-5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {title}
                    </h3>
                    <p className="text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* What we look for */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-8 text-center text-foreground">
              What we look for
            </h2>
            <ul className="space-y-3">
              {CRITERIA.map((item) => (
                <li key={item} className="flex gap-3 text-foreground">
                  <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final call to action */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-foreground">Ready to apply?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Sign in with your account to start your application. It takes two minutes.
            </p>
            <Button size="lg" onClick={handleApply} className="gap-2">
              Apply to join <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="mt-8 text-xs text-muted-foreground max-w-2xl mx-auto">
              Articles published on Vinca Wealth are for education only and are not a recommendation to buy or sell any
              investment. Panel members write in their own name; all articles are reviewed by Vinca before publishing.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ExpertPanelPage;
