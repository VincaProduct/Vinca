
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from './ImageUpload';

interface PostDetailsFormProps {
  formData: {
    title: string;
    subtitle: string;
    slug: string;
    category: string;
    read_time: string;
    featured_image: string;
    excerpt: string;
  };
  onUpdate: (updates: Partial<PostDetailsFormProps['formData']>) => void;
  onFeaturedImageUploaded: (url: string) => void;
  onFeaturedImageRemoved: () => void;
}

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
