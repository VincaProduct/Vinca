import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/blog/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePanelMembership } from '@/hooks/usePanelMembership';
import { describeDbError } from '@/lib/dbErrors';
import { estimateReadTime } from '@/lib/readTime';
import { tocFromMarkdown } from '@/lib/toc';
import type { Json } from '@/integrations/supabase/types';
import { ARTICLE_CATEGORIES, STAGE_CLASS, STAGE_LABEL, articleSlug, articleStage } from '@/lib/expertPanel';

/**
 * Expert Panel members write here. Articles stay drafts until a super admin
 * publishes them from the Blog CMS; "Send for review" marks them ready.
 */
const ArticleEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { membership, isMember, loading: memberLoading } = usePanelMembership();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(ARTICLE_CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>('draft');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState<'draft' | 'review' | null>(null);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from('blog_posts')
      .select('title, category, excerpt, content, status, submitted_at')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          toast({ title: "Couldn't open this article", description: error ? describeDbError(error) : 'It may have been deleted.', variant: 'destructive' });
          navigate('/dashboard/my-articles', { replace: true });
          return;
        }
        setTitle(data.title);
        setCategory(data.category || ARTICLE_CATEGORIES[0]);
        setExcerpt(data.excerpt || '');
        setContent(data.content || '');
        setStatus(data.status);
        setSubmittedAt(data.submitted_at);
        setLoading(false);
      });
  }, [id, isNew, navigate, toast]);

  const save = async (mode: 'draft' | 'review') => {
    if (!user || !membership?.author_id) return;
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Add a title and your article first', variant: 'destructive' });
      return;
    }
    if (mode === 'review' && content.trim().split(/\s+/).length < 300) {
      toast({ title: 'A little short for review', description: 'Articles need at least 300 words before you send them for review.', variant: 'destructive' });
      return;
    }

    setSaving(mode);
    const fields = {
      title: title.trim(),
      category,
      excerpt: excerpt.trim() || null,
      content,
      read_time: estimateReadTime(content),
      table_of_contents: tocFromMarkdown(content) as unknown as Json,
      submitted_at: mode === 'review' ? new Date().toISOString() : submittedAt,
    };

    const { data, error } = isNew
      ? await supabase
          .from('blog_posts')
          .insert({
            ...fields,
            slug: articleSlug(title),
            status: 'draft',
            author_id: membership.author_id,
            submitted_by: user.id,
          })
          .select('id')
          .single()
      : await supabase.from('blog_posts').update(fields).eq('id', id).select('id').single();
    setSaving(null);

    if (error) {
      toast({ title: "Your article wasn't saved", description: describeDbError(error), variant: 'destructive' });
      return;
    }
    toast(
      mode === 'review'
        ? { title: 'Sent for review', description: 'Our team will review it and publish it, or send you feedback.' }
        : { title: 'Draft saved' },
    );
    if (mode === 'review') navigate('/dashboard/my-articles');
    else if (isNew && data) navigate(`/dashboard/my-articles/${data.id}`, { replace: true });
  };

  if (memberLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isMember) return <Navigate to="/dashboard/expert-panel" replace />;

  const stage = articleStage({ status, submitted_at: submittedAt });
  if (stage === 'published' || stage === 'archived') return <Navigate to="/dashboard/my-articles" replace />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 py-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" asChild className="gap-2 -ml-3">
          <Link to="/dashboard/my-articles">
            <ArrowLeft className="h-4 w-4" />
            My Articles
          </Link>
        </Button>
        {!isNew && <span className={`rounded-full px-3 py-1 text-xs font-medium ${STAGE_CLASS[stage]}`}>{STAGE_LABEL[stage]}</span>}
      </div>

      {/* What every article must follow (Vinca is an AMFI-registered mutual fund distributor) */}
      <Card className="border-amber-300/60 bg-amber-50/50 dark:bg-amber-900/10">
        <CardContent className="pt-6">
          <p className="font-semibold text-foreground flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            Before you write
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Write to educate. Don't recommend specific funds, stocks or products to buy or sell.</li>
            <li>No promises of returns, and no words like "guaranteed" or "risk-free".</li>
            <li>Use your own words. Copied or AI-generated filler is not published.</li>
            <li>Back your points with data, examples or real experience, and name your sources.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A clear title that says what the reader will learn" maxLength={150} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARTICLE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="excerpt">Summary (one or two lines)</Label>
          <Textarea id="excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={300} />
        </div>
        <div className="space-y-2">
          <Label>Your article *</Label>
          <RichTextEditor content={content} onContentChange={setContent} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button variant="outline" onClick={() => save('draft')} disabled={saving !== null} className="gap-2">
          {saving === 'draft' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save draft
        </Button>
        <Button onClick={() => save('review')} disabled={saving !== null} className="gap-2">
          {saving === 'review' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {stage === 'in_review' ? 'Send updated version for review' : 'Send for review'}
        </Button>
      </div>
    </div>
  );
};

export default ArticleEditorPage;
