import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, User, Share2, Bookmark, ArrowDown, ChevronRight, ArrowUp } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { SimpleCTARenderer, BlogContentWithInlineCTAs } from '@/components/cta/SimpleCTARenderer';
import { TableOfContents } from "@/components/blog/TableOfContents";
import { BlogContentWithAnchors } from "@/components/blog/BlogContentWithAnchors";
import type { TOCItem } from "@/components/blog/TOCEditor";
import type { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<'blog_posts'> & {
  author?: {
    id: string;
    name: string;
    title: string | null;
    bio: string | null;
    image: string | null;
  } | null;
};

interface BlogArticleProps {
  slug?: string;
}

const BlogArticle = ({ slug: propSlug }: BlogArticleProps) => {
  const { slug: paramSlug } = useParams();
  const slug = propSlug || paramSlug;
  
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<BlogPost[]>([]);
  const { getPostBySlug, posts, fetchPublishedPosts } = useBlogPosts();

  // Scroll to top with smooth animation when component mounts or slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setReadingProgress(scrolled);
      
      // Show scroll to top button after scrolling 200px
      setShowScrollToTop(winScroll > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const post = await getPostBySlug(slug);
        setArticle(post);
      } catch (error) {
        console.error('Error loading article:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
    fetchPublishedPosts();
  }, [slug]);

  useEffect(() => {
    if (article && posts.length > 0) {
      // Find related articles by category, excluding current article
      const related = posts
        .filter(post => post.category === article.category && post.id !== article.id)
        .slice(0, 3);
      setRelatedArticles(related);
    }
  }, [article, posts]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <Link to="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          size="sm"
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div 
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <article className="pt-16 sm:pt-20 lg:pt-24">
        {/* Breadcrumb */}
        <div className="bg-muted/30 py-3 sm:py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-foreground truncate">{article.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className={`flex gap-8 max-w-7xl mx-auto ${
            article.table_of_contents && (article.table_of_contents as unknown as TOCItem[]).length > 0 
              ? '' 
              : 'justify-center'
          }`}>
            {/* Main Content */}
            <div className={`flex-1 ${
              article.table_of_contents && (article.table_of_contents as unknown as TOCItem[]).length > 0 
                ? 'max-w-4xl' 
                : 'max-w-4xl mx-auto'
            }`}>
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-sm text-muted-foreground">
                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                  {article.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.read_time}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.published_at || article.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Subtitle */}
              {article.subtitle && (
                <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                  {article.subtitle}
                </p>
              )}

              {/* Featured Image */}
              {article.featured_image && (
                <div className="aspect-video w-full mb-8 sm:mb-12 overflow-hidden rounded-lg">
                  <img 
                    src={article.featured_image} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Actions */}
              <div className="flex items-center justify-between py-4 sm:py-6 border-y border-border mb-8 sm:mb-12">
                <div className="flex items-center gap-3">
                  {article.author?.image && (
                    <img 
                      src={article.author.image} 
                      alt={article.author.name || 'Author'}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-sm sm:text-base">
                      {article.author?.name || article.author_name || 'Anonymous'}
                    </div>
                    {(article.author?.title || article.author_title) && (
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {article.author?.title || article.author_title}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Top Article CTAs */}
              <SimpleCTARenderer
                blogPostId={article.id}
                category={article.category}
                position="top"
              />

              {/* Mobile Table of Contents */}
              {article.table_of_contents && (article.table_of_contents as unknown as TOCItem[]).length > 0 && (
                <div className="lg:hidden mb-8">
                  <TableOfContents
                    items={article.table_of_contents as unknown as TOCItem[]}
                    className="w-full"
                  />
                </div>
              )}

              {/* Article Content with integrated CTAs */}
              {article.table_of_contents && (article.table_of_contents as unknown as TOCItem[]).length > 0 ? (
                <BlogContentWithAnchors 
                  content={article.content}
                  tocItems={article.table_of_contents as unknown as TOCItem[]}
                  blogPostId={article.id}
                  category={article.category}
                />
              ) : (
                <BlogContentWithInlineCTAs
                  content={article.content}
                  blogPostId={article.id}
                  category={article.category}
                />
              )}

              {/* Bottom CTAs */}
              <SimpleCTARenderer
                blogPostId={article.id}
                category={article.category}
                position="bottom"
              />

              {/* Author Bio */}
              {(article.author?.bio || article.author_bio) && (
                <div className="mt-12 sm:mt-16 p-6 sm:p-8 bg-muted/30 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-display font-bold mb-4">About the Author</h3>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {(article.author?.image || article.author_image) && (
                      <img 
                        src={article.author?.image || article.author_image || ''} 
                        alt={article.author?.name || article.author_name || 'Author'}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto sm:mx-0"
                      />
                    )}
                    <div className="text-center sm:text-left">
                      <h4 className="font-semibold text-base sm:text-lg mb-1">
                        {article.author?.name || article.author_name}
                      </h4>
                      {(article.author?.title || article.author_title) && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {article.author?.title || article.author_title}
                        </p>
                      )}
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {article.author?.bio || article.author_bio}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Table of Contents Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
              {article.table_of_contents && (article.table_of_contents as unknown as TOCItem[]).length > 0 && (
                <TableOfContents
                  items={article.table_of_contents as unknown as TOCItem[]}
                  className="w-full"
                />
              )}
              
              {/* Below TOC CTAs */}
              <SimpleCTARenderer
                blogPostId={article.id}
                category={article.category}
                position="below_toc"
              />
            </div>
          </div>

        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-muted/30 py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-display font-bold mb-8 sm:mb-12">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {relatedArticles.map((relatedArticle) => (
                    <Card key={relatedArticle.id} className="group hover:shadow-lg transition-shadow">
                      <Link to={`/blog/${relatedArticle.slug}`}>
                        {relatedArticle.featured_image && (
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <img 
                              src={relatedArticle.featured_image} 
                              alt={relatedArticle.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader className="p-4">
                          <Badge variant="outline" className="w-fit mb-2 text-xs border-primary/20 text-primary bg-primary/5">
                            {relatedArticle.category}
                          </Badge>
                          <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                            {relatedArticle.title}
                          </CardTitle>
                        </CardHeader>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </article>
    </>
  );
};

export default BlogArticle;
