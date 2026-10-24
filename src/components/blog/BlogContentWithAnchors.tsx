import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkUnderline } from "@/lib/remarkUnderline";
import { markdownElements } from "./markdownElements";
import { useCTAContent } from '@/components/cta/SimpleCTARenderer';
import type { TOCItem } from "./TOCEditor";
import type { CTAWithPlacement } from '@/types/cta';

interface BlogContentWithAnchorsProps {
  content: string;
  tocItems: TOCItem[];
  /** The article's CTAs (from getBlogPostCTAs or the server-rendered page) */
  ctas: CTAWithPlacement[];
  blogPostId: string;
}

export const BlogContentWithAnchors = ({
  content,
  tocItems,
  ctas,
  blogPostId,
}: BlogContentWithAnchorsProps) => {
  // Middle-of-article and inline-marker CTAs placed in the content
  const { markdown, ctaParagraph } = useCTAContent(content, ctas, blogPostId);

  // Generate anchor using the same algorithm as TOCEditor for consistency
  const generateAnchor = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  // Helper function to clean text from React children (handles bold, italic, etc.)
  const extractCleanText = (children: React.ReactNode): string => {
    if (typeof children === "string") return children;
    if (typeof children === "number") return String(children);
    if (Array.isArray(children)) {
      return children.map(extractCleanText).join("");
    }
    if (React.isValidElement(children)) {
      const element = children as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      if (element.props.children) {
        return extractCleanText(element.props.children);
      }
    }
    return String(children || "");
  };

  // Create a map of heading text to anchor IDs
  const headingMap = new Map<string, string>();
  tocItems.forEach((item) => {
    // Map the exact title and also the generated anchor version
    headingMap.set(item.title, item.anchor);
    headingMap.set(item.title.toLowerCase().trim(), item.anchor);
    headingMap.set(generateAnchor(item.title), item.anchor);
  });

  return (
    <div className="blog-content prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-24">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkUnderline]}
        components={{
          ...markdownElements,
          h1: ({ children, ...props }) => {
            const text = extractCleanText(children);
            const anchor =
              headingMap.get(text) ||
              headingMap.get(text.toLowerCase().trim()) ||
              headingMap.get(generateAnchor(text)) ||
              generateAnchor(text); // Fallback to auto-generated anchor
            return (
              <h1 id={anchor} {...props} className="scroll-mt-24">
                {children}
              </h1>
            );
          },
          h2: ({ children, ...props }) => {
            const text = extractCleanText(children);
            const anchor =
              headingMap.get(text) ||
              headingMap.get(text.toLowerCase().trim()) ||
              headingMap.get(generateAnchor(text)) ||
              generateAnchor(text); // Fallback to auto-generated anchor
            return (
              <h2 id={anchor} {...props} className="scroll-mt-24">
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = extractCleanText(children);
            const anchor =
              headingMap.get(text) ||
              headingMap.get(text.toLowerCase().trim()) ||
              headingMap.get(generateAnchor(text)) ||
              generateAnchor(text); // Fallback to auto-generated anchor
            return (
              <h3 id={anchor} {...props} className="scroll-mt-24">
                {children}
              </h3>
            );
          },
          // Add styling for better readability
          p: ({ children, ...props }) =>
            ctaParagraph(children, () => (
              <p className="leading-relaxed mb-4" {...props}>
                {children}
              </p>
            )),
          ul: ({ children, ...props }) => (
            <ul className="space-y-2 mb-4" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="space-y-2 mb-4" {...props}>
              {children}
            </ol>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-primary pl-4 my-6 italic bg-muted/30 py-2"
              {...props}
            >
              {children}
            </blockquote>
          ),
          pre: ({ children, ...props }) => (
            <pre
              className="bg-muted p-4 rounded-lg overflow-x-auto my-6"
              {...props}
            >
              {children}
            </pre>
          ),
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            return (
              <code
                className={`${
                  isInline
                    ? "bg-muted px-1.5 py-0.5 rounded text-sm"
                    : "text-sm"
                } ${className || ""}`}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};
