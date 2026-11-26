import { useState } from 'react';
import { Edit, Loader2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { describeDbError } from '@/lib/dbErrors';
import type { Tables } from '@/integrations/supabase/types';

type BlogPost = Tables<'blog_posts'>;

interface ReviewQueueProps {
  posts: BlogPost[];
  onReview: (post: BlogPost) => void;
  onChanged: () => void;
}

/**
 * Blog CMS: Expert Panel articles waiting for review. "Review & publish" opens
 * the normal editor; "Send back" returns the draft to its writer with a note.
 */
export const ReviewQueue = ({ posts, onReview, onChanged }: ReviewQueueProps) => {
  const { toast } = useToast();
  const [sendingBackId, setSendingBackId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const waiting = posts
    .filter((p) => p.status === 'draft' && p.submitted_at)
    .sort((a, b) => (a.submitted_at! < b.submitted_at! ? -1 : 1));

  if (waiting.length === 0) return null;

  const sendBack = async (post: BlogPost) => {
    if (!note.trim()) {
      toast({ title: 'Add a note for the writer', description: 'Tell them what to change.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from('blog_posts')
      .update({ submitted_at: null, review_note: note.trim(), changes_requested_at: new Date().toISOString() })
      .eq('id', post.id)
      .eq('status', 'draft');
    setBusy(false);
    if (error) {
      toast({ title: "Couldn't send it back", description: describeDbError(error), variant: 'destructive' });
      return;
    }
    toast({ title: 'Sent back to the writer', description: 'They will see your note in My Articles.' });
    setSendingBackId(null);
    setNote('');
    onChanged();
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Waiting for review <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-sm text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">{waiting.length}</span>
        </h2>
        <p className="text-sm text-muted-foreground">Articles sent by Expert Panel members. Oldest first.</p>
      </div>

      {waiting.map((post) => (
        <Card key={post.id} className="border-amber-300/60">
          <CardContent className="pt-6 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{post.title}</p>
                <p className="text-sm text-muted-foreground">
                  {post.category} · {post.read_time} · sent {fmt(post.submitted_at!)}
                </p>
              </div>
              {sendingBackId !== post.id && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onReview(post)} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Review &amp; publish
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setSendingBackId(post.id); setNote(''); }} className="gap-2">
                    <Undo2 className="h-4 w-4" />
                    Send back
                  </Button>
                </div>
              )}
            </div>
            {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}

            {sendingBackId === post.id && (
              <div className="space-y-2">
                <Textarea
                  placeholder="What should the writer change? They will see this note."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => sendBack(post)} disabled={busy} className="gap-2">
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send back with feedback
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSendingBackId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
};
