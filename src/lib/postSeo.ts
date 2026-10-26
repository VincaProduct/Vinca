/**
 * Title and description rules for blog posts, shared by the app (BlogArticle)
 * and the blog edge function so both send the same tags. Keep it free of imports.
 */

const BRAND = "Vinca Wealth";

/** "<title> | Vinca Wealth", without repeating the brand if the title already has it */
export const postPageTitle = (title: string) => {
  const clean = (title || "").trim();
  return /vinca\s*wealth/i.test(clean) ? clean : `${clean} | ${BRAND}`;
};

/** Plain text of Markdown/HTML content, roughly as readers see it */
const plainText = (content: string) =>
  (content || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+.*$/gm, " ") // headings
    .replace(/^\s*\|.*\|\s*$/gm, " ") // table rows
    .replace(/\[\[CTA[^\]]*\]\]/g, " ")
    .replace(/[*_`>~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** About 155 characters, cut at a word */
const shorten = (text: string, max = 155) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length).replace(/[,;:.\s]+$/, "")}…`;
};

/**
 * The post's meta description, else its excerpt or subtitle, else the start of
 * the article itself, so no two posts share a generic description.
 */
export const postDescription = (post: {
  meta_description?: string | null;
  excerpt?: string | null;
  subtitle?: string | null;
  content?: string | null;
}) => {
  const own = (post.meta_description || post.excerpt || post.subtitle || "").trim();
  if (own) return own;
  const text = plainText(post.content || "");
  return text
    ? shorten(text)
    : "Research-driven insights on mutual funds, markets and retirement planning from Vinca Wealth.";
};
