
import { MarkdownEditor } from './MarkdownEditor';

interface ContentFormProps {
  content: string;
  onContentChange: (content: string) => void;
}

export const ContentForm = ({ content, onContentChange }: ContentFormProps) => {
  return (
    <MarkdownEditor 
      content={content} 
      onContentChange={onContentChange}
    />
  );
};
