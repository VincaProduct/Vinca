
import { Button } from '@/components/ui/button';
import { Save, Eye } from 'lucide-react';

interface PostFormActionsProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  saving: boolean;
}

export const PostFormActions = ({ onSaveDraft, onPublish, saving }: PostFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4">
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
        <Eye className="w-4 h-4 mr-2" />
        Publish
      </Button>
    </div>
  );
};
