
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useBlogPosts } from "@/hooks/useBlogPosts";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const { posts, fetchPublishedPosts } = useBlogPosts();

  useEffect(() => {
    fetchPublishedPosts();
  }, []);

  useEffect(() => {
    // Extract unique categories from posts
    const uniqueCategories = Array.from(new Set(posts.map(post => post.category)));
    setCategories(['All', ...uniqueCategories]);
  }, [posts]);

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category)}
          className={`text-xs sm:text-sm px-3 sm:px-4 py-2 transition-all duration-200 ${
            selectedCategory === category
              ? "bg-primary text-primary-foreground shadow-lg"
              : "hover:bg-primary/10 hover:text-primary hover:border-primary/50"
          }`}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
