import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SimpleCTAComponent } from './SimpleCTAComponent';
import { useCTAs } from '@/hooks/useCTAs';
import type { CTAWithPlacement } from '@/types/cta';

interface SimpleCTARendererProps {
  blogPostId: string;
  category?: string;
  tags?: string[];
  position: 'top' | 'bottom' | 'below_toc';
}

export const SimpleCTARenderer: React.FC<SimpleCTARendererProps> = ({
  blogPostId,
  category,
  tags,
  position
}) => {
  const { getBlogPostCTAs } = useCTAs();
  const [ctas, setCTAs] = useState<CTAWithPlacement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCTAs = async () => {
      try {
        setLoading(true);
        const fetchedCTAs = await getBlogPostCTAs(blogPostId, category, tags);
        
        // Filter CTAs by position
        const positionCTAs = fetchedCTAs.filter(cta => cta.placement_position === position);
        setCTAs(positionCTAs);
      } catch (error) {
        console.error('Error fetching CTAs:', error);
        setCTAs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCTAs();
  }, [blogPostId, category, tags, position]);

  if (loading || ctas.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {ctas.map((cta) => (
        <SimpleCTAComponent
          key={cta.id}
          cta={cta}
          blogPostId={blogPostId}
        />
      ))}
    </div>
  );
};

interface BlogContentWithInlineCTAsProps {
  content: string;
  blogPostId: string;
  category?: string;
  tags?: string[];
}

export const BlogContentWithInlineCTAs: React.FC<BlogContentWithInlineCTAsProps> = ({
  content,
  blogPostId,
  category,
  tags
}) => {
  const { getBlogPostCTAs } = useCTAs();
  const [inlineCTAs, setInlineCTAs] = useState<CTAWithPlacement[]>([]);
  const [processedContent, setProcessedContent] = useState<string>('');

  useEffect(() => {
    const fetchAndProcessCTAs = async () => {
      try {
        const fetchedCTAs = await getBlogPostCTAs(blogPostId, category, tags);
        
        // Filter CTAs for inline markers
        const inlineMarkerCTAs = fetchedCTAs.filter(cta => cta.placement_position === 'inline_marker');
        setInlineCTAs(inlineMarkerCTAs);

        // Process content to replace CTA markers
        let processed = content;
        
        // Find all CTA markers in the format [[CTA:marker-name]]
        const ctaMarkerRegex = /\[\[CTA:([^\]]+)\]\]/g;
        const matches = [...content.matchAll(ctaMarkerRegex)];
        
        matches.forEach((match, index) => {
          const markerName = match[1];
          const fullMatch = match[0];
          
          // Find matching CTA or use the first available inline CTA
          let matchingCTA = inlineMarkerCTAs.find(cta => 
            cta.position_config?.marker_name === markerName
          );
          
          if (!matchingCTA && inlineMarkerCTAs.length > 0) {
            // Use the first available CTA if no specific match found
            matchingCTA = inlineMarkerCTAs[0];
          }
          
          if (matchingCTA) {
            // Replace with a placeholder that will be rendered by ReactMarkdown
            const placeholder = `<CTA_PLACEHOLDER_${index}/>`;
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

  // Custom renderer for CTA placeholders
  const components = {
    p: ({ children, ...props }: any) => {
      const childText = React.Children.toArray(children).join('');
      const ctaPlaceholderMatch = childText.match(/^<CTA_PLACEHOLDER_(\d+)\/>$/);
      
      if (ctaPlaceholderMatch) {
        const index = parseInt(ctaPlaceholderMatch[1]);
        const cta = inlineCTAs[index] || inlineCTAs[0];
        
        if (cta) {
          return (
            <div className="my-8 not-prose">
              <SimpleCTAComponent cta={cta} blogPostId={blogPostId} />
            </div>
          );
        }
        return null;
      }
      
      return <p {...props}>{children}</p>;
    },
  };

  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};