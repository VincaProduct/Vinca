
import { Button } from "@/components/ui/button";

const BlogHero = () => {
  return (
    <section className="relative py-16 sm:py-20 mt-16 lg:py-24 overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-primary-800">
      {/* Animated Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-white/5 rounded-full animate-float hidden sm:block"></div>
      <div className="absolute top-20 right-20 w-12 h-12 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-white/5 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 sm:mb-6 leading-tight">
            Financial Insights &
            <span className="block bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              Expert Analysis
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-green-100 leading-relaxed max-w-3xl mx-auto px-4">
            Stay ahead of market trends with expert insights, actionable strategies, 
            and proven advice from certified financial professionals.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-white text-primary hover:bg-green-50 font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
            >
              Subscribe to Newsletter
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
            >
              Explore Categories
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
