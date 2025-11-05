import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SimpleCTAComponent } from '@/components/cta/SimpleCTAComponent';
import { useCTAs } from '@/hooks/useCTAs';
import type { TOCItem } from "./TOCEditor";
import type { CTAWithPlacement } from '@/types/cta';

interface BlogContentWithAnchorsProps {
  content: string;
  tocItems: TOCItem[];
  blogPostId: string;
  category?: string;
  tags?: string[];
}

export const BlogContentWithAnchors = ({
  content,
  tocItems,
  blogPostId,
  category,
  tags,
}: BlogContentWithAnchorsProps) => {
  const { getBlogPostCTAs } = useCTAs();
  const [inlineCTAs, setInlineCTAs] = useState<CTAWithPlacement[]>([]);
  const [processedContent, setProcessedContent] = useState<string>('');

  useEffect(() => {
    const fetchAndProcessCTAs = async () => {
      try {
        const fetchedCTAs = await getBlogPostCTAs(blogPostId, category, tags);
        
        // Filter CTAs for inline markers and middle article
        const inlineMarkerCTAs = fetchedCTAs.filter(cta => {
          // placement_position is a single value from the database
          return cta.placement_position === 'inline_marker' || cta.placement_position === 'middle_article';
        });
        setInlineCTAs(inlineMarkerCTAs);

        // Process content to replace CTA markers
        let processed = content;
        
        // Process middle article placement first
        const middleArticleCTAs = fetchedCTAs.filter(cta => {
          return cta.placement_position === 'middle_article';
        });
        middleArticleCTAs.forEach((cta, ctaIndex) => {
          // Find all H2 headers in the content
          const h2Matches = [...processed.matchAll(/^## (.+)$/gm)];
          
          if (h2Matches.length >= 2) {
            // Calculate middle position (e.g., for 10 headers, place at 6th header)
            const middleIndex = Math.ceil(h2Matches.length / 2);
            const targetHeader = h2Matches[middleIndex - 1];
            
            if (targetHeader && targetHeader.index !== undefined) {
              // Insert CTA before the middle H2 header
              const beforeHeader = processed.substring(0, targetHeader.index);
              const afterHeader = processed.substring(targetHeader.index);
              
              processed = beforeHeader + 
                `\n\n<CTA_PLACEHOLDER_MIDDLE_${ctaIndex}/>\n\n` + 
                afterHeader;
            }
          }
        });
        
        // Process inline markers
        const ctaMarkerRegex = /\[\[CTA:([^\]]+)\]\]/g;
        const matches = [...processed.matchAll(ctaMarkerRegex)];
        
        matches.forEach((match, index) => {
          const markerName = match[1];
          const fullMatch = match[0];
          
          // Find matching CTA or use the first available inline CTA
          const availableInlineCTAs = fetchedCTAs.filter(cta => {
            return cta.placement_position === 'inline_marker';
          });
          let matchingCTA = availableInlineCTAs.find(cta => 
            cta.position_config?.marker_name === markerName
          );
          
          if (!matchingCTA && availableInlineCTAs.length > 0) {
            // Use the first available CTA if no specific match found
            matchingCTA = availableInlineCTAs[0];
          }
          
          if (matchingCTA) {
            // Replace with a placeholder that will be rendered by ReactMarkdown
            const placeholder = `<CTA_PLACEHOLDER_INLINE_${index}/>`;
            processed = processed.replace(fullMatch, placeholder);
          }
        });
        
        setProcessedContent(processed);
      } catch (error) {
        console.error('Error processing inline CTAs:', error);
        setProcessedContent(content);
      }
    };

    fetchAndProcessCTAs();
  }, [content, blogPostId, category, tags]);

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
    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-24">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
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
          p: ({ children, ...props }) => {
            const childText = React.Children.toArray(children).join('');
            
            // Handle middle article CTA placeholders
            const middlePlaceholderMatch = childText.match(/^<CTA_PLACEHOLDER_MIDDLE_(\d+)\/>$/);
            if (middlePlaceholderMatch) {
              const index = parseInt(middlePlaceholderMatch[1]);
              const middleArticleCTAs = inlineCTAs.filter(cta => {
                return cta.placement_position === 'middle_article';
              });
              const cta = middleArticleCTAs[index];
              
              if (cta) {
                return (
                  <div className="my-8 not-prose">
                    <SimpleCTAComponent cta={cta} blogPostId={blogPostId} />
                  </div>
                );
              }
              return null;
            }
            
            // Handle inline marker CTA placeholders
            const inlinePlaceholderMatch = childText.match(/^<CTA_PLACEHOLDER_INLINE_(\d+)\/>$/);
            if (inlinePlaceholderMatch) {
              const index = parseInt(inlinePlaceholderMatch[1]);
              const inlineMarkerCTAs = inlineCTAs.filter(cta => {
                return cta.placement_position === 'inline_marker';
              });
              const cta = inlineMarkerCTAs[index] || inlineMarkerCTAs[0];
              
              if (cta) {
                return (
                  <div className="my-8 not-prose">
                    <SimpleCTAComponent cta={cta} blogPostId={blogPostId} />
                  </div>
                );
              }
              return null;
            }
            
            return (
              <p className="leading-relaxed mb-4" {...props}>
                {children}
              </p>
            );
          },
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
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
