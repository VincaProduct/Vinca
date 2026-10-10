import type { Components } from "react-markdown";

/**
 * Link, table and image renderers shared by every blog post body renderer, so
 * posts look the same with or without a table of contents.
 */
export const markdownElements: Components = {
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
  img: ({ node: _node, alt, ...props }) => (
    <img alt={alt || ""} loading="lazy" {...props} />
  ),
};
