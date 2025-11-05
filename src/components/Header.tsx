
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Logo from "@/components/navigation/Logo";
import DesktopNavigation from "@/components/navigation/DesktopNavigation";
import MobileNavigation from "@/components/navigation/MobileNavigation";

const Header = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash navigation on page load and hash changes
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.substring(1); // Remove the '#'
      if (hash && location.pathname === '/') {
        // Small delay to ensure page is rendered
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            const headerHeight = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    };

    // Handle on initial load
    handleHashNavigation();

    // Handle hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    return () => window.removeEventListener('hashchange', handleHashNavigation);
  }, [location.pathname]);

  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate to home first
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm' 
        : 'bg-background/98 backdrop-blur-sm border-b border-border'
    }`}>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <nav className={`flex items-center justify-between transition-all duration-300 ease-in-out ${
          isScrolled ? 'h-12 sm:h-14 lg:h-16' : 'h-14 sm:h-16 lg:h-18'
        }`}>
          <div className="flex items-center min-w-0 flex-shrink-0">
            <Logo />
          </div>
          <div className="flex items-center min-w-0">
            <DesktopNavigation scrollToSection={scrollToSection} />
            <MobileNavigation scrollToSection={scrollToSection} />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
