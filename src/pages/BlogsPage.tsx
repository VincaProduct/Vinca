
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// import BlogHero from "@/components/blog/BlogHero";
import FeaturedArticle from "@/components/blog/FeaturedArticle";
import CategoryFilter from "@/components/blog/CategoryFilter";
import SearchBar from "@/components/blog/SearchBar";
import BlogGrid from "@/components/blog/BlogGrid";
import PopularArticles from "@/components/blog/PopularArticles";
// import NewsletterSignup from "@/components/blog/NewsletterSignup";
import BlogArticle from "@/components/blog/BlogArticle";
import { BlogCTARenderer } from "@/components/cta/BlogCTARenderer";

const BlogsPage = () => {
  const { slug } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Scroll to top with smooth animation when component mounts or slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // If we have a slug, show individual article
  if (slug) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <BlogArticle slug={slug} />
        <Footer />
      </div>
    );
  }

  // Otherwise show the main blogs listing
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* <BlogHero /> */}
      {/* <FeaturedArticle /> */}
      
      {/* Top Page CTAs */}
      <BlogCTARenderer
        blogPostId="blog-listing-page"
        category={selectedCategory !== "All" ? selectedCategory : undefined}
        position="top"
      />
      
      <section className="p-8 sm:py-12 lg:py-16 mt-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <div className="mb-8">
                <CategoryFilter 
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
                <SearchBar 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
              <BlogGrid 
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
              />
              
              {/* Bottom Page CTAs */}
              <BlogCTARenderer
                blogPostId="blog-listing-page"
                category={selectedCategory !== "All" ? selectedCategory : undefined}
                position="bottom"
              />
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-8">
              <PopularArticles />
              {/* <NewsletterSignup /> */}
              
              {/* Sidebar CTAs */}
              <BlogCTARenderer
                blogPostId="blog-listing-page"
                category={selectedCategory !== "All" ? selectedCategory : undefined}
                position="sidebar"
              />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default BlogsPage;
