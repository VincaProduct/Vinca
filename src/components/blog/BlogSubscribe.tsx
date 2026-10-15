import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

type Status = 'idle' | 'saving' | 'done' | 'already' | 'error';

/**
 * Simple newsletter sign-up ("Get data-backed market insights"). Saves the email to
 * newsletter_subscribers (visitors can add, only admins can read).
 * The blog edge function renders the same markup, so keep them in sync.
 */
export const BlogSubscribe = ({ id = 'subscribe', className = '' }: { id?: string; className?: string }) => {
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
    else {
      console.error('Newsletter sign-up failed:', error);
      setStatus('error');
    }
  };

  return (
    <section aria-labelledby={`${id}-title`} className={`not-prose rounded-lg border border-border p-4 ${className}`}>
      <p id={`${id}-title`} className="font-semibold text-foreground">
        Get data-backed market insights
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Well-researched articles on markets, equities, mutual funds and investing, delivered to your inbox.
      </p>

      {status === 'done' || status === 'already' ? (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-primary" role="status">
          <Check className="h-4 w-4" />
          {status === 'done' ? "You're subscribed. Thank you!" : "You're already subscribed."}
        </p>
      ) : (
        <form onSubmit={subscribe} className="mt-3">
          <div className="flex gap-2">
            <label htmlFor={`${id}-email`} className="sr-only">
              Email address
            </label>
            <Input
              id={`${id}-email`}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="Your email"
              className="h-9 min-w-0 bg-background"
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
            <Button type="submit" size="sm" disabled={status === 'saving'} className="h-9 shrink-0">
              {status === 'saving' && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Subscribe
            </Button>
          </div>
          {status === 'error' ? (
            <p className="mt-2 text-xs text-destructive" role="alert">
              Sorry, that didn't work. Please try again later.
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              By subscribing you agree to receive emails from Vinca Wealth. Unsubscribe anytime.
            </p>
          )}
        </form>
      )}
    </section>
  );
};
