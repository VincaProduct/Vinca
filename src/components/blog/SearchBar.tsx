
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SearchBar = ({ searchQuery, onSearchChange }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="mb-6 sm:mb-8">
      <div className={`relative transition-all duration-300 ${isFocused ? 'transform scale-[1.02]' : ''}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search articles, topics, or keywords..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base border-2 focus:border-primary focus:ring-primary rounded-lg transition-all duration-300"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-muted rounded-full"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          )}
        </div>
        {searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 sm:p-3 bg-background border border-border rounded-lg shadow-lg animate-fade-in">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Searching for "<span className="text-primary font-medium">{searchQuery}</span>"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
