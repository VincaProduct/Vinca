import { Check, type LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  index: number;
}

/**
 * One service: a brand icon badge, the text, and its services as ticked
 * chips. A large faint copy of the icon sits in the corner; hover lifts the
 * card with a soft green edge. Motion is transform/opacity only.
 */
export const ServiceCard = ({ title, description, features, icon: Icon, index }: ServiceCardProps) => {
  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_-20px_hsl(158_64%_42%/0.45)] sm:p-7 animate-fade-in"
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      {/* Green line along the top on hover */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary to-primary/0 transition-transform duration-500 group-hover:scale-x-100" />
      {/* Faint watermark of the icon */}
      <Icon aria-hidden="true" strokeWidth={1.25}
        className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 text-primary/[0.06] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />

      <div className="relative flex items-start gap-4">
        {/* Brand icon badge */}
        <span className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(158_64%_34%)] text-white shadow-[0_8px_20px_-8px_hsl(158_64%_42%/0.7)] ring-1 ring-inset ring-white/20 transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold leading-snug text-foreground sm:text-xl">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        </div>
      </div>

      <div className="relative mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-text)' }}>Key Services</p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground/85">
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-3 w-3 text-primary" strokeWidth={3} aria-hidden="true" />
              </span>
              <span className="min-w-0 break-words">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
};
