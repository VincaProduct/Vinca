import type { Components } from "react-markdown";
import { optimizedImage, imageSrcSet } from "@/lib/images";

/**
 * Link, table and image renderers shared by every blog post body renderer, so
 * posts look the same with or without a table of contents.
 */
export const markdownElements: Components = {
  // The page title is the only H1; H1s inside an article are section headings
  h1: ({ node: _node, ...props }) => <h2 {...props} />,
  a: ({ href, children, node: _node, ...props }) => {
    const isExternal = /^https?:\/\//i.test(href || "");
    return (
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  table: ({ children, node: _node, ...props }) => (
    <div className="my-6 w-full overflow-x-auto">
      <table {...props}>{children}</table>
    </div>
  ),
  img: ({ node: _node, alt, src, ...props }) => (
    <img
      {...props}
      src={optimizedImage(src, 960)}
      srcSet={imageSrcSet(src, [640, 960, 1280])}
      sizes="(min-width: 1024px) 800px, 100vw"
      alt={alt || ""}
      loading="lazy"
      decoding="async"
    />
  ),
};
