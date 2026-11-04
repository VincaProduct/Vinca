import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { optimizedImage } from '@/lib/images';
import BlogArticle from '@/components/blog/BlogArticle';

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

/** Signed-in clients read the blog without leaving the dashboard */
const DashboardBlogPage = () => {
  const { slug } = useParams();
  const { posts, loading, fetchPublishedPosts } = useBlogPosts();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    if (!slug) fetchPublishedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))], [posts]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (!q || p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q)),
    );
  }, [posts, query, category]);

  // One article
  if (slug) {
    return (
      <div>
        <div className="px-4 sm:px-6 lg:px-8 pt-6">
          <Link to="/dashboard/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
        </div>
        {/* The article's own top spacing is for the public site header */}
        <div className="-mt-12 sm:-mt-16 lg:-mt-20">
          <BlogArticle slug={slug} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Blog</h1>
        <p className="text-muted-foreground mt-1">Research-driven articles on mutual funds, markets and retirement planning.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles" className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading articles…</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">No articles match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map((post) => (
            <Link
              key={post.id}
              to={`/dashboard/blog/${post.slug}`}
              className="group rounded-xl border bg-card overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
            >
              {post.featured_image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={optimizedImage(post.featured_image, 640)}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 font-semibold text-primary">{post.category}</span>
                  {post.read_time && (
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.read_time}</span>
                  )}
                </div>
                <h2 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h2>
                {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                <span className="mt-auto pt-1 text-xs text-muted-foreground">{formatDate(post.published_at || post.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardBlogPage;
