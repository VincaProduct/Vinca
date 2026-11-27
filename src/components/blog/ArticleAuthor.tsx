import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import VerifiedBadge, { LinkedInIcon } from '@/components/experts/VerifiedBadge';
import { optimizedImage } from '@/lib/images';
import {
  ARTICLE_DISCLAIMER,
  EXPERT_VIEWS_NOTE,
  authorInitials,
  expertPagePath,
  isLinkedInUrl,
} from '@/content/articleCompliance';

export type ArticleAuthorInfo = {
  name: string;
  title?: string | null;
  bio?: string | null;
  image?: string | null;
  profileUrl?: string | null;
  handle?: string | null;
};

const Avatar = ({ author, size }: { author: ArticleAuthorInfo; size: 'sm' | 'lg' }) => {
  const box = size === 'sm' ? 'w-10 h-10 sm:w-12 sm:h-12 text-sm' : 'w-16 h-16 sm:w-20 sm:h-20 text-xl';
  return author.image ? (
    <img
      src={optimizedImage(author.image, size === 'sm' ? 96 : 160)}
      alt={author.name}
      className={`${box} rounded-full object-cover flex-shrink-0`}
    />
  ) : (
    <span aria-hidden="true" className={`${box} flex flex-shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary`}>
      {authorInitials(author.name)}
    </span>
  );
};

/** LinkedIn (or website) button and "View all articles", shared by both author boxes */
const AuthorLinks = ({ author }: { author: ArticleAuthorInfo }) => {
  const page = expertPagePath(author.handle);
  if (!author.profileUrl && !page) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      {author.profileUrl && (
        <a
          href={author.profileUrl}
          target="_blank"
          rel="author noopener"
          className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-primary"
          aria-label={isLinkedInUrl(author.profileUrl) ? `${author.name} on LinkedIn` : `${author.name}'s website`}
        >
          {isLinkedInUrl(author.profileUrl) ? (
            <>
              <LinkedInIcon className="h-4 w-4 text-[#0A66C2]" /> LinkedIn
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4" /> Website
            </>
          )}
        </a>
      )}
      {page && (
        <Link to={page} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          View all articles by {author.name.split(' ')[0]} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
};

/** The author line under the article image */
export const ArticleAuthorLine = ({ author }: { author: ArticleAuthorInfo }) => {
  const page = expertPagePath(author.handle);
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar author={author} size="sm" />
      <div className="min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-center gap-1.5 font-semibold text-sm sm:text-base">
          {page ? (
            <Link to={page} className="hover:text-primary">{author.name}</Link>
          ) : (
            <span>{author.name}</span>
          )}
          <VerifiedBadge compact />
        </div>
        {author.title && <div className="text-xs sm:text-sm text-muted-foreground">{author.title}</div>}
        <AuthorLinks author={author} />
      </div>
    </div>
  );
};

/** "About the author", after the FAQs */
export const ArticleAuthorAbout = ({ author }: { author: ArticleAuthorInfo }) => (
  <div className="mt-12 sm:mt-16 p-6 sm:p-8 bg-muted/30 rounded-lg">
    <h3 className="text-lg sm:text-xl font-display font-bold mb-4">About the Author</h3>
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
      <div className="mx-auto sm:mx-0">
        <Avatar author={author} size="lg" />
      </div>
      <div className="text-center sm:text-left space-y-2">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <h4 className="font-semibold text-base sm:text-lg">{author.name}</h4>
          <VerifiedBadge />
        </div>
        {author.title && <p className="text-sm text-muted-foreground">{author.title}</p>}
        {author.bio && <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{author.bio}</p>}
        <div className="flex justify-center sm:justify-start pt-1">
          <AuthorLinks author={author} />
        </div>
      </div>
    </div>
  </div>
);

/** Added automatically at the very end of every article */
export const ArticleDisclaimer = ({ expert }: { expert: boolean }) => (
  <aside aria-label="Disclaimer" className="mt-10 rounded-lg bg-muted/50 px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-[13px] leading-relaxed text-muted-foreground">
    <span className="font-semibold text-foreground/80">Disclaimer: </span>
    {expert && `${EXPERT_VIEWS_NOTE} `}
    {ARTICLE_DISCLAIMER}
  </aside>
);
