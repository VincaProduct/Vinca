
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import type { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<'blog_posts'>;

const PopularArticles = () => {
  const [popularArticles, setPopularArticles] = useState<BlogPost[]>([]);
  const { posts, fetchPublishedPosts } = useBlogPosts();

  useEffect(() => {
    fetchPublishedPosts();
  }, []);

  useEffect(() => {
    // Take the first 4 posts as "popular" - in a real app you might track views/likes
    setPopularArticles(posts.slice(0, 4));
  }, [posts]);

  return (
    <Card className="bg-background border shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-display">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Popular Articles
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          {popularArticles.map((article, index) => (
            <Link 
              key={article.id}
              to={`/blog/${article.slug}`}
              className="block group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-3 sm:p-4 rounded-lg border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all duration-300">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">
                    {article.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    #{index + 1}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2 leading-tight">
                  {article.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.read_time}
                  </div>
                  <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PopularArticles;
