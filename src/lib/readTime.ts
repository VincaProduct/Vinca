/** Average adult reading speed for online articles */
const WORDS_PER_MINUTE = 200;

/** Words a reader actually sees in a Markdown post (no syntax, links or image URLs) */
export const countWords = (markdown: string) =>
  (markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[\[CTA:[^\]]+\]\]/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~|-]+/g, ' ')
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;

/** "6 min read" for the given post body (at least 1 minute) */
export const estimateReadTime = (markdown: string) =>
  `${Math.max(1, Math.round(countWords(markdown) / WORDS_PER_MINUTE))} min read`;
