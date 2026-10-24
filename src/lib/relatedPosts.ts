/**
 * Shared by the app (BlogArticle) and the blog edge function, so the related
 * articles are the same before and after the app loads.
 * Keep it free of imports.
 */

export interface RelatedCandidate {
  id: string;
  slug: string;
  title: string;
  category: string;
  published_at?: string | null;
  created_at?: string | null;
}

/** Newest posts in the same category first, then the newest of the rest */
export const pickRelatedPosts = <T extends RelatedCandidate>(current: { id: string; category: string }, posts: T[], count = 3): T[] => {
  const date = (p: T) => new Date(p.published_at || p.created_at || 0).getTime();
  const others = posts.filter((p) => p.id !== current.id).sort((a, b) => date(b) - date(a));
  return [
    ...others.filter((p) => p.category === current.category),
    ...others.filter((p) => p.category !== current.category),
  ].slice(0, count);
};
