import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { PAGE_SEO, SITE_URL } from "@/content/siteInfo";

/**
 * Title, description and canonical for the public pages while navigating in
 * the app (the pages edge function sets the same tags on first load). Blog
 * pages set their own tags; every other page at least gets a canonical
 * pointing at itself instead of the homepage.
 */
const RouteSeo = () => {
  const { pathname } = useLocation();
  if (pathname === "/blog" || pathname.startsWith("/blog/")) return null;

  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  const seo = PAGE_SEO[path];
  const canonical = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;

  return (
    <Helmet>
      {seo && <title>{seo.title}</title>}
      {seo && <meta name="description" content={seo.description} />}
      {seo && <meta property="og:title" content={seo.title} />}
      {seo && <meta property="og:description" content={seo.description} />}
      <meta property="og:url" content={canonical} />
      <link rel="canonical" href={canonical} />
    </Helmet>
  );
};

export default RouteSeo;
