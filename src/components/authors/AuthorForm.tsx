import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { ImageUpload } from '../blog/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { useAuthors } from '@/hooks/useAuthors';
import type { Tables } from '@/integrations/supabase/types';

type Author = Tables<'authors'>;

interface AuthorFormProps {
  author?: Author | null;
  onClose: () => void;
}

export const AuthorForm = ({ author, onClose }: AuthorFormProps) => {
  const [formData, setFormData] = useState({
    name: author?.name || '',
    title: author?.title || '',
    bio: author?.bio || '',
    image: author?.image || '',
  });
  const [saving, setSaving] = useState(false);
  
  const { createAuthor, updateAuthor } = useAuthors();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Author name is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (author) {
        await updateAuthor(author.id, formData);
        toast({
          title: 'Success',
          description: 'Author updated successfully',
        });
      } else {
        await createAuthor(formData);
        toast({
          title: 'Success',
          description: 'Author created successfully',
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save author',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUploaded = (url: string) => {
    setFormData({ ...formData, image: url });
  };

  const handleImageRemoved = () => {
    setFormData({ ...formData, image: '' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-semibold text-foreground">
          {author ? 'Edit Author' : 'Create New Author'}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Author Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Author Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter author name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Author Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Senior Financial Analyst"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Author Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief author biography"
                rows={4}
              />
            </div>

            <ImageUpload
              label="Author Image"
              folder="authors"
              currentImage={formData.image}
              onImageUploaded={handleImageUploaded}
              onImageRemoved={handleImageRemoved}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Author'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};