import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Send, MessageSquare, CheckCircle } from 'lucide-react';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';

interface RaiseItem {
  id: string | number;
  title: string;
  votes: number;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  createdAt: string;
}

export default function RaisePage() {
    // Returns a color class for the card based on upvotes/downvotes
    function getScoreColor(upvotes: number, downvotes: number) {
      const netScore = (upvotes || 0) - (downvotes || 0);
      if (netScore > 5) return 'border-l-2 border-l-emerald-500/50 bg-gradient-to-r from-emerald-50/30 to-transparent dark:from-emerald-950/20';
      if (netScore > 0) return 'border-l-2 border-l-emerald-500/30';
      if (netScore < 0) return 'opacity-80';
      return '';
    }

    // Handles upvote/downvote logic
    function handleVote(id: string | number, direction: 'up' | 'down') {
      setState((prev) => {
        const updatedItems = prev.raiseItems.map((item) => {
          if (item.id !== id) return item;
          let upvotes = item.upvotes || 0;
          let downvotes = item.downvotes || 0;
          let userVote = item.userVote;
          // Remove previous vote
          if (userVote === 'up') upvotes--;
          if (userVote === 'down') downvotes--;
          // Add new vote
          if (direction === 'up') upvotes++;
          if (direction === 'down') downvotes++;
          userVote = direction;
          return { ...item, upvotes, downvotes, userVote };
        });
        return { ...prev, raiseItems: updatedItems };
      });
    }
  const [state, setState] = useState({
    raiseText: '',
    raiseItems: [] as RaiseItem[],
    raiseLoading: false,
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sortOrder, setSortOrder] = useState<'score' | 'recent'>('score');
  const modalRef = useRef<HTMLDivElement>(null);

  // Sort items based on net score and date
  const getSortedItems = (items: RaiseItem[]) => {
    return [...items].sort((a, b) => {
      const netScoreA = (a.upvotes || 0) - (a.downvotes || 0);
      const netScoreB = (b.upvotes || 0) - (b.downvotes || 0);
      
      if (netScoreA !== netScoreB) {
        return netScoreB - netScoreA; // Higher score first
      }
      // If scores are equal, newer first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const handleRaiseSubmit = () => {
    if (!state.raiseText.trim()) return;

    setState((prev) => ({ ...prev, raiseLoading: true }));
    setTimeout(() => {
      const newRaise: RaiseItem = {
        id: Date.now(),
        title: state.raiseText,
        votes: 0,
        upvotes: 0,
        downvotes: 0,
        userVote: null,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        raiseItems: [newRaise, ...prev.raiseItems],
        raiseText: '',
        raiseLoading: false,
      }));
      setShowConfirmation(true);
    }, 800);
  };

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
              We've recorded what's holding you back right now.
            </p>

            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left">
              <p className="text-xs sm:text-sm font-medium text-slate-700 mb-2">Your input matters</p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                  <span>Many face similar challenges — your voice helps us understand</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                  <span>We'll use this to improve guidance and tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                  <span>Your responses shape future improvements</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowConfirmation(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl transition-all shadow-md hover:shadow-lg"
            >
             Welcome
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
                        value={state.raiseText}
                        onChange={(e) => setState((prev) => ({ ...prev, raiseText: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRaiseSubmit();
                        }}
                        disabled={state.raiseLoading}
                        maxLength={500}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none select-none bg-background px-1">
                        {state.raiseText.length}/500
                      </span>
                    </div>
                    <button
                      className="w-full sm:w-auto sm:mt-1 inline-flex h-12 sm:h-10 px-4 sm:px-3 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:aspect-square"
                      onClick={handleRaiseSubmit}
                      disabled={state.raiseLoading || !state.raiseText.trim()}
                      aria-label="Submit raise"
                    >
                      <Send className="h-4 w-4 mr-2 sm:mr-0" />
                      <span className="sm:sr-only">Submit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sort Controls */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between">
                  <div className="border-t border-border flex-1" />
                  <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Sort by:</span>
                    <button
                      className={`text-xs px-2 sm:px-3 py-1.5 sm:py-1 rounded transition whitespace-nowrap ${
                        sortOrder === 'score' 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setSortOrder('score')}
                    >
                      Top voted
                    </button>
                    <button
                      className={`text-xs px-2 sm:px-3 py-1.5 sm:py-1 rounded transition whitespace-nowrap ${
                        sortOrder === 'recent' 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setSortOrder('recent')}
                    >
                      Most recent
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {state.raiseItems.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {(sortOrder === 'score' ? getSortedItems(state.raiseItems) : state.raiseItems).map((item: RaiseItem) => {
                    const netScore = (item.upvotes || 0) - (item.downvotes || 0);
                    const scoreClass = getScoreColor(item.upvotes, item.downvotes);
                    
                    return (
                      <div
                        key={item.id}
                        className={`rounded-lg border border-border bg-background p-3 sm:p-4 shadow-sm transition hover:shadow-md ${scoreClass}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                          {/* Content */}
                          <div className="flex-1 min-w-0 order-2 sm:order-1">
                            <p className="text-sm text-foreground leading-relaxed break-words">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              {new Date(item.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          
                          {/* Voting controls - Mobile optimized */}
                          <div className="flex sm:flex-col items-center justify-between sm:justify-start order-1 sm:order-2 w-full sm:w-auto bg-muted/30 rounded-lg p-1.5 sm:p-1">
                            <div className="flex sm:flex-col items-center gap-3 sm:gap-1 w-full sm:w-auto">
                              <button
                                className={`flex-1 sm:flex-none p-2 sm:p-1.5 rounded transition flex items-center justify-center ${
                                  item.userVote === 'up'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                                    : 'text-muted-foreground hover:bg-muted hover:text-emerald-600 dark:hover:text-emerald-400'
                                }`}
                                onClick={() => handleVote(item.id, 'up')}
                                aria-label="Upvote"
                              >
                                <ChevronUp className="h-5 w-5 sm:h-4 sm:w-4" />
                              </button>
                              
                              <span className={`text-base sm:text-sm font-medium min-w-[2rem] text-center ${
                                netScore > 0 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : netScore < 0 
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-muted-foreground'
                              }`}>
                                {netScore}
                              </span>
                              
                              <button
                                className={`flex-1 sm:flex-none p-2 sm:p-1.5 rounded transition flex items-center justify-center ${
                                  item.userVote === 'down'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                                    : 'text-muted-foreground hover:bg-muted hover:text-amber-600 dark:hover:text-amber-400'
                                }`}
                                onClick={() => handleVote(item.id, 'down')}
                                aria-label="Downvote"
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
                    <p className="text-sm font-semibold text-foreground">No blockers shared yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                      Share the challenges you face. Help us build better tools for your financial journey.
                    </p>
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