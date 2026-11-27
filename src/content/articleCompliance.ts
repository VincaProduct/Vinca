/**
 * The disclaimer shown at the end of every blog article, added automatically
 * (writers don't type it), plus small helpers for the author box. Used by the
 * app (BlogArticle) and the server-rendered article (edge function), so this
 * file must not use "@/" imports.
 */

export const ARTICLE_DISCLAIMER =
  "This article is for general information and education only. It is not investment, tax or legal advice, " +
  "or a recommendation to buy or sell any fund or security. Vinca Wealth (Vinca Investment Pvt Ltd) is an " +
  "AMFI-registered Mutual Fund Distributor, ARN-293401. Mutual fund investments are subject to market risks; " +
  "read all scheme-related documents carefully. Past performance does not guarantee future returns.";

/** Added for articles written by Expert Panel members */
export const EXPERT_VIEWS_NOTE = "Views expressed are the author's own and were reviewed by Vinca Wealth before publishing.";

/**
 * Remove a disclaimer the writer typed at the end of the article, so it isn't
 * shown twice. Only the last block is touched, and only if it starts with
 * "Disclaimer" (optionally bold/italic, optionally under a "Disclaimer" heading).
 */
export const stripTrailingDisclaimer = (markdown: string | null | undefined): string => {
  const text = (markdown || "").replace(/\s+$/, "");
  const blocks = text.split(/\n\s*\n/);
  const isDisclaimer = (b: string) => /^\s*(?:[*_]{1,3}\s*)?disclaimer\b/i.test(b);
  const isDisclaimerHeading = (b: string) => /^\s*#{1,6}\s*disclaimer\s*:?\s*$/i.test(b.trim());

  if (blocks.length > 1 && isDisclaimer(blocks[blocks.length - 1])) {
    blocks.pop();
  } else if (
    blocks.length > 2 &&
    isDisclaimerHeading(blocks[blocks.length - 2])
  ) {
    blocks.splice(blocks.length - 2, 2);
  } else {
    return text;
  }
  // A horizontal rule left just above the removed disclaimer
  while (blocks.length && /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(blocks[blocks.length - 1])) blocks.pop();
  return blocks.join("\n\n");
};

/** "Harsh Sharma" -> "HS" (for authors without a photo) */
export const authorInitials = (name: string | null | undefined): string =>
  (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "V";

export const isLinkedInUrl = (url: string | null | undefined) => !!url && /linkedin\.com\//i.test(url);

/** Public page listing all of an expert's articles */
export const expertPagePath = (handle: string | null | undefined) => (handle ? `/experts/${handle}` : null);
