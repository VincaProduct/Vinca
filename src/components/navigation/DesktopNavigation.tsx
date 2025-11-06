import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Calculator } from "lucide-react";

interface DesktopNavigationProps {
  scrollToSection: (sectionId: string) => void;
}

const DesktopNavigation = ({ scrollToSection }: DesktopNavigationProps) => {
  const { user } = useAuth();

  const handlePortfolioLoginClick = () => {
    window.open("https://portfolio.vincawealth.com/login?_gl=1*1c7uhfu*_gcl_au*MTg1NjAzODIzOC4xNzQ5Mjk4MTEy*_ga*MTg1NzI3NTc0MC4xNzQ5Mjk4MTEy*_ga_6MQBMGPXJJ*czE3NDkzNzE3MTkkbzIkZzAkdDE3NDkzNzE3MTkkajYwJGwwJGgw", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
      <nav className="flex items-center space-x-1 xl:space-x-2">
        <button
          onClick={() => scrollToSection('services')}
          className="relative px-3 py-2 text-muted-foreground hover:text-primary transition-all duration-300 ease-in-out text-sm xl:text-base whitespace-nowrap group focus:outline-none focus:text-primary rounded-md"
        >
          <span className="relative z-10">Services</span>
          <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out rounded-md" />
          <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary group-hover:w-4/5 group-focus:w-4/5 transition-all duration-300 ease-out transform -translate-x-1/2" />
        </button>

        <Link
          to="/achievers-club"
          className="relative px-3 py-2 text-muted-foreground hover:text-primary transition-all duration-300 ease-in-out text-sm xl:text-base whitespace-nowrap group focus:outline-none focus:text-primary rounded-md"
        >
          <span className="relative z-10">Achievers Club</span>
          <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out rounded-md" />
          <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary group-hover:w-4/5 group-focus:w-4/5 transition-all duration-300 ease-out transform -translate-x-1/2" />
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="relative px-3 py-2 text-muted-foreground hover:text-primary transition-all duration-300 ease-in-out text-sm xl:text-base whitespace-nowrap group focus:outline-none focus:text-primary rounded-md flex items-center">
            <span className="relative z-10">Tools</span>
            <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out rounded-md" />
            <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary group-hover:w-4/5 group-focus:w-4/5 transition-all duration-300 ease-out transform -translate-x-1/2" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background/95 backdrop-blur-md border border-border/50 shadow-lg">
            <DropdownMenuItem asChild>
              <Link to="/financial-freedom-calculator" className="flex items-center px-3 py-2 text-sm hover:bg-accent/50 cursor-pointer">
                <Calculator className="mr-2 h-4 w-4" />
                Financial Freedom Calculator
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          to="/blog"
          className="relative px-3 py-2 text-muted-foreground hover:text-primary transition-all duration-300 ease-in-out text-sm xl:text-base whitespace-nowrap group focus:outline-none focus:text-primary rounded-md"
        >
          <span className="relative z-10">Blog</span>
          <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out rounded-md" />
          <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary group-hover:w-4/5 group-focus:w-4/5 transition-all duration-300 ease-out transform -translate-x-1/2" />
        </Link>

        <button
          onClick={() => scrollToSection('faq')}
          className="relative px-3 py-2 text-muted-foreground hover:text-primary transition-all duration-300 ease-in-out text-sm xl:text-base whitespace-nowrap group focus:outline-none focus:text-primary rounded-md"
        >
          <span className="relative z-10">FAQ</span>
          <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out rounded-md" />
          <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary group-hover:w-4/5 group-focus:w-4/5 transition-all duration-300 ease-out transform -translate-x-1/2" />
        </button>
      </nav>

      <div className="flex items-center space-x-2 xl:space-x-3 ml-2 xl:ml-4 pl-2 xl:pl-4 border-l border-border/50">
        <div className="transition-transform duration-200 hover:scale-105">
          <ThemeToggle />
        </div>
        
        {user ? (
          <div className="flex items-center space-x-2 xl:space-x-3">
            <Link to="/dashboard" className="group">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm xl:text-base px-4 xl:px-6 h-9 xl:h-10 whitespace-nowrap transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg group-hover:shadow-primary/25">
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  Dashboard
                </span>
              </Button>
            </Link>
            
            <button onClick={handlePortfolioLoginClick} className="group">
              <Button 
                variant="outline" 
                className="text-sm xl:text-base px-4 xl:px-6 h-9 xl:h-10 whitespace-nowrap transition-all duration-300 ease-in-out hover:scale-105 hover:bg-accent/80 hover:border-primary/30 focus:scale-105 focus:bg-accent/80 focus:border-primary/30"
              >
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  Portfolio Login
                </span>
              </Button>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 xl:space-x-3">
            <Link to="/auth" className="group">
              <Button 
                variant="outline" 
                className="text-sm xl:text-base px-4 xl:px-6 h-9 xl:h-10 whitespace-nowrap transition-all duration-300 ease-in-out hover:scale-105 hover:bg-accent/80 hover:border-primary/30 focus:scale-105 focus:bg-accent/80 focus:border-primary/30"
              >
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  Sign In
                </span>
              </Button>
            </Link>
            
            <button onClick={handlePortfolioLoginClick} className="group">
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm xl:text-base px-4 xl:px-6 h-9 xl:h-10 whitespace-nowrap transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg hover:shadow-primary/25"
              >
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  Portfolio Login
                </span>
              </Button>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopNavigation;
