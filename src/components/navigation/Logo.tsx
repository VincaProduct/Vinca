import { Link } from "react-router-dom";

// Light and dark versions; CSS shows the one matching the page's theme, so
// the logo can never be out of step with the background
const LIGHT_LOGO = "/images/black-logo-Photoroom.png";
const DARK_LOGO = "/lovable-uploads/85ed6dc8-bea0-4bcf-bda4-506f3f06325a.png";

const Logo = () => {
  const imageClass =
    "h-12 object-contain transition-transform duration-500 ease-in-out group-hover:drop-shadow-lg transform group-hover:scale-105";

  return (
    <Link
      to="/"
      className="flex items-center space-x-2 min-w-0 flex-shrink-0 group transition-all duration-300 ease-in-out hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-lg p-1 -m-1"
    >
      <div className="relative">
        <img
          src={LIGHT_LOGO}
          alt="Vinca Wealth - Financial planning and wealth management"
          className={`${imageClass} w-42 dark:hidden`}
          loading="eager"
        />
        <img
          src={DARK_LOGO}
          alt="Vinca Wealth - Financial planning and wealth management"
          className={`${imageClass} w-44 mr-2 hidden dark:block`}
          loading="eager"
        />
      </div>
      <div className="absolute inset-0 bg-primary/10 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-300 ease-out -z-10" />
    </Link>
  );
};

export default Logo;
