
import { Button } from '@/components/ui/button';
import { Save, Eye, Send } from 'lucide-react';

interface PostFormActionsProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  onPreview: () => void;
  saving: boolean;
}

export const PostFormActions = ({ onSaveDraft, onPublish, onPreview, saving }: PostFormActionsProps) => {
  return (
    <div className="flex flex-wrap justify-end gap-3 sm:gap-4">
      <Button variant="outline" onClick={onPreview}>
        <Eye className="w-4 h-4 mr-2" />
        Preview
      </Button>
      <Button
        variant="outline"
        onClick={onSaveDraft}
        disabled={saving}
      >
        <Save className="w-4 h-4 mr-2" />
        Save as Draft
      </Button>
      <Button
        onClick={onPublish}
        disabled={saving}
      >
        <Send className="w-4 h-4 mr-2" />
        Publish
      </Button>
    </div>
  );
};
