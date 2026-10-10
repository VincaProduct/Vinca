
import { RichTextEditor } from './RichTextEditor';

interface ContentFormProps {
  content: string;
  onContentChange: (content: string) => void;
}

export const ContentForm = ({ content, onContentChange }: ContentFormProps) => {
  return (
    <RichTextEditor
      content={content}
      onContentChange={onContentChange}
    />
  );
};
