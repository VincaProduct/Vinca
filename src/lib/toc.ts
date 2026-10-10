import type { TOCItem } from '@/components/blog/TOCEditor';

/** Same algorithm as the article renderer and the blog edge function */
export const generateAnchor = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

/** Heading text without Markdown/HTML formatting, as readers see it */
const headingText = (raw: string) =>
  raw
    .replace(/<[^>]+>/g, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\\(.)/g, '$1')
    .replace(/\s+#+\s*$/, '')
    .trim();

/**
 * Table of contents built from the post's H2 and H3 headings
 * (H2 = top level, H3 = nested), skipping anything inside code blocks.
 */
export const tocFromMarkdown = (markdown: string): TOCItem[] => {
  const items: TOCItem[] = [];
  let inFence = false;

  (markdown || '').split('\n').forEach((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) return;

    const title = headingText(match[2]);
    if (!title) return;
    items.push({
      id: `auto-${items.length + 1}`,
      title,
      level: match[1].length === 2 ? 1 : 2,
      anchor: generateAnchor(title),
    });
  });

  return items;
};

/** True when two TOCs list the same headings in the same order */
export const sameToc = (a: TOCItem[], b: TOCItem[]) =>
  a.length === b.length &&
  a.every((item, i) => item.title === b[i].title && item.level === b[i].level && item.anchor === b[i].anchor);
