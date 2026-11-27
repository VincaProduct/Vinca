import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, ExternalLink, Share2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { expertProfileUrl } from '@/lib/expertPanel';
import { LinkedInIcon } from '@/components/experts/VerifiedBadge';

const WhatsAppIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.49-8.41" />
  </svg>
);

/**
 * An Expert Panel member's public page link, ready to share: copy it, send it
 * on WhatsApp, post it on LinkedIn, or use the phone's own share menu.
 */
type Props = {
  authorId?: string | null;
  /** Pass the handle directly when the page already has it (skips the lookup) */
  handle?: string | null;
  name?: string;
  showEditLink?: boolean;
};

const ShareProfileCard = ({ authorId, handle: knownHandle, name, showEditLink = true }: Props) => {
  const [fetchedHandle, setHandle] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const handle = knownHandle ?? fetchedHandle;
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  useEffect(() => {
    if (knownHandle !== undefined || !authorId) return;
    supabase
      .from('authors')
      .select('handle')
      .eq('id', authorId)
      .maybeSingle()
      .then(({ data }) => {
        setHandle((data as { handle: string | null } | null)?.handle ?? null);
        setLoaded(true);
      });
  }, [authorId, knownHandle]);

  if (!handle) {
    if (!loaded || knownHandle !== undefined) return null;
    // No public page address yet: point them to their profile
    return (
      <Card>
        <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <UserRound className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Your public profile</p>
              <p className="text-sm text-muted-foreground">Photo, bio and the page you share on LinkedIn and your CV.</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard/my-profile">Edit my profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const url = expertProfileUrl(handle);
  const message = `My articles on Vinca Wealth, as a member of the Vinca Expert Panel: ${url}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = () =>
    navigator.share({ title: `${name || 'My'} on Vinca Wealth`, text: 'My articles on Vinca Wealth', url }).catch(() => undefined);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <UserRound className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-foreground">Share your public profile</p>
            <p className="text-sm text-muted-foreground">
              Your page with all your published articles. Add it to LinkedIn, your CV or send it to anyone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-sm text-foreground select-all">{url.replace('https://', '')}</span>
          <a href={url} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary" aria-label="Open your public profile">
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button type="button" onClick={copy} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy link'}
          </Button>
          <Button type="button" variant="outline" asChild className="gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener">
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp
            </a>
          </Button>
          <Button type="button" variant="outline" asChild className="gap-2">
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener">
              <LinkedInIcon className="h-4 w-4 text-[#0A66C2]" /> LinkedIn
            </a>
          </Button>
          {canNativeShare && (
            <Button type="button" variant="outline" onClick={nativeShare} className="gap-2">
              <Share2 className="h-4 w-4" /> More
            </Button>
          )}
        </div>

        {showEditLink && (
          <Link to="/dashboard/my-profile" className="inline-block text-sm font-medium text-primary hover:underline">
            Edit my profile (photo, bio, LinkedIn)
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default ShareProfileCard;
