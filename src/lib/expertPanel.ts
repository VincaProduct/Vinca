// Expert Panel: shared types and labels (see supabase/migrations/20261126000000_expert_panel.sql)

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface PanelApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  linkedin_url: string | null;
  occupation: string;
  topics: string;
  sample_url: string | null;
  status: ApplicationStatus;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface PanelMembership {
  user_id: string;
  author_id: string | null;
  level: 'member' | 'associate' | 'senior';
  status: 'active' | 'paused';
  approved_at: string;
}

export interface MyArticle {
  id: string;
  title: string;
  slug: string;
  status: string | null;
  submitted_at: string | null;
  published_at: string | null;
  updated_at: string;
  total_views: number;
  views_30d: number;
}

/** Where a member's article stands, as the member sees it */
export type ArticleStage = 'draft' | 'in_review' | 'published' | 'archived';

export const articleStage = (a: { status: string | null; submitted_at: string | null }): ArticleStage => {
  if (a.status === 'published') return 'published';
  if (a.status === 'archived') return 'archived';
  return a.submitted_at ? 'in_review' : 'draft';
};

export const STAGE_LABEL: Record<ArticleStage, string> = {
  draft: 'Draft',
  in_review: 'In review',
  published: 'Published',
  archived: 'Archived',
};

export const STAGE_CLASS: Record<ArticleStage, string> = {
  draft: 'bg-muted text-muted-foreground',
  in_review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  archived: 'bg-muted text-muted-foreground',
};

export const LEVEL_LABEL: Record<PanelMembership['level'], string> = {
  member: 'Member',
  associate: 'Associate',
  senior: 'Senior Member',
};

/** Same categories as the Blog CMS */
export const ARTICLE_CATEGORIES = [
  'Retirement Planning',
  'Tax Planning',
  'Investment Strategies',
  'Market Analysis',
  'Estate Planning',
  'Financial Education',
  'Technology',
];

/** URL slug from a title, with a short suffix so two writers never clash */
export const articleSlug = (title: string) => {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
  return `${base || 'article'}-${Math.random().toString(36).slice(2, 6)}`;
};
