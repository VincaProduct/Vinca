import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CTAComponent } from './CTAComponent';
import { useCTAs } from '@/hooks/useCTAs';
import type { CTAWithPlacement } from '@/types/cta';

interface BlogCTARendererProps {
  blogPostId: string;
  category?: string;
  tags?: string[];
  position: 'top' | 'mid_article' | 'bottom' | 'sidebar';
  children?: React.ReactNode;
}

export const BlogCTARenderer: React.FC<BlogCTARendererProps> = ({
  blogPostId,
  category,
  tags,
  position,
  children
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
  }, [blogPostId, category, tags, position]); // Removed getBlogPostCTAs from dependencies

  if (loading) {
    return children ? <>{children}</> : null;
  }

  if (ctas.length === 0) {
    return children ? <>{children}</> : null;
  }

  return (
    <div className="space-y-4">
      {children}
      {ctas.map((cta) => (
        <CTAComponent
          key={cta.id}
          cta={cta}
          blogPostId={blogPostId}
        />
      ))}
    </div>
  );
};

interface BlogContentWithCTAsProps {
  content: string;
  blogPostId: string;
  category?: string;
  tags?: string[];
}

export const BlogContentWithCTAs: React.FC<BlogContentWithCTAsProps> = ({
  content,
  blogPostId,
  category,
  tags
}) => {
  const { getBlogPostCTAs } = useCTAs();
  const [ctas, setCTAs] = useState<CTAWithPlacement[]>([]);
  const [processedContent, setProcessedContent] = useState<string>('');

  useEffect(() => {
    const processContent = async () => {
      try {
        const fetchedCTAs = await getBlogPostCTAs(blogPostId, category, tags);
        
        // This component is deprecated - use SimpleCTARenderer instead
        setCTAs(fetchedCTAs);
        setProcessedContent(content);
      } catch (error) {
        console.error('Error processing CTAs:', error);
        setProcessedContent(content);
      }
    };

    processContent();
  }, [content, blogPostId, category, tags]);

  // Custom components for ReactMarkdown
  const components = {
    p: ({ children, ...props }: any) => {
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