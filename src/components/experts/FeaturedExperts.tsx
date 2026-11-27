import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { optimizedImage } from '@/lib/images';
import VerifiedBadge from '@/components/experts/VerifiedBadge';
import { authorInitials } from '@/content/articleCompliance';

type FeaturedExpert = {
  handle: string;
  name: string;
  title: string | null;
  image: string | null;
  articles_published: number;
  top_article_title: string | null;
  top_article_slug: string | null;
};

/**
 * Verified Expert Panel writers with published articles, most-read first (the
 * order isn't shown: no ranks or view counts while the panel is small).
 * Shows nothing until at least one member has published.
 */
const FeaturedExperts = ({ limit = 5 }: { limit?: number }) => {
  const [experts, setExperts] = useState<FeaturedExpert[]>([]);

  useEffect(() => {
    (supabase as any)
      .rpc('list_featured_experts', { _limit: limit })
      .then(({ data, error }: { data: FeaturedExpert[] | null; error: unknown }) => {
        if (!error && data) setExperts(data);
      });
  }, [limit]);

  if (experts.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-3 text-foreground">Meet our verified experts</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every writer is reviewed and verified by Vinca Wealth before they publish.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {experts.map((e) => (
            <div key={e.handle} className="flex flex-col rounded-xl border bg-card p-5">
              <Link to={`/experts/${e.handle}`} className="flex items-center gap-3 group">
                {e.image ? (
                  <img
                    src={optimizedImage(e.image, 128)}
                    alt={e.name}
                    width={56}
                    height={56}
                    loading="lazy"
                    className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <span aria-hidden="true" className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
                    {authorInitials(e.name)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-primary truncate">{e.name}</p>
                  {e.title && <p className="text-sm text-muted-foreground truncate">{e.title}</p>}
                </div>
              </Link>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <VerifiedBadge />
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  {e.articles_published} {e.articles_published === 1 ? 'article' : 'articles'}
                </span>
              </div>

              {e.top_article_slug && e.top_article_title && (
                <Link
                  to={`/blog/${e.top_article_slug}`}
                  className="mt-4 block rounded-lg bg-muted/50 px-3 py-2.5 text-sm font-medium text-foreground hover:text-primary line-clamp-2"
                >
                  {e.top_article_title}
                </Link>
              )}

              <Link
                to={`/experts/${e.handle}`}
                className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                View profile <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedExperts;
