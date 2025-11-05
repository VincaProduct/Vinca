
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from './ImageUpload';

interface AuthorFormProps {
  formData: {
    author_name: string;
    author_title: string;
    author_bio: string;
    author_image: string;
  };
  onUpdate: (updates: Partial<AuthorFormProps['formData']>) => void;
  onAuthorImageUploaded: (url: string) => void;
  onAuthorImageRemoved: () => void;
}

export const AuthorForm = ({ 
  formData, 
  onUpdate, 
  onAuthorImageUploaded, 
  onAuthorImageRemoved 
}: AuthorFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Author Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Author Name</label>
            <Input
              value={formData.author_name}
              onChange={(e) => onUpdate({ author_name: e.target.value })}
              placeholder="Author name"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Author Title</label>
            <Input
              value={formData.author_title}
              onChange={(e) => onUpdate({ author_title: e.target.value })}
              placeholder="Senior Financial Analyst"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Author Bio</label>
          <Textarea
            value={formData.author_bio}
            onChange={(e) => onUpdate({ author_bio: e.target.value })}
            placeholder="Brief author biography"
            rows={3}
          />
        </div>

        <ImageUpload
          label="Author Image"
          folder="authors"
          currentImage={formData.author_image}
          onImageUploaded={onAuthorImageUploaded}
          onImageRemoved={onAuthorImageRemoved}
        />
      </CardContent>
    </Card>
  );
};
