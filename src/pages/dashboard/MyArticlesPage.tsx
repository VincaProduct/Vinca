import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, Loader2, PenLine, Plus, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePanelMembership } from '@/hooks/usePanelMembership';
import { describeDbError } from '@/lib/dbErrors';
import { LEVEL_LABEL, STAGE_CLASS, STAGE_LABEL, articleStage, type MyArticle } from '@/lib/expertPanel';

/** Expert Panel members: their articles, where each one stands, and its views */
const MyArticlesPage = () => {
  const { toast } = useToast();
  const { membership, isMember, loading: memberLoading } = usePanelMembership();
  const [articles, setArticles] = useState<MyArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: '', title: '', bio: '', profile_url: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_my_article_stats');
    if (error) toast({ title: "Couldn't load your articles", description: describeDbError(error), variant: 'destructive' });
    setArticles((data as MyArticle[] | null) ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (isMember) load();
  }, [isMember, load]);

  useEffect(() => {
    if (!membership?.author_id) return;
    supabase
      .from('authors')
      .select('name, title, bio, profile_url')
      .eq('id', membership.author_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile({ name: data.name || '', title: data.title || '', bio: data.bio || '', profile_url: data.profile_url || '' });
      });
  }, [membership?.author_id]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membership?.author_id) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from('authors')
      .update({
        name: profile.name.trim(),
        title: profile.title.trim() || null,
        bio: profile.bio.trim() || null,
        profile_url: profile.profile_url.trim() || null,
      })
      .eq('id', membership.author_id);
    setSavingProfile(false);
    toast(
      error
        ? { title: "Your profile wasn't saved", description: describeDbError(error), variant: 'destructive' }
        : { title: 'Profile saved', description: 'It appears on every article you publish.' },
    );
  };

  if (memberLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  // Not approved yet: the apply page shows where their application stands
  if (!isMember) return <Navigate to="/dashboard/expert-panel" replace />;

  const published = articles.filter((a) => a.status === 'published');
  const totalViews = articles.reduce((sum, a) => sum + a.total_views, 0);
  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 py-6 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary mb-1">Expert Panel · {LEVEL_LABEL[membership!.level]}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">My Articles</h1>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link to="/dashboard/my-articles/new">
            <Plus className="h-4 w-4" />
            New article
          </Link>
        </Button>
      </div>

      {/* Totals: the "proof of your work" numbers */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Published', value: published.length },
          { label: 'Total views', value: totalViews.toLocaleString('en-IN') },
          { label: 'Views, last 30 days', value: articles.reduce((s, a) => s + a.views_30d, 0).toLocaleString('en-IN') },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            Your articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-muted-foreground">You haven't written anything yet. Your first article starts here.</p>
              <Button asChild variant="outline">
                <Link to="/dashboard/my-articles/new">Write your first article</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {articles.map((a) => {
                const stage = articleStage(a);
                const editable = stage === 'draft' || stage === 'in_review' || stage === 'changes_requested';
                return (
                  <li key={a.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_CLASS[stage]}`}>{STAGE_LABEL[stage]}</span>
                        <span className="text-xs text-muted-foreground">
                          {stage === 'published' ? `Published ${fmt(a.published_at)}` : stage === 'in_review' ? `Sent ${fmt(a.submitted_at)}` : stage === 'changes_requested' ? `Sent back ${fmt(a.changes_requested_at)}` : `Edited ${fmt(a.updated_at)}`}
                        </span>
                      </div>
                      <p className="font-medium text-foreground truncate">{a.title}</p>
                      {stage === 'changes_requested' && a.review_note && (
                        <p className="mt-1 text-sm text-red-700 dark:text-red-300 line-clamp-2">Feedback: {a.review_note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {stage === 'published' && (
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          {a.total_views.toLocaleString('en-IN')}
                        </span>
                      )}
                      {editable ? (
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/dashboard/my-articles/${a.id}`}>Edit</Link>
                        </Button>
                      ) : stage === 'published' ? (
                        <Button asChild size="sm" variant="ghost">
                          <a href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Author profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            Your author profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!membership?.author_id ? (
            <p className="text-muted-foreground">Your author profile is being set up. Please contact the Vinca team.</p>
          ) : (
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name shown on articles</Label>
                  <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="For example: Finance writer, MBA (Finance)" value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Short bio</Label>
                <Textarea id="bio" rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile_url">LinkedIn profile</Label>
                <Input id="profile_url" type="url" value={profile.profile_url} onChange={(e) => setProfile({ ...profile, profile_url: e.target.value })} />
              </div>
              <Button type="submit" variant="outline" disabled={savingProfile} className="gap-2">
                {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                Save profile
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyArticlesPage;
