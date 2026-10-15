import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Circle, Search } from 'lucide-react';

export const SEO_TITLE_LIMIT = 60;
export const META_DESCRIPTION_LIMIT = 155;

interface SeoFieldsFormProps {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  /** Used when the SEO fields are left empty */
  title: string;
  excerpt: string;
  slug: string;
  content: string;
  onUpdate: (updates: { meta_title?: string; meta_description?: string; focus_keyword?: string }) => void;
}

const CharCount = ({ length, limit }: { length: number; limit: number }) => (
  <span className={`text-xs ${length > limit ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
    {length}/{limit}
    {length > limit && ' · too long, Google may cut it off'}
  </span>
);

const contains = (text: string, keyword: string) => text.toLowerCase().includes(keyword.toLowerCase());

export const SeoFieldsForm = ({
  metaTitle,
  metaDescription,
  focusKeyword,
  title,
  excerpt,
  slug,
  content,
  onUpdate,
}: SeoFieldsFormProps) => {
  const effectiveTitle = metaTitle.trim() || title.trim();
  const effectiveDescription = metaDescription.trim() || excerpt.trim();
  const keyword = focusKeyword.trim();

  // First paragraph of the body: the first block that isn't a heading, list, table or image
  const firstParagraph =
    content
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .find((block) => block && !/^(#|[-*+]\s|\d+\.\s|\||!\[|>)/.test(block)) || '';
  const checks = keyword
    ? [
        { label: 'In the SEO title', ok: contains(effectiveTitle, keyword) },
        { label: 'In the meta description', ok: contains(effectiveDescription, keyword) },
        { label: 'In the first paragraph', ok: contains(firstParagraph, keyword) },
        { label: 'In at least one Heading 2 or 3', ok: content.split('\n').some((l) => /^#{2,3}\s/.test(l) && contains(l, keyword)) },
        { label: 'In the URL slug', ok: contains(slug.replace(/-/g, ' '), keyword) || contains(slug, keyword.replace(/\s+/g, '-')) },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          SEO
        </CardTitle>
        <p className="text-sm text-muted-foreground">What Google and social media show for this post.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">SEO Title *</label>
            <CharCount length={effectiveTitle.length} limit={SEO_TITLE_LIMIT} />
          </div>
          <Input
            value={metaTitle}
            onChange={(e) => onUpdate({ meta_title: e.target.value })}
            placeholder={title ? `Uses the post title: ${title}` : 'Defaults to the post title'}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Meta Description *</label>
            <CharCount length={effectiveDescription.length} limit={META_DESCRIPTION_LIMIT} />
          </div>
          <Textarea
            value={metaDescription}
            onChange={(e) => onUpdate({ meta_description: e.target.value })}
            placeholder={excerpt ? `Uses the excerpt: ${excerpt}` : 'Defaults to the excerpt. One or two sentences that make people want to click.'}
            rows={3}
          />
          {!effectiveDescription && (
            <p className="text-xs text-destructive mt-1">Needed before publishing (or fill in the Excerpt).</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Focus Keyword</label>
          <Input
            value={focusKeyword}
            onChange={(e) => onUpdate({ focus_keyword: e.target.value })}
            placeholder="e.g. SIP calculator"
          />
          <p className="text-xs text-muted-foreground mt-1">Only for you: helps check the post. It isn't shown on the website.</p>
          {checks.length > 0 && (
            <ul className="mt-3 space-y-1">
              {checks.map((check) => (
                <li key={check.label} className="flex items-center gap-2 text-sm">
                  {check.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={check.ok ? '' : 'text-muted-foreground'}>{check.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* How the result may look in Google */}
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground mb-1">Google preview</p>
          <p className="text-xs text-muted-foreground truncate">vincawealth.com › blog › {slug || 'your-slug'}</p>
          <p className="text-blue-600 dark:text-blue-400 text-lg leading-snug truncate">
            {effectiveTitle || 'SEO title'} | Vinca Wealth Blog
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">{effectiveDescription || 'Meta description'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
