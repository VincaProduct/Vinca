import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Loader2, PenLine, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePanelMembership } from '@/hooks/usePanelMembership';
import { describeDbError } from '@/lib/dbErrors';
import type { PanelApplication } from '@/lib/expertPanel';

/**
 * Expert Panel application, inside the dashboard. A super admin reviews it in
 * Admin Tools → Panel Applications; once approved, the person can write.
 */
const ExpertPanelApplyPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isMember, loading: memberLoading } = usePanelMembership();
  const [latest, setLatest] = useState<PanelApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reapplying, setReapplying] = useState(false);

  const [form, setForm] = useState({
    full_name: user?.user_metadata?.full_name || '',
    linkedin_url: '',
    occupation: '',
    topics: '',
    sample_url: '',
  });
  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const loadLatest = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('expert_panel_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setLatest((data as PanelApplication | null) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('expert_panel_applications').insert({
      user_id: user.id,
      email: user.email || '',
      full_name: form.full_name.trim(),
      linkedin_url: form.linkedin_url.trim() || null,
      occupation: form.occupation.trim(),
      topics: form.topics.trim(),
      sample_url: form.sample_url.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Your application wasn't sent", description: describeDbError(error), variant: 'destructive' });
      return;
    }
    toast({ title: 'Application sent', description: 'Our team will review it and get back to you.' });
    setReapplying(false);
    loadLatest();
  };

  if (loading || memberLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const backLink = (
    <Button variant="ghost" asChild className="gap-2">
      <Link to="/expert-panel">
        <ArrowLeft className="h-4 w-4" />
        Back to the Expert Panel
      </Link>
    </Button>
  );

  // Already a member: straight to writing
  if (isMember) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-6 py-6 pb-8">
        <Card>
          <CardContent className="pt-6 space-y-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">You're a member of the Expert Panel</h1>
            <p className="text-muted-foreground">Start writing or see how your articles are doing.</p>
            <Button asChild size="lg">
              <Link to="/dashboard/my-articles">Go to My Articles</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Waiting for review
  if (latest?.status === 'pending') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-6 py-6 pb-8">
        <Card>
          <CardContent className="pt-6 space-y-3 text-center">
            <Clock className="h-12 w-12 text-amber-500 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Your application is under review</h1>
            <p className="text-muted-foreground">
              Sent on {new Date(latest.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
              We review every application and reply within a week. Once you're approved, you can start writing here.
            </p>
          </CardContent>
        </Card>
        {backLink}
      </div>
    );
  }

  // Not selected this time (they can apply again)
  if (latest?.status === 'rejected' && !reapplying) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-6 py-6 pb-8">
        <Card>
          <CardContent className="pt-6 space-y-3 text-center">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Your application wasn't selected this time</h1>
            {latest.review_note && <p className="text-foreground">"{latest.review_note}"</p>}
            <p className="text-muted-foreground">You're welcome to apply again with a stronger writing sample.</p>
            <Button onClick={() => setReapplying(true)}>Apply again</Button>
          </CardContent>
        </Card>
        {backLink}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-6 py-6 pb-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Apply to the Expert Panel</h1>
        <p className="text-lg text-muted-foreground">
          Tell us about yourself. Our team reviews every application; once you're approved, you can start writing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            Your application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name *</Label>
              <Input id="full_name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required minLength={2} maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">What you do now (job or studies) *</Label>
              <Input
                id="occupation"
                placeholder="For example: MBA Finance student, or Financial analyst at a bank"
                value={form.occupation}
                onChange={(e) => update('occupation', e.target.value)}
                required
                minLength={2}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn profile</Label>
              <Input
                id="linkedin_url"
                type="url"
                placeholder="https://www.linkedin.com/in/your-name"
                value={form.linkedin_url}
                onChange={(e) => update('linkedin_url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topics">Topics you want to write about *</Label>
              <Textarea
                id="topics"
                placeholder="For example: retirement corpus planning, tax on mutual fund withdrawals, health insurance after 60"
                value={form.topics}
                onChange={(e) => update('topics', e.target.value)}
                required
                minLength={3}
                maxLength={1000}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sample_url">Link to something you have written (optional)</Label>
              <Input
                id="sample_url"
                type="url"
                placeholder="A blog post, LinkedIn article or Google Doc"
                value={form.sample_url}
                onChange={(e) => update('sample_url', e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              We'll contact you at <span className="font-medium text-foreground">{user?.email}</span>.
            </p>
            <Button type="submit" size="lg" disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Send application
            </Button>
          </form>
        </CardContent>
      </Card>

      {backLink}
    </div>
  );
};

export default ExpertPanelApplyPage;
