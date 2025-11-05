import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Logo = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };

    // Check theme on mount
    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const logoSrc = isDark
    ? "/lovable-uploads/85ed6dc8-bea0-4bcf-bda4-506f3f06325a.png"
    : "/images/black-logo-Photoroom.png";

  return (
    <Link
      to="/"
      className="flex items-center space-x-2 min-w-0 flex-shrink-0 group transition-all duration-300 ease-in-out hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-lg p-1 -m-1"
    >
      <div className="relative">
        <img
          src={logoSrc}
          alt="Vinca Wealth - Financial planning and wealth management"
          className={`h-12 ${
            isDark ? "w-44 mr-2" : "w-42"
          } object-contain transition-all duration-500 ease-in-out group-hover:drop-shadow-lg transform group-hover:scale-105`}
          loading="eager"
          style={{
            filter: "brightness(1)",
            transition:
              "all 0.5s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s ease-in-out",
          }}
        />
      </div>
      <div className="absolute inset-0 bg-primary/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300 ease-out -z-10" />
    </Link>
  );
};

export default Logo;
