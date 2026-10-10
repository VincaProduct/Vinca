import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowDown, ArrowUp, HelpCircle, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { resetGlobalFaqsCache } from '@/lib/faqs';
import type { Tables } from '@/integrations/supabase/types';

type GlobalFaq = Tables<'global_faqs'>;

/** Admin page for the company FAQs shown at the end of every blog post */
const GlobalFaqsPage = () => {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<GlobalFaq[]>([]);
  // Unsaved edits, by FAQ id
  const [drafts, setDrafts] = useState<Record<string, { question: string; answer: string }>>({});
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<GlobalFaq | null>(null);

  const showError = (error: unknown) =>
    toast({
      title: 'Something went wrong',
      description: error instanceof Error ? error.message : String((error as { message?: string })?.message || error),
      variant: 'destructive',
    });

  const load = async () => {
    const { data, error } = await supabase.from('global_faqs').select('*').order('position', { ascending: true });
    if (error) showError(error);
    setFaqs(data || []);
    setLoading(false);
    resetGlobalFaqsCache();
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (action: () => PromiseLike<{ error: unknown }>, success: string) => {
    setBusy(true);
    const { error } = await action();
    setBusy(false);
    if (error) {
      showError(error);
      return false;
    }
    toast({ title: success });
    await load();
    return true;
  };

  const addFaq = async () => {
    const question = newFaq.question.trim();
    const answer = newFaq.answer.trim();
    if (!question || !answer) return;
    const position = faqs.length ? Math.max(...faqs.map((f) => f.position)) + 1 : 0;
    if (await run(() => supabase.from('global_faqs').insert({ question, answer, position }), 'Question added')) {
      setNewFaq({ question: '', answer: '' });
    }
  };

  const saveFaq = async (faq: GlobalFaq) => {
    const draft = drafts[faq.id];
    if (!draft || !draft.question.trim() || !draft.answer.trim()) return;
    const ok = await run(
      () =>
        supabase
          .from('global_faqs')
          .update({ question: draft.question.trim(), answer: draft.answer.trim(), updated_at: new Date().toISOString() })
          .eq('id', faq.id),
      'Saved',
    );
    if (ok) setDrafts(({ [faq.id]: _saved, ...rest }) => rest);
  };

  const move = async (index: number, direction: -1 | 1) => {
    const a = faqs[index];
    const b = faqs[index + direction];
    if (!a || !b) return;
    // Renumber everything so positions are unique, then swap the two
    const order = faqs.map((f) => f.id);
    [order[index], order[index + direction]] = [order[index + direction], order[index]];
    await run(
      () =>
        Promise.all(order.map((id, position) => supabase.from('global_faqs').update({ position }).eq('id', id))).then(
          (results) => ({ error: results.find((r) => r.error)?.error ?? null }),
        ),
      'Order updated',
    );
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const faq = deleting;
    setDeleting(null);
    await run(() => supabase.from('global_faqs').delete().eq('id', faq.id), 'Question deleted');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <HelpCircle className="w-7 h-7" />
          Global FAQs
        </h1>
        <p className="text-muted-foreground mt-1">
          Company questions shown at the end of every blog post, after the post's own FAQs. A post can hide them with
          its "Show company FAQs" switch.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add a question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={newFaq.question}
            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
            placeholder="Question, e.g. Is Vinca Wealth registered with AMFI?"
          />
          <Textarea
            value={newFaq.answer}
            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
            placeholder="Answer"
            rows={3}
          />
          <Button onClick={addFaq} disabled={busy || !newFaq.question.trim() || !newFaq.answer.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add question
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : faqs.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No company FAQs yet.</p>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const draft = drafts[faq.id];
            const value = draft || { question: faq.question, answer: faq.answer };
            const changed = !!draft && (draft.question !== faq.question || draft.answer !== faq.answer);
            return (
              <Card key={faq.id}>
                <CardContent className="space-y-2 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground w-8">Q{index + 1}</span>
                    <Input
                      value={value.question}
                      onChange={(e) => setDrafts({ ...drafts, [faq.id]: { ...value, question: e.target.value } })}
                    />
                    <Button variant="ghost" size="sm" onClick={() => move(index, -1)} disabled={busy || index === 0} aria-label="Move up">
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => move(index, 1)}
                      disabled={busy || index === faqs.length - 1}
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(faq)}
                      disabled={busy}
                      className="text-destructive hover:text-destructive"
                      aria-label="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={value.answer}
                    onChange={(e) => setDrafts({ ...drafts, [faq.id]: { ...value, answer: e.target.value } })}
                    rows={3}
                  />
                  {changed && (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setDrafts(({ [faq.id]: _discarded, ...rest }) => rest)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveFaq(faq)} disabled={busy}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.question}" will be removed from every blog post. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GlobalFaqsPage;
