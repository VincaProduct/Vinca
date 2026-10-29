import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkUnderline } from '@/lib/remarkUnderline';
import { markdownElements } from '@/components/blog/markdownElements';
import { SimpleCTAComponent } from './SimpleCTAComponent';
import { CTA_SLOT_PATTERN, placeCtasInMarkdown, type PlacedCta } from '@/lib/ctas';
import type { CTAWithPlacement } from '@/types/cta';

interface SimpleCTARendererProps {
  /** The article's CTAs (from getBlogPostCTAs or the server-rendered page) */
  ctas: CTAWithPlacement[];
  blogPostId: string;
  position: 'top' | 'bottom' | 'below_toc';
}

/** The article's CTAs for one position (top, bottom or under the table of contents) */
export const SimpleCTARenderer: React.FC<SimpleCTARendererProps> = ({ ctas, blogPostId, position }) => {
  const positionCTAs = ctas.filter(cta => cta.placement_position === position);
  if (positionCTAs.length === 0) return null;

  return (
    <div className="space-y-8">
      {positionCTAs.map((cta) => (
        <SimpleCTAComponent key={`${cta.id}-${position}`} cta={cta} blogPostId={blogPostId} />
      ))}
    </div>
  );
};

/**
 * Article Markdown with the middle-of-article and inline-marker CTAs placed in
 * it. Returns the Markdown to render and a paragraph renderer that turns the
 * CTA markers into CTAs.
 */
export const useCTAContent = (content: string, ctas: CTAWithPlacement[], blogPostId: string) => {
  const { markdown, slots } = React.useMemo(
    () => placeCtasInMarkdown(content, ctas as unknown as PlacedCta[]),
    [content, ctas],
  );

  /** Use as the Markdown `p` renderer: a CTA marker becomes the CTA, anything else goes to `render` */
  const ctaParagraph = (children: React.ReactNode, render: () => React.ReactNode) => {
    const match = React.Children.toArray(children).join('').match(CTA_SLOT_PATTERN);
    if (!match) return render();
    const cta = slots[Number(match[1])];
    return cta ? (
      <div className="my-8 not-prose">
        <SimpleCTAComponent cta={cta as unknown as CTAWithPlacement} blogPostId={blogPostId} />
      </div>
    ) : null;
  };

  return { markdown, ctaParagraph };
};

interface BlogContentWithInlineCTAsProps {
  content: string;
  ctas: CTAWithPlacement[];
  blogPostId: string;
}

/** Article content (no table of contents) with its in-content CTAs */
export const BlogContentWithInlineCTAs: React.FC<BlogContentWithInlineCTAsProps> = ({ content, ctas, blogPostId }) => {
  const { markdown, ctaParagraph } = useCTAContent(content, ctas, blogPostId);

  const components = {
    ...markdownElements,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p: ({ children, ...props }: any) => ctaParagraph(children, () => <p {...props}>{children}</p>),
  };

  return (
    <div className="blog-content prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkUnderline]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};
