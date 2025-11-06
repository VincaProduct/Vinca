import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Calculator, ChevronDown } from "lucide-react";

interface MobileNavigationProps {
  scrollToSection: (sectionId: string) => void;
}

const MobileNavigation = ({ scrollToSection }: MobileNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const { user } = useAuth();

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  const handlePortfolioLoginClick = () => {
    window.open("https://portfolio.vincawealth.com/login?_gl=1*1c7uhfu*_gcl_au*MTg1NjAzODIzOC4xNzQ5Mjk4MTEy*_ga*MTg1NzI3NTc0MC4xNzQ5Mjk4MTEy*_ga_6MQBMGPXJJ*czE3NDkzNzE3MTkkbzIkZzAkdDE3NDkzNzE3MTkkajYwJGwwJGgw", "_blank", "noopener,noreferrer");
    setIsMenuOpen(false);
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Menu Button */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:block transition-transform duration-200 hover:scale-105">
          <ThemeToggle />
        </div>
        
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative p-2 rounded-lg hover:bg-accent/50 transition-all duration-300 ease-in-out focus:outline-none focus:bg-accent/50 focus:ring-2 focus:ring-primary/20 group"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <div className="w-6 h-6 flex flex-col justify-center space-y-1.5 relative">
            <div className={`w-full h-0.5 bg-foreground transition-all duration-300 ease-in-out origin-center ${
              isMenuOpen 
                ? 'rotate-45 translate-y-2 scale-110' 
                : 'group-hover:scale-110'
            }`} />
            <div className={`w-full h-0.5 bg-foreground transition-all duration-300 ease-in-out ${
              isMenuOpen 
                ? 'opacity-0 scale-0' 
                : 'group-hover:scale-110'
            }`} />
            <div className={`w-full h-0.5 bg-foreground transition-all duration-300 ease-in-out origin-center ${
              isMenuOpen 
                ? '-rotate-45 -translate-y-2 scale-110' 
                : 'group-hover:scale-110'
            }`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`absolute top-full left-0 right-0 transition-all duration-300 ease-in-out ${
        isMenuOpen 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div className="relative bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg">
          <div className="container mx-auto px-3 sm:px-4 py-6">
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => handleMenuItemClick(() => scrollToSection('services'))}
                className="text-left text-muted-foreground hover:text-primary transition-all duration-200 ease-in-out py-3 px-3 rounded-lg hover:bg-accent/50 focus:outline-none focus:bg-accent/50 focus:text-primary group"
              >
                <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">
                  Services
                </span>
              </button>

              <Link
                to="/achievers-club"
                className="text-left text-muted-foreground hover:text-primary transition-all duration-200 ease-in-out py-3 px-3 rounded-lg hover:bg-accent/50 focus:outline-none focus:bg-accent/50 focus:text-primary group"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">
                  Achievers Club
                </span>
              </Link>
              
              {/* Tools Dropdown */}
              <div>
                <button
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                  className="w-full text-left text-muted-foreground hover:text-primary transition-all duration-200 ease-in-out py-3 px-3 rounded-lg hover:bg-accent/50 focus:outline-none focus:bg-accent/50 focus:text-primary group flex items-center justify-between"
                >
                  <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">
                    Tools
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isToolsOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link
                      to="/financial-freedom-calculator"
                      className="flex items-center text-muted-foreground hover:text-primary transition-all duration-200 ease-in-out py-2 px-3 rounded-lg hover:bg-accent/30 focus:outline-none focus:bg-accent/30 focus:text-primary group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">
                        Financial Freedom Calculator
                      </span>
                    </Link>
                  </div>
                )}
              </div>
              
              <Link
                to="/blog"
                className="text-left text-muted-foreground hover:text-primary transition-all duration-200 ease-in-out py-3 px-3 rounded-lg hover:bg-accent/50 focus:outline-none focus:bg-accent/50 focus:text-primary group"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">
                  Blog
                </span>
              </Link>

              <button
                onClick={() => handleMenuItemClick(() => scrollToSection('faq'))}
                className="text-left text-muted-foreground hover:text-primary transition-all duration-200 ease-in-out py-3 px-3 rounded-lg hover:bg-accent/50 focus:outline-none focus:bg-accent/50 focus:text-primary group"
              >
                <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">
                  FAQ
                </span>
              </button>
              
              {/* Theme toggle for smaller screens */}
              <div className="sm:hidden py-2 px-3">
                <ThemeToggle />
              </div>
              
              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-border/30">
                {user ? (
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg group">
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        Dashboard
                      </span>
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="block">
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground w-full transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg group"
                    >
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        Sign In
                      </span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
