import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calculator, Instagram, Scale } from 'lucide-react';
import { HOME_GUIDES } from '@/content/homeGuides';

const TOOL_ICONS = [Calculator, Scale];

/** Homepage: links to the free calculators, top retirement guides and Instagram */
const HomeGuides = () => (
  <section className="border-t border-border bg-background px-4 py-14 sm:px-6 lg:px-16 lg:py-20">
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-text)' }}>{HOME_GUIDES.label}</p>
      <h2 className="mt-2 text-3xl font-bold leading-tight text-foreground sm:text-4xl" style={{ textWrap: 'balance' } as React.CSSProperties}>
        {HOME_GUIDES.heading}
      </h2>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">{HOME_GUIDES.text}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
        {/* Calculators and Instagram */}
        <div className="flex min-w-0 flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">{HOME_GUIDES.toolsLabel}</h3>
          {HOME_GUIDES.tools.map((tool, i) => {
            const Icon = TOOL_ICONS[i] ?? Calculator;
            return (
              <Link key={tool.href} to={tool.href}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/40">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground">{tool.title}</span>
                  <span className="block text-sm text-muted-foreground">{tool.line}</span>
                </span>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            );
          })}

          <a href={HOME_GUIDES.social.href} target="_blank" rel="noopener noreferrer"
            className="group mt-2 flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/[0.06] p-4 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/50">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-foreground">{HOME_GUIDES.social.label}</span>
              <span className="block text-sm text-muted-foreground">{HOME_GUIDES.social.handle} · {HOME_GUIDES.social.line}</span>
            </span>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>

        {/* Top retirement articles */}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{HOME_GUIDES.articlesLabel}</h3>
          <ol className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            {HOME_GUIDES.articles.map((article, i) => (
              <li key={article.slug}>
                <Link to={`/blog/${article.slug}`} className="group flex items-center gap-4 px-4 py-3.5 sm:px-5">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{i + 1}</span>
                  <span className="min-w-0 flex-1 font-medium leading-snug text-foreground group-hover:text-primary">{article.title}</span>
                  <BookOpen className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
          <Link to="/blog" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--brand-text)' }}>
            {HOME_GUIDES.allArticles} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default HomeGuides;
