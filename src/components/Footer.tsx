import { Facebook, Instagram, Youtube, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

const Footer = () => {
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <footer className="bg-accent/50 backdrop-blur-sm border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="">
                <img
                  src={logoSrc}
                  alt="Vinca Wealth"
                  className="h-12 w-42 object-contain transition-all duration-500 ease-in-out transform hover:scale-105"
                  style={{
                    filter: "brightness(1)",
                    transition:
                      "all 0.5s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s ease-in-out",
                  }}
                />
              </div>
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              Professional wealth management services. Building financial
              futures with confidence and expertise.
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📞 +91 7386809164</p>
              <p>✉️ support@vincawealth.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <button
                  onClick={() => scrollToSection("services")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Services
                </button>
              </li>
              <li>
                <a
                  href="/blog"
                  className="hover:text-primary transition-colors text-left block"
                >
                  Blog
                </a>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="hover:text-primary transition-colors text-left"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/people/Vinca-Wealth/100088393606551/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-background/50 hover:bg-background/80 rounded-lg transition-colors group"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform text-foreground" />
              </a>
              <a
                href="https://www.instagram.com/vincawealth/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-background/50 hover:bg-background/80 rounded-lg transition-colors group"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform text-foreground" />
              </a>
              <a
                href="https://www.youtube.com/@vincawealth9573"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-background/50 hover:bg-background/80 rounded-lg transition-colors group"
                aria-label="Subscribe to our YouTube channel"
              >
                <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform text-foreground" />
              </a>
              <a
                href="https://www.google.com/maps/place/Vinca+Wealth/@12.8379997,77.6958796,15z/data=!4m6!3m5!1s0x3bae6d5dd9903973:0xe6d8399cc5dc4fb2!8m2!3d12.8379997!4d77.6958796!16s%2Fg%2F11s7b6b4th"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-background/50 hover:bg-background/80 rounded-lg transition-colors group"
                aria-label="Find us on Google Maps"
              >
                <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform text-foreground" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col items-center">
            <div className="text-sm text-muted-foreground text-center">
              © 2025 Vinca Wealth. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
