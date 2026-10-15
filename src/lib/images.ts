const SUPABASE_STORAGE = 'https://xmmyjphoaqazwlifehxs.supabase.co/storage/';

// Netlify Image CDN only exists on the deployed site, not in `vite dev`
const imageCdnAvailable = import.meta.env.PROD;

const canOptimize = (src: string | null | undefined): src is string =>
  !!src && imageCdnAvailable && src.startsWith(SUPABASE_STORAGE);

/**
 * Resized WebP/AVIF version of an uploaded image through Netlify Image CDN.
 * Must match optimizedImage() in the blog edge function so server-rendered and
 * app-rendered pages request the same files.
 */
export const optimizedImage = (src: string | null | undefined, width: number): string => {
  if (!canOptimize(src)) return src || '';
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=75`;
};

export const imageSrcSet = (src: string | null | undefined, widths: number[]): string | undefined => {
  if (!canOptimize(src)) return undefined;
  return widths.map((w) => `${optimizedImage(src, w)} ${w}w`).join(', ');
};
