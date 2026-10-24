import { supabase } from '@/integrations/supabase/client';
import { tocFromMarkdown } from '@/lib/toc';
import { countWords } from '@/lib/readTime';
import { cleanFaqs } from '@/lib/faqs';

const SITE_URL = 'https://vincawealth.com';

const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

/** The article's main section headings: its H2s, or its H3s/H1s when it has no H2s */
const sectionHeadings = (content: string) => {
  const toc = tocFromMarkdown(content);
  const h2s = toc.filter((h) => h.level === 1); // the TOC lists H2s as level 1
  if (h2s.length > 0) return h2s.map((h) => h.title);
  if (toc.length > 0) return toc.map((h) => h.title);
  return [...content.matchAll(/^# (.+)$/gm)].map((m) => m[1].replace(/[*_`]/g, '').trim());
};

/** One CSV cell: quoted, with quotes doubled (line breaks stay inside the cell in Excel) */
const cell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

/**
 * Download every blog post (all statuses) as a CSV file that opens in Excel,
 * with what's needed to spot overlapping articles: keyword, SEO fields,
 * section headings, takeaways and FAQ questions.
 */
export const exportBlogPostsToExcel = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, author:authors(name)')
    .order('published_at', { ascending: false, nullsFirst: false });
  if (error) throw error;

  const columns: [string, (post: (typeof data)[number]) => unknown][] = [
    ['Title', (p) => p.title],
    ['Link', (p) => `${SITE_URL}/blog/${p.slug}`],
    ['Status', (p) => p.status],
    ['Category', (p) => p.category],
    ['Focus keyword', (p) => p.focus_keyword],
    ['SEO title', (p) => p.meta_title],
    ['Meta description', (p) => p.meta_description],
    ['Excerpt', (p) => p.excerpt],
    // The article's main sections, the quickest way to see what it covers
    ['Section headings', (p) => sectionHeadings(p.content || '').join('\n')],
    ['Key takeaways', (p) => (p.key_takeaways || []).join('\n')],
    ['FAQ questions', (p) => cleanFaqs(p.faqs).map((f) => f.question).join('\n')],
    ['Word count', (p) => countWords(p.content || '')],
    ['Read time', (p) => p.read_time],
    ['Author', (p) => (p.author as { name?: string } | null)?.name || p.author_name],
    ['Published', (p) => formatDate(p.published_at)],
    ['Last updated', (p) => formatDate(p.updated_at)],
  ];

  const rows = [
    columns.map(([name]) => cell(name)).join(','),
    ...(data || []).map((post) => columns.map(([, get]) => cell(get(post))).join(',')),
  ];

  // The byte-order mark makes Excel read ₹ and other characters correctly
  const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vinca-blog-articles-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return data?.length ?? 0;
};
