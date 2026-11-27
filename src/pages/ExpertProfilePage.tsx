import { useEffect, useState } from 'react';
import VerifiedBadge from '@/components/experts/VerifiedBadge';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Award, BookOpen, Eye, GraduationCap, Linkedin, Loader2, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LEVEL_LABEL, expertProfileUrl, type PanelMembership } from '@/lib/expertPanel';
import type { Database } from '@/integrations/supabase/types';

type ExpertProfile = Database['public']['Functions']['get_expert_profile']['Returns'][number];

interface ProfileArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  category: string;
  read_time: string | null;
  published_at: string | null;
}

/** Public portfolio of an Expert Panel member: vincawealth.com/experts/<handle> */
const ExpertProfilePage = () => {
  const { handle = '' } = useParams<{ handle: string }>();
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [articles, setArticles] = useState<ProfileArticle[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState('loading');
      const { data, error } = await supabase.rpc('get_expert_profile', { _handle: handle.toLowerCase() });
      const found = !error && data && data.length > 0 ? data[0] : null;
      if (cancelled) return;
      if (!found) {
        setState('missing');
        return;
      }
      setProfile(found);
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image, category, read_time, published_at')
        .eq('author_id', found.author_id)
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (cancelled) return;
      setArticles((posts as ProfileArticle[] | null) ?? []);
      setState('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const memberSince = profile
    ? new Date(profile.member_since).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';
  const levelLabel = profile ? LEVEL_LABEL[(profile.level as PanelMembership['level']) || 'member'] : '';
  const initials = profile?.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {profile && (
        <Helmet>
          <title>{`${profile.name} | Expert Panel | Vinca Wealth`}</title>
          <meta
            name="description"
            content={(profile.bio || `${profile.name} is a ${levelLabel} of the Vinca Wealth Expert Panel.`).slice(0, 155)}
          />
          <link rel="canonical" href={expertProfileUrl(profile.handle)} />
          <meta property="og:type" content="profile" />
          <meta property="og:title" content={`${profile.name} · Vinca Wealth Expert Panel`} />
          {profile.image && <meta property="og:image" content={profile.image} />}
        </Helmet>
      )}
      {state === 'missing' && (
        <Helmet>
          <title>Profile not found | Vinca Wealth</title>
          <meta name="robots" content="noindex" />
        </Helmet>
      )}

      <Header />
      <main className="pt-24 sm:pt-28 pb-16">
        {state === 'loading' && (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {state === 'missing' && (
          <div className="container mx-auto px-4 max-w-2xl text-center py-24 space-y-4">
            <h1 className="text-3xl font-bold text-foreground">Profile not found</h1>
            <p className="text-muted-foreground">This Expert Panel profile doesn't exist or is no longer active.</p>
            <Button asChild variant="outline">
              <Link to="/expert-panel">About the Expert Panel</Link>
            </Button>
          </div>
        )}

        {state === 'ready' && profile && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-10">
            {/* Header */}
            <section className="flex flex-col sm:flex-row gap-6 sm:items-center">
              {profile.image ? (
                <img src={profile.image} alt={profile.name} className="h-28 w-28 rounded-full object-cover border" />
              ) : (
                <div className="h-28 w-28 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold">
                  {initials}
                </div>
              )}
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  <Award className="h-3.5 w-3.5" />
                  {levelLabel}, Expert Panel at Vinca Wealth
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">{profile.name}</h1>
                  <VerifiedBadge />
                </div>
                {profile.title && <p className="text-lg text-muted-foreground">{profile.title}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {profile.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile.credentials && (
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {profile.credentials}
                    </span>
                  )}
                  <span>Member since {memberSince}</span>
                </div>
                {profile.profile_url && (
                  <Button asChild variant="outline" size="sm" className="gap-2 mt-1">
                    <a href={profile.profile_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 gap-4 max-w-md">
              <div className="rounded-xl border bg-card p-5">
                <p className="text-3xl font-bold text-foreground">{profile.articles_published}</p>
                <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Articles published
                </p>
              </div>
              <div className="rounded-xl border bg-card p-5">
                <p className="text-3xl font-bold text-foreground">{profile.total_reads.toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Total views
                </p>
              </div>
            </section>

            {/* About */}
            {(profile.bio || profile.expertise.length > 0) && (
              <section className="space-y-4">
                <h2 className="text-2xl font-display font-bold text-foreground">About</h2>
                {profile.bio && <p className="text-foreground leading-relaxed whitespace-pre-line">{profile.bio}</p>}
                {profile.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((topic) => (
                      <span key={topic} className="rounded-full bg-muted px-3 py-1 text-sm text-foreground">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Articles */}
            <section className="space-y-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Articles</h2>
              {articles.length === 0 ? (
                <p className="text-muted-foreground">No published articles yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {articles.map((a) => (
                    <Link key={a.id} to={`/blog/${a.slug}`} className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
                      {a.featured_image && (
                        <img src={a.featured_image} alt="" className="h-40 w-full object-cover" loading="lazy" />
                      )}
                      <div className="p-5 space-y-2">
                        <p className="text-xs text-primary font-medium">
                          {a.category}
                          {a.read_time ? ` · ${a.read_time}` : ''}
                        </p>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{a.title}</h3>
                        {a.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <p className="text-xs text-muted-foreground border-t pt-6">
              Expert Panel members write in their own name. Every article is reviewed by Vinca Wealth before it is
              published and is meant for education only; it is not a recommendation to buy or sell any investment.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ExpertProfilePage;
