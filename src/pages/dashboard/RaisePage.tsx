import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown, Send, MessageSquare, CheckCircle, ShieldCheck, Check, X, EyeOff } from 'lucide-react';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

interface RaiseItem {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  score: number;
  userVote: 'up' | 'down' | null;
  isMine: boolean;
}

type View = 'top' | 'recent' | 'mine' | 'review';

const MIN_LENGTH = 3;
const MAX_LENGTH = 500;

const GUIDELINES = [
  'Keep it professional and respectful. No abusive or offensive language.',
  'Don’t share personal details such as phone numbers, emails, account or folio numbers.',
  'No promotions, links or spam.',
  'Every post is reviewed before it appears for other clients.',
];

const toItem = (row: {
  id: string; title: string; status: string; created_at: string; score: number; my_vote: number | null; is_mine: boolean;
}): RaiseItem => ({
  id: row.id,
  title: row.title,
  status: row.status as RaiseItem['status'],
  createdAt: row.created_at,
  score: row.score,
  userVote: row.my_vote === 1 ? 'up' : row.my_vote === -1 ? 'down' : null,
  isMine: row.is_mine,
});

export default function RaisePage() {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserRole();

  const [items, setItems] = useState<RaiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [raiseText, setRaiseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [view, setView] = useState<View>('top');
  const modalRef = useRef<HTMLDivElement>(null);

  const loadBoard = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_raise_board');
    if (error) {
      console.error('Error loading raise board:', error);
      setLoadError(
        /get_raise_board|function|schema cache/i.test(error.message)
          ? 'The Raise board database hasn’t been set up yet.'
          : 'Couldn’t load the board. Please refresh the page.',
      );
    } else {
      setLoadError(null);
      setItems((data || []).map(toItem));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Each click moves the count one step: with no vote, up or down votes;
  // with a vote, either arrow takes it back to neutral (18 → 19 → 18 → 17)
  const handleVote = async (item: RaiseItem, direction: 'up' | 'down') => {
    if (!user || item.status !== 'approved') return;
    const next = item.userVote ? null : direction;
    const delta = (next === 'up' ? 1 : next === 'down' ? -1 : 0) - (item.userVote === 'up' ? 1 : item.userVote === 'down' ? -1 : 0);

    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, userVote: next, score: i.score + delta } : i)));

    const { error } = next
      ? await supabase.from('raise_votes').upsert({ post_id: item.id, user_id: user.id, value: next === 'up' ? 1 : -1 })
      : await supabase.from('raise_votes').delete().eq('post_id', item.id).eq('user_id', user.id);

    if (error) {
      console.error('Error saving vote:', error);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, userVote: item.userVote, score: i.score - delta } : i)));
      toast.error('Your vote couldn’t be saved. Please try again.');
    }
  };

  const handleRaiseSubmit = async () => {
    const title = raiseText.trim();
    if (!user || title.length < MIN_LENGTH || submitting) return;

    setSubmitting(true);
    const { error } = await supabase.from('raise_posts').insert({ title, user_id: user.id });
    setSubmitting(false);

    if (error) {
      console.error('Error posting raise:', error);
      toast.error('Your blocker couldn’t be sent. Please try again.');
      return;
    }
    setRaiseText('');
    setShowConfirmation(true);
    loadBoard();
  };

  const setStatus = async (item: RaiseItem, status: RaiseItem['status']) => {
    const { error } = await supabase
      .from('raise_posts')
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id ?? null })
      .eq('id', item.id);
    if (error) {
      console.error('Error reviewing raise:', error);
      toast.error('Couldn’t update this post.');
      return;
    }
    toast.success(status === 'approved' ? 'Approved: now visible to all clients' : 'Hidden from clients');
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status } : i)));
  };

  // What each button shows. Top reasons and Most recent list the approved
  // posts plus your own posts still under review; My blockers lists only yours.
  const byScore = (a: RaiseItem, b: RaiseItem) =>
    b.score - a.score || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  const byDate = (a: RaiseItem, b: RaiseItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  const onBoard = items.filter((i) => i.status === 'approved' || (i.isMine && i.status === 'pending'));
  const pending = items.filter((i) => i.status === 'pending');
  const shown =
    view === 'top' ? [...onBoard].sort(byScore)
    : view === 'recent' ? [...onBoard].sort(byDate)
    : view === 'mine' ? items.filter((i) => i.isMine).sort(byDate)
    : [...pending].sort(byDate);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowConfirmation(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowConfirmation(false);
      }
    };

    if (showConfirmation) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showConfirmation]);

  // Add keyframe animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }

      .animate-scaleIn {
        animation: scaleIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const viewButton = (key: View, label: string, count?: number) => (
    <button
      type="button"
      key={key}
      aria-pressed={view === key}
      onClick={() => setView(key)}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
        view === key
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-background text-foreground hover:border-primary/60 hover:text-primary'
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={`rounded-full px-1.5 text-[10px] ${view === key ? 'bg-white/25' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>{count}</span>
      )}
    </button>
  );

  const emptyText =
    view === 'mine' ? 'You haven’t raised a blocker yet. Share what’s holding you back above.'
    : view === 'review' ? 'Nothing waiting for review.'
    : 'Share the challenges you face. Help us build better tools for your financial journey.';

  return (
    <>
      {/* Success Modal - Matches ElevatePage styling exactly */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div
            ref={modalRef}
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center transform animate-scaleIn mx-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600" />
              </div>
            </div>

            <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
              Thank you for sharing
            </h2>

            <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed">
              We've received what's holding you back. Our team reviews every post, and once approved it appears on the board for other clients.
            </p>

            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left">
              <p className="text-xs sm:text-sm font-medium text-slate-700 mb-2">Your input matters</p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                  <span>You can see it any time under “My blockers”</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                  <span>We'll use this to improve guidance and tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                  <span>Many face similar challenges — your voice helps us understand</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowConfirmation(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl transition-all shadow-md hover:shadow-lg"
            >
             Got it
            </button>
          </div>
        </div>
      )}

      <CanonicalPageHeader
        title="Raise the blockers holding back your financial progress."
      />
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6 w-full max-w-6xl mx-auto">

          {/* Main Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 md:p-6">
              {/* Posting guidelines */}
              <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" /> Before you post
                </p>
                <ul className="mt-2 grid gap-1 sm:grid-cols-2 sm:gap-x-6 text-xs text-muted-foreground">
                  {GUIDELINES.map((g) => (
                    <li key={g} className="flex gap-2"><span className="text-primary">•</span><span>{g}</span></li>
                  ))}
                </ul>
              </div>

              {/* Input Section */}
              <div className="mb-4 sm:mb-6">
                <div className="rounded-lg border border-dashed border-muted-foreground/20 bg-muted/40 p-2 sm:p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                    <div className="w-full flex-1 relative">
                      <input
                        type="text"
                        className="w-full h-12 sm:h-11 rounded-md border border-input bg-background px-3 sm:px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 pr-16"
                        placeholder={
                          typeof window !== 'undefined' && window.innerWidth < 640
                            ? "What's blocking you"
                            : "What's blocking your financial progress?"
                        }
                        value={raiseText}
                        onChange={(e) => setRaiseText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRaiseSubmit();
                        }}
                        disabled={submitting || !!loadError}
                        maxLength={MAX_LENGTH}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none select-none bg-background px-1">
                        {raiseText.length}/{MAX_LENGTH}
                      </span>
                    </div>
                    <button
                      className="w-full sm:w-auto sm:mt-1 inline-flex h-12 sm:h-10 px-4 sm:px-3 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:aspect-square"
                      onClick={handleRaiseSubmit}
                      disabled={submitting || !!loadError || raiseText.trim().length < MIN_LENGTH}
                      aria-label="Submit raise"
                    >
                      <Send className="h-4 w-4 mr-2 sm:mr-0" />
                      <span className="sm:sr-only">Submit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* View buttons */}
              <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap mr-1">Show:</span>
                {viewButton('top', 'Top reasons')}
                {viewButton('recent', 'Most recent')}
                {viewButton('mine', 'My blockers')}
                {isSuperAdmin && viewButton('review', 'Review', pending.length)}
              </div>

              {/* Items List */}
              {loading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Loading the board…</p>
              ) : loadError ? (
                <p className="py-8 text-center text-sm text-muted-foreground">{loadError}</p>
              ) : shown.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {shown.map((item) => {
                    const canVote = item.status === 'approved';
                    const scoreClass =
                      item.score > 5 ? 'border-l-2 border-l-emerald-500/50 bg-gradient-to-r from-emerald-50/30 to-transparent dark:from-emerald-950/20'
                      : item.score > 0 ? 'border-l-2 border-l-emerald-500/30'
                      : item.score < 0 ? 'opacity-80'
                      : '';

                    return (
                      <div
                        key={item.id}
                        className={`rounded-lg border border-border bg-background p-3 sm:p-4 shadow-sm transition hover:shadow-md ${canVote ? scoreClass : 'border-dashed'}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                          {/* Content */}
                          <div className="flex-1 min-w-0 order-2 sm:order-1">
                            <p className="text-sm text-foreground leading-relaxed break-words">
                              {item.title}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                {new Date(item.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              {item.isMine && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">You</span>
                              )}
                              {item.status === 'pending' && (
                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-600 dark:text-amber-400">Under review</span>
                              )}
                              {item.status === 'rejected' && (
                                <span className="rounded-full bg-muted px-2 py-0.5 font-semibold">Not published</span>
                              )}
                            </div>

                            {/* Admin review */}
                            {isSuperAdmin && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {item.status !== 'approved' && (
                                  <button type="button" onClick={() => setStatus(item, 'approved')}
                                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90">
                                    <Check className="h-3.5 w-3.5" /> Approve
                                  </button>
                                )}
                                {item.status === 'pending' && (
                                  <button type="button" onClick={() => setStatus(item, 'rejected')}
                                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground hover:border-destructive hover:text-destructive">
                                    <X className="h-3.5 w-3.5" /> Reject
                                  </button>
                                )}
                                {item.status === 'approved' && (
                                  <button type="button" onClick={() => setStatus(item, 'rejected')}
                                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground hover:border-destructive hover:text-destructive">
                                    <EyeOff className="h-3.5 w-3.5" /> Hide
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Voting controls - Mobile optimized */}
                          <div className={`flex sm:flex-col items-center justify-between sm:justify-start order-1 sm:order-2 w-full sm:w-auto bg-muted/30 rounded-lg p-1.5 sm:p-1 ${canVote ? '' : 'opacity-50'}`}
                            title={canVote ? undefined : 'Voting opens once the post is approved'}>
                            <div className="flex sm:flex-col items-center gap-3 sm:gap-1 w-full sm:w-auto">
                              <button
                                className={`flex-1 sm:flex-none p-2 sm:p-1.5 rounded transition flex items-center justify-center disabled:cursor-not-allowed ${
                                  item.userVote === 'up'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                                    : 'text-muted-foreground hover:bg-muted hover:text-emerald-600 dark:hover:text-emerald-400'
                                }`}
                                onClick={() => handleVote(item, 'up')}
                                disabled={!canVote}
                                aria-label="Upvote"
                                aria-pressed={item.userVote === 'up'}
                              >
                                <ChevronUp className="h-5 w-5 sm:h-4 sm:w-4" />
                              </button>

                              <span className={`text-base sm:text-sm font-medium min-w-[2rem] text-center ${
                                item.score > 0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : item.score < 0
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-muted-foreground'
                              }`}>
                                {item.score}
                              </span>

                              <button
                                className={`flex-1 sm:flex-none p-2 sm:p-1.5 rounded transition flex items-center justify-center disabled:cursor-not-allowed ${
                                  item.userVote === 'down'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                                    : 'text-muted-foreground hover:bg-muted hover:text-amber-600 dark:hover:text-amber-400'
                                }`}
                                onClick={() => handleVote(item, 'down')}
                                disabled={!canVote}
                                aria-label="Downvote"
                                aria-pressed={item.userVote === 'down'}
                              >
                                <ChevronDown className="h-5 w-5 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-8 sm:px-6 sm:py-10 text-center">
                  <div className="flex h-12 w-12 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageSquare className="h-6 w-6 sm:h-5 sm:w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {view === 'review' ? 'All caught up' : view === 'mine' ? 'No blockers yet' : 'No blockers shared yet'}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">{emptyText}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
