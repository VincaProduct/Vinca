import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / non-secure pages: copy through a hidden text box
    const box = document.createElement('textarea');
    box.value = text;
    box.setAttribute('readonly', '');
    box.style.position = 'fixed';
    box.style.opacity = '0';
    document.body.appendChild(box);
    box.select();
    const ok = document.execCommand('copy');
    box.remove();
    return ok;
  }
};

/** Copies the article's public link so readers can paste it anywhere */
export const ShareButton = ({ url }: { url: string }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const share = async () => {
    if (await copyText(url)) {
      setCopied(true);
      toast({ title: 'Link copied', description: 'Paste it anywhere to share this article.' });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({ title: "Couldn't copy the link", description: url, variant: 'destructive' });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={share} aria-label="Copy link to this article">
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      <span className="ml-2">{copied ? 'Copied' : 'Share'}</span>
    </Button>
  );
};
