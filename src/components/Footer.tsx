import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

// Real links, so they work from every page and search engines can follow them.
// "/#..." links scroll to that part of the homepage.
const QUICK_LINKS = [
  { label: "Services", to: "/#services" },
  { label: "Financial Freedom Calculator", to: "/financial-freedom-calculator" },
  { label: "Real Worth Calculator", to: "/real-worth-calculator" },
  { label: "Events", to: "/events" },
  { label: "Blog", to: "/blog" },
  { label: "FAQ", to: "/#faq" },
];

const PHONE = "+91 73868 09164";
const EMAIL = "support@vincawealth.com";

const Footer = () => {
  const location = useLocation();
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

  // On the homepage, scroll smoothly instead of reloading; elsewhere the link
  // opens the homepage and the header scrolls to the section.
  const handleQuickLink = (event: React.MouseEvent, to: string) => {
    if (!to.startsWith("/#") || location.pathname !== "/") return;
    event.preventDefault();
    const element = document.getElementById(to.slice(2));
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
            <p className="text-muted-foreground max-w-md mb-4">
              Research-driven wealth management from Bengaluru. Building
              financial futures with confidence and expertise.
            </p>
            <div className="text-sm text-muted-foreground space-y-1 mb-6">
              <p>
                AMFI Registered Mutual Fund Distributor ·{" "}
                <span className="whitespace-nowrap">ARN-293401</span>
              </p>
              <p>CIN: U65999KA2022PTC169569</p>
              <p>Insurance POSP Code: 1726204591</p>
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer">
            <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={(event) => handleQuickLink(event, link.to)}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Follow us, then contact */}
          <div className="flex flex-col gap-8">
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

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="group inline-flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-transform group-hover:scale-105">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {PHONE}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${EMAIL}`} className="group inline-flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors break-all">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-transform group-hover:scale-105">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {EMAIL}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <a 
                href="/privacy-policy" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-2xl">
              Mutual fund investments are subject to market risks. Read all
              scheme related documents carefully.
            </p>
            <div className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Vinca Wealth. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
