
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import type { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<'blog_posts'>;

const BlogSection = () => {
  const [featuredArticles, setFeaturedArticles] = useState<BlogPost[]>([]);
  const { posts, loading, fetchPublishedPosts } = useBlogPosts();

  useEffect(() => {
    fetchPublishedPosts();
  }, []);

  useEffect(() => {
    // Get the first 3 published posts for the homepage
    setFeaturedArticles(posts.slice(0, 3));
  }, [posts]);

  return (
    <section id="blog" className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-6 text-foreground px-2">
            Financial Insights & Market Updates
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Stay informed with expert insights, market analysis, and actionable financial advice 
            from our team of certified financial professionals.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : featuredArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {featuredArticles.map((article, index) => (
                <Card 
                  key={article.id}
                  className="group hover:shadow-lg transition-all duration-300 border hover:border-primary/20 bg-background overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <Link to={`/blog/${article.slug}`} className="block h-full">
                    {article.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={article.featured_image} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader className="p-4 sm:p-6">
                      <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                        <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                          {article.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {article.read_time}
                        </div>
                      </div>
                      <CardTitle className="text-base sm:text-lg font-display font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                      {article.excerpt && (
                        <CardDescription className="text-muted-foreground line-clamp-3 text-sm">
                          {article.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-primary hover:text-primary hover:bg-primary/10 font-medium text-xs sm:text-sm"
                        >
                          Read More →
                        </Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link to="/blog">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-6 sm:px-8"
                >
                  View All Articles
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              No blog posts available at the moment.
            </p>
            <p className="text-sm text-muted-foreground">
              Check back soon for the latest financial insights and updates.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
