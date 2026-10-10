
import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowDown } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import type { Tables } from "@/integrations/supabase/types";
import { optimizedImage } from "@/lib/images";

type BlogPost = Tables<'blog_posts'>;

interface BlogGridProps {
  selectedCategory: string;
  searchQuery: string;
}

// Must match POSTS_PER_PAGE in the blog edge function (server-rendered pages)
const POSTS_PER_PAGE = 12;

const pageHref = (page: number) => (page <= 1 ? "/blog" : `/blog?page=${page}`);

const BlogGrid = ({ selectedCategory, searchQuery }: BlogGridProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredArticles, setFilteredArticles] = useState<BlogPost[]>([]);
  const { posts, loading, fetchPublishedPosts } = useBlogPosts();
  const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / POSTS_PER_PAGE));
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1;

  // Back to the top of the list when moving between pages
  const pageRef = useRef(page);
  useEffect(() => {
    if (pageRef.current !== page) window.scrollTo({ top: 0, behavior: "smooth" });
    pageRef.current = page;
  }, [page]);

  // Changing the category or search starts again from the first page
  const filtersRef = useRef({ selectedCategory, searchQuery });
  useEffect(() => {
    const previous = filtersRef.current;
    filtersRef.current = { selectedCategory, searchQuery };
    if (previous.selectedCategory !== selectedCategory || previous.searchQuery !== searchQuery) {
      if (searchParams.has("page")) setSearchParams({}, { replace: true });
    }
  }, [selectedCategory, searchQuery, searchParams, setSearchParams]);

  useEffect(() => {
    fetchPublishedPosts();
  }, []);

  useEffect(() => {
    let filtered = posts;
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredArticles(filtered);
  }, [selectedCategory, searchQuery, posts]);


  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredArticles.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE).map((article, index) => (
          <Card 
            key={article.id}
            className="group hover:shadow-xl transition-all duration-500 border hover:border-primary/20 bg-background overflow-hidden animate-fade-in h-full"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Link to={`/blog/${article.slug}`} className="block h-full">
              {article.featured_image && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={optimizedImage(article.featured_image, 640)} 
                    alt={article.title}
                    width={640}
                    height={360}
                    loading={index < 3 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              )}
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                  <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                    {article.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {article.read_time}
                  </div>
                </div>
                <CardTitle className="text-sm sm:text-base lg:text-lg font-display font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                {article.excerpt && (
                  <p className="text-muted-foreground line-clamp-3 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10 font-medium text-xs p-1 h-auto"
                  >
                    Read More
                    <ArrowDown className="w-3 h-3 ml-1 rotate-[-45deg]" />
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-base sm:text-lg text-muted-foreground mb-4">
            No articles found matching your criteria.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSearchParams({})}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Blog pages" className="flex flex-wrap items-center justify-center gap-2 pt-4 sm:pt-8">
          {page > 1 && (
            <Link to={pageHref(page - 1)} rel="prev" className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-muted">
              Previous
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
            p === page ? (
              <span key={p} aria-current="page" className="inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
                {p}
              </span>
            ) : (
              <Link key={p} to={pageHref(p)} className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm hover:bg-muted">
                {p}
              </Link>
            ),
          )}
          {page < totalPages && (
            <Link to={pageHref(page + 1)} rel="next" className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-muted">
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
};

export default BlogGrid;
