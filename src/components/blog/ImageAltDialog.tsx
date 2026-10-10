import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageAltDialogProps {
  open: boolean;
  initialAlt: string;
  previewSrc?: string;
  onSave: (alt: string) => void;
  onCancel: () => void;
}

/** Asks for an image's alt text (what Google and screen readers use) */
export const ImageAltDialog = ({ open, initialAlt, previewSrc, onSave, onCancel }: ImageAltDialogProps) => {
  const [alt, setAlt] = useState(initialAlt);

  useEffect(() => {
    if (open) setAlt(initialAlt);
  }, [open, initialAlt]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Describe this image</DialogTitle>
          <DialogDescription>
            A short description of what the image shows. Google uses it to understand the image, and screen readers read
            it aloud.
          </DialogDescription>
        </DialogHeader>
        {previewSrc && <img src={previewSrc} alt="" className="max-h-40 w-full rounded-md object-contain bg-muted" />}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(alt.trim());
          }}
          className="space-y-4"
        >
          <Input
            autoFocus
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="e.g. Nifty 50 P/E ratio from 2016 to 2026"
            maxLength={150}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Skip
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
