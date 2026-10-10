
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from './ImageUpload';

interface PostDetailsFormProps {
  formData: {
    title: string;
    subtitle: string;
    quote: string;
    slug: string;
    category: string;
    read_time: string;
    featured_image: string;
    excerpt: string;
    tags: string[];
  };
  onUpdate: (updates: Partial<PostDetailsFormProps['formData']>) => void;
  onFeaturedImageUploaded: (url: string) => void;
  onFeaturedImageRemoved: () => void;
}

/** "SIP, mutual funds , sip" -> ["SIP", "mutual funds"] (trimmed, no duplicates) */
const parseTags = (text: string) => {
  const seen = new Set<string>();
  return text
    .split(',')
    .map((tag) => tag.trim().replace(/\s+/g, ' '))
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (!tag || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const categories = [
  'Technology',
  'Retirement Planning',
  'Tax Planning',
  'Investment Strategies',
  'Market Analysis',
  'Estate Planning',
  'Financial Education',
];

export const PostDetailsForm = ({ 
  formData, 
  onUpdate, 
  onFeaturedImageUploaded, 
  onFeaturedImageRemoved 
}: PostDetailsFormProps) => {
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Typed text is kept as-is while editing and turned into tags as you go
  const [tagsText, setTagsText] = useState(formData.tags.join(', '));
  useEffect(() => {
    // Opening a saved post fills the tags in after the form has mounted
    if (parseTags(tagsText).join('|') !== formData.tags.join('|')) setTagsText(formData.tags.join(', '));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.tags]);

  const handleTitleChange = (title: string) => {
    onUpdate({
      title,
      slug: formData.slug || generateSlug(title),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Title *</label>
          <Input
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter post title"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Subtitle</label>
          <Input
            value={formData.subtitle}
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            placeholder="Optional subtitle"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Quote</label>
          <Textarea
            value={formData.quote}
            onChange={(e) => onUpdate({ quote: e.target.value })}
            placeholder="Optional inspirational quote shown at the top of the article"
            rows={2}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Slug *</label>
          <Input
            value={formData.slug}
            onChange={(e) => onUpdate({ slug: e.target.value })}
            placeholder="url-friendly-slug"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Category *</label>
            <Select
              value={formData.category}
              onValueChange={(value) => onUpdate({ category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Read Time</label>
            <Input
              value={formData.read_time}
              onChange={(e) => onUpdate({ read_time: e.target.value })}
              placeholder="5 min read"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tags</label>
          <Input
            value={tagsText}
            onChange={(e) => {
              setTagsText(e.target.value);
              onUpdate({ tags: parseTags(e.target.value) });
            }}
            onBlur={() => setTagsText(formData.tags.join(', '))}
            placeholder="e.g. SIP, mutual funds, retirement planning"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate tags with commas. Use the topics and phrases readers search for.
          </p>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        <ImageUpload
          label="Featured Image"
          folder="featured"
          currentImage={formData.featured_image}
          onImageUploaded={onFeaturedImageUploaded}
          onImageRemoved={onFeaturedImageRemoved}
        />

        <div>
          <label className="text-sm font-medium mb-2 block">Excerpt</label>
          <Textarea
            value={formData.excerpt}
            onChange={(e) => onUpdate({ excerpt: e.target.value })}
            placeholder="Brief description of the post"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
