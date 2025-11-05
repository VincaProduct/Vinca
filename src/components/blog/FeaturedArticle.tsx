
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowDown } from "lucide-react";

const FeaturedArticle = () => {
  const featuredArticle = {
    slug: "ai-financial-planning-2024",
    title: "The Future of AI in Financial Planning: What 2024 Holds",
    excerpt: "Discover how artificial intelligence is revolutionizing wealth management and what it means for your financial future. From automated portfolio rebalancing to personalized investment strategies.",
    category: "Technology",
    readTime: "8 min read",
    date: "January 15, 2024",
    author: "Dr. Sarah Chen",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop"
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-3 sm:mb-4 text-foreground">
            Featured Article
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Our latest insights on the evolving landscape of financial technology
          </p>
        </div>

        <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Link to={`/blog/${featuredArticle.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="aspect-video sm:aspect-[2/1] overflow-hidden">
                <img 
                  src={featuredArticle.image} 
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 text-white">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Badge variant="default" className="bg-primary text-primary-foreground text-xs sm:text-sm">
                    {featuredArticle.category}
                  </Badge>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white/80">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {featuredArticle.readTime}
                  </div>
                  <span className="text-xs sm:text-sm text-white/80">•</span>
                  <span className="text-xs sm:text-sm text-white/80">{featuredArticle.date}</span>
                </div>
                
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary-200 transition-colors">
                  {featuredArticle.title}
                </h3>
                
                <p className="text-sm sm:text-base text-white/90 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-xs sm:text-sm text-white/80">By {featuredArticle.author}</span>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="w-full sm:w-auto bg-white/20 text-white border-white/30 hover:bg-white hover:text-primary transition-all duration-300"
                  >
                    Read Full Article
                    <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 rotate-[-45deg]" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticle;
