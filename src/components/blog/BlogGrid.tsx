
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowDown } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import type { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<'blog_posts'>;

interface BlogGridProps {
  selectedCategory: string;
  searchQuery: string;
}

const BlogGrid = ({ selectedCategory, searchQuery }: BlogGridProps) => {
  const [visibleArticles, setVisibleArticles] = useState(6);
  const [filteredArticles, setFilteredArticles] = useState<BlogPost[]>([]);
  const { posts, loading, fetchPublishedPosts } = useBlogPosts();

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

  const loadMore = () => {
    setVisibleArticles(prev => prev + 6);
  };

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
        {filteredArticles.slice(0, visibleArticles).map((article, index) => (
          <Card 
            key={article.id}
            className="group hover:shadow-xl transition-all duration-500 border hover:border-primary/20 bg-background overflow-hidden animate-fade-in h-full"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Link to={`/blog/${article.slug}`} className="block h-full">
              {article.featured_image && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={article.featured_image} 
                    alt={article.title}
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
            onClick={() => {
              setVisibleArticles(6);
            }}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {visibleArticles < filteredArticles.length && (
        <div className="text-center pt-4 sm:pt-8">
          <Button 
            onClick={loadMore}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-2 sm:py-3"
          >
            Load More Articles
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogGrid;
