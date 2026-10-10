import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, ExternalLink, X } from 'lucide-react';
import { saveBlogPreview } from '@/lib/blogPreview';

interface BlogPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Record<string, unknown>;
}

/** Full-screen preview of the unsaved post, rendered by the real article page */
export const BlogPreviewDialog = ({ open, onOpenChange, post }: BlogPreviewDialogProps) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [frameKey, setFrameKey] = useState(0);
  const [saved, setSaved] = useState(true);

  // Hand over the latest version every time the preview is opened
  useEffect(() => {
    if (!open) return;
    setSaved(saveBlogPreview(post));
    setFrameKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const src = `/blog-preview?v=${frameKey}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-[100dvh] p-0 gap-0 flex flex-col sm:rounded-none border-0 [&>button]:hidden">
        <div className="flex flex-wrap items-center gap-2 border-b bg-card px-3 py-2">
          <div className="mr-auto">
            <DialogTitle className="text-base">Preview</DialogTitle>
            <DialogDescription className="text-xs">
              How the post will look once published. Close to keep editing.
            </DialogDescription>
          </div>
          <div className="flex rounded-md border p-0.5">
            <Button
              type="button"
              size="sm"
              variant={device === 'desktop' ? 'secondary' : 'ghost'}
              onClick={() => setDevice('desktop')}
              className="h-8"
            >
              <Monitor className="w-4 h-4 mr-1.5" />
              Desktop
            </Button>
            <Button
              type="button"
              size="sm"
              variant={device === 'mobile' ? 'secondary' : 'ghost'}
              onClick={() => setDevice('mobile')}
              className="h-8"
            >
              <Smartphone className="w-4 h-4 mr-1.5" />
              Mobile
            </Button>
          </div>
          <Button type="button" size="sm" variant="outline" asChild className="h-8">
            <a href={src} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1.5" />
              New tab
            </a>
          </Button>
          <Button type="button" size="sm" onClick={() => onOpenChange(false)} className="h-8">
            <X className="w-4 h-4 mr-1.5" />
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/40 flex justify-center">
          {saved ? (
            <iframe
              key={frameKey}
              src={src}
              title="Post preview"
              className={
                device === 'mobile'
                  ? 'h-full w-[390px] max-w-full border-x bg-background shadow-lg'
                  : 'h-full w-full bg-background'
              }
            />
          ) : (
            <p className="self-center text-sm text-muted-foreground px-6 text-center">
              The preview couldn't be opened because this browser blocks site storage.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
