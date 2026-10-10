import { useEffect, useRef, useState } from 'react';
import { useEditor, useEditorState, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  ImagePlus,
  Undo2,
  Redo2,
  Loader2,
  PenLine,
  FileCode,
} from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cleanPastedHtml, htmlToMarkdown, markdownToHtml } from '@/lib/blogContent';

interface RichTextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4';

// The post title is the page's only H1, so section headings start at H2
const blockTypes: { value: BlockType; label: string }[] = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
];

const ToolbarButton = ({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <Button
    type="button"
    variant={active ? 'secondary' : 'ghost'}
    size="sm"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    aria-pressed={active}
    className="h-8 w-8 p-0"
  >
    {children}
  </Button>
);

const Divider = () => <div className="mx-1 h-6 w-px bg-border" />;

const LinkButton = ({ editor, active }: { editor: Editor; active: boolean }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  const handleOpenChange = (next: boolean) => {
    if (next) setUrl(editor.getAttributes('link').href || '');
    setOpen(next);
  };

  const applyLink = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const href = /^(https?:|mailto:|tel:|\/|#)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const chain = editor.chain().focus();
    if (editor.state.selection.empty && !editor.isActive('link')) {
      chain.insertContent({ type: 'text', text: trimmed, marks: [{ type: 'link', attrs: { href } }] }).run();
    } else {
      chain.extendMarkRange('link').setLink({ href }).run();
    }
    setOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={active ? 'secondary' : 'ghost'}
          size="sm"
          title="Link"
          aria-label="Link"
          className="h-8 w-8 p-0"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            applyLink();
          }}
        >
          <label className="text-sm font-medium block">Link URL</label>
          <Input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <p className="text-xs text-muted-foreground">
            Select text first to turn it into a link, or leave nothing selected to insert the URL.
          </p>
          <div className="flex justify-end gap-2">
            {active && (
              <Button type="button" variant="outline" size="sm" onClick={removeLink}>
                Remove link
              </Button>
            )}
            <Button type="submit" size="sm" disabled={!url.trim()}>
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export const RichTextEditor = ({ content, onContentChange }: RichTextEditorProps) => {
  const [activeTab, setActiveTab] = useState('visual');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload();
  const uploadRef = useRef(uploadImage);
  uploadRef.current = uploadImage;
  // Markdown most recently emitted by the editor, so external changes can be told apart
  const lastMarkdown = useRef(content);
  const editorRef = useRef<Editor | null>(null);

  const insertImageFiles = async (editor: Editor, files: File[], pos?: number) => {
    for (const file of files) {
      const src = await uploadRef.current(file, 'content');
      if (!src) continue;
      const image = { type: 'image', attrs: { src, alt: file.name.replace(/\.[^.]+$/, '') } };
      if (pos !== undefined) {
        editor.chain().focus().insertContentAt(pos, image).run();
      } else {
        editor.chain().focus().insertContent(image).run();
      }
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Image,
      TableKit.configure({ table: { resizable: false } }),
    ],
    content: markdownToHtml(content),
    editorProps: {
      attributes: {
        class: 'blog-content min-h-[500px] px-4 py-3 focus:outline-none',
      },
      transformPastedHTML: cleanPastedHtml,
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files || []).filter((f) => f.type.startsWith('image/'));
        // Word also puts a picture of the copied text on the clipboard, so only
        // treat it as an image paste when there is no formatted text with it
        if (files.length === 0 || event.clipboardData?.getData('text/html')) return false;
        if (editorRef.current) insertImageFiles(editorRef.current, files);
        return true;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'));
        if (files.length === 0 || !editorRef.current) return false;
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        insertImageFiles(editorRef.current, files, pos);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = htmlToMarkdown(editor.getHTML());
      lastMarkdown.current = markdown;
      onContentChange(markdown);
    },
  });
  editorRef.current = editor;

  // Load content set from outside the editor (opening a saved post, Markdown tab)
  useEffect(() => {
    if (!editor || content === lastMarkdown.current) return;
    lastMarkdown.current = content;
    editor.commands.setContent(markdownToHtml(content), { emitUpdate: false });
  }, [content, editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      const level = [1, 2, 3, 4].find((l) => editor.isActive('heading', { level: l }));
      return {
        blockType: (level ? `h${level}` : 'paragraph') as BlockType,
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        link: editor.isActive('link'),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList'),
        blockquote: editor.isActive('blockquote'),
        table: editor.isActive('table'),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      };
    },
  });

  const setBlockType = (value: BlockType) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (value === 'paragraph') chain.setParagraph().run();
    else chain.setHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 | 4 }).run();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content *</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <PenLine className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="markdown" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Markdown
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="mt-4" forceMount hidden={activeTab !== 'visual'}>
            <div className="rounded-md border">
              {editor && state && (
                <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-card p-2 rounded-t-md">
                  <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!state.canUndo}>
                    <Undo2 className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!state.canRedo}>
                    <Redo2 className="h-4 w-4" />
                  </ToolbarButton>
                  <Divider />
                  <Select value={state.blockType} onValueChange={(v) => setBlockType(v as BlockType)}>
                    <SelectTrigger className="h-8 w-[130px]" aria-label="Text style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Older posts may still contain an H1: show it so it can be changed */}
                      {state.blockType === 'h1' && <SelectItem value="h1">Heading 1</SelectItem>}
                      {blockTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Divider />
                  <ToolbarButton title="Bold (Ctrl+B)" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Italic (Ctrl+I)" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Underline (Ctrl+U)" active={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                    <Underline className="h-4 w-4" />
                  </ToolbarButton>
                  <LinkButton editor={editor} active={state.link} />
                  <Divider />
                  <ToolbarButton title="Bullet list" active={state.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <List className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Numbered list" active={state.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    <ListOrdered className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Quote" active={state.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    <Quote className="h-4 w-4" />
                  </ToolbarButton>
                  <Divider />
                  <ToolbarButton
                    title="Insert table"
                    active={state.table}
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                  >
                    <TableIcon className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Upload image" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  </ToolbarButton>

                  {state.table && (
                    <div className="flex w-full flex-wrap gap-1 border-t pt-2 mt-1">
                      <span className="text-xs text-muted-foreground self-center mr-1">Table:</span>
                      {[
                        { label: '+ Row', run: () => editor.chain().focus().addRowAfter().run() },
                        { label: '+ Column', run: () => editor.chain().focus().addColumnAfter().run() },
                        { label: '− Row', run: () => editor.chain().focus().deleteRow().run() },
                        { label: '− Column', run: () => editor.chain().focus().deleteColumn().run() },
                        { label: 'Delete table', run: () => editor.chain().focus().deleteTable().run() },
                      ].map((action) => (
                        <Button
                          key={action.label}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={action.run}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <EditorContent editor={editor} />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                e.target.value = '';
                if (editor && files.length) insertImageFiles(editor, files);
              }}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Paste straight from Word or Google Docs: headings, bold, lists, links and tables keep their formatting.
              Images from Word don't copy over, so add them with the image button or drag them in.
            </p>
          </TabsContent>

          <TabsContent value="markdown" className="mt-4">
            <Textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={20}
              className="font-mono resize-y"
              placeholder="The post content as Markdown. Use this for inline CTA markers like [[CTA:name]]."
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
