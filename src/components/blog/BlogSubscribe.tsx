import { useState } from 'react';
import { BellRing, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

type Status = 'idle' | 'saving' | 'done' | 'already' | 'error';

/**
 * "Get notified about new articles" sign-up. Saves the email to
 * newsletter_subscribers (visitors can add, only admins can read).
 */
export const BlogSubscribe = ({ compact = false }: { compact?: boolean }) => {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(''); // hidden field: only bots fill it in
  const [status, setStatus] = useState<Status>('idle');

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!address) return;
    if (company) {
      setStatus('done'); // quietly ignore bots
      return;
    }
    setStatus('saving');
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: address, source: window.location.pathname });
    if (!error) setStatus('done');
    else if (error.code === '23505') setStatus('already'); // email already on the list
    else setStatus('error');
  };

  const finished = status === 'done' || status === 'already';

  return (
    <section
      aria-label="Subscribe to new articles"
      className={`not-prose my-10 rounded-2xl border border-primary/20 bg-primary/10 p-5 sm:p-6 ${
        compact ? '' : 'sm:flex sm:items-center sm:gap-6'
      }`}
    >
      <div className={`flex gap-4 ${compact ? 'mb-4' : 'mb-4 sm:mb-0 sm:flex-1'}`}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <BellRing className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground leading-snug">Get notified about new articles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay up to date with our latest content and market trends. We'll email you when a new article is published.
          </p>
        </div>
      </div>

      {finished ? (
        <p className={`flex items-center gap-2 text-sm font-medium text-primary ${compact ? '' : 'sm:w-80'}`} role="status">
          <Check className="h-5 w-5" />
          {status === 'done' ? "You're subscribed. Thank you!" : "You're already subscribed."}
        </p>
      ) : (
        <form onSubmit={subscribe} className={compact ? 'space-y-2' : 'space-y-2 sm:w-80'}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor={compact ? 'subscribe-email-compact' : 'subscribe-email'} className="sr-only">
              Email address
            </label>
            <Input
              id={compact ? 'subscribe-email-compact' : 'subscribe-email'}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="Your email address"
              className="bg-background"
            />
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="hidden"
            />
            <Button type="submit" disabled={status === 'saving'} className="shrink-0">
              {status === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Subscribe Now
            </Button>
          </div>
          {status === 'error' ? (
            <p className="text-xs text-destructive" role="alert">
              Something went wrong. Please try again.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              By subscribing you agree to receive emails from Vinca Wealth. Unsubscribe anytime.
            </p>
          )}
        </form>
      )}
    </section>
  );
};
