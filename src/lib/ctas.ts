/**
 * Which CTAs an article shows and where, shared by the app and the blog edge
 * function so the server-rendered page and the app show the same CTAs.
 * Keep it free of imports.
 */

export const SITE_ORIGIN = "https://vincawealth.com";

/** The parts of a CTA row (ctas table) used to show it */
export interface CtaRow {
  id: string;
  name: string;
  type: string;
  headline: string;
  description?: string | null;
  button_text: string;
  action_url?: string | null;
  open_in_new_tab?: boolean | null;
  status?: string | null;
  default_position?: string | null;
}

export interface PlacedCta extends CtaRow {
  placement_position: string;
  position_config: Record<string, unknown>;
  priority: number;
  /** Shown because it's a default CTA, not chosen for this article */
  is_default?: boolean;
}

export interface PlacementRow {
  placement_position: string;
  position_config?: Record<string, unknown> | null;
  priority?: number | null;
  cta: CtaRow;
}

export const DEFAULT_POSITIONS = [
  { value: "middle_article", label: "Middle of every article" },
  { value: "bottom", label: "Bottom of every article" },
] as const;

/**
 * The article's own CTA placements plus the default CTAs, leaving out
 * defaults switched off for this article and any CTA the article already
 * places itself (so a CTA is never shown twice).
 */
export const resolvePostCtas = (
  placements: PlacementRow[],
  defaults: CtaRow[],
  hiddenDefaults: string[] = [],
): PlacedCta[] => {
  const own: PlacedCta[] = placements
    .filter((p) => p.cta && (p.cta.status ?? "active") === "active")
    .map((p) => ({
      ...p.cta,
      placement_position: p.placement_position,
      position_config: p.position_config ?? {},
      priority: p.priority ?? 1,
    }));
  const placedIds = new Set(own.map((c) => c.id));
  const automatic: PlacedCta[] = defaults
    .filter((c) => c.default_position && (c.status ?? "active") === "active")
    .filter((c) => !hiddenDefaults.includes(c.id) && !placedIds.has(c.id))
    .map((c) => ({
      ...c,
      placement_position: c.default_position as string,
      position_config: {},
      priority: 99,
      is_default: true,
    }));
  return [...own, ...automatic].sort((a, b) => a.priority - b.priority);
};

/** Where a CTA's button goes: its Action URL (site links made relative), or sign-in if it has none */
export const ctaHref = (cta: Pick<CtaRow, "action_url">): string => {
  const url = (cta.action_url || "").trim();
  if (!url) return "/auth";
  if (url === SITE_ORIGIN || url.startsWith(`${SITE_ORIGIN}/`) || url.startsWith(`${SITE_ORIGIN}#`) || url.startsWith(`${SITE_ORIGIN}?`)) {
    return url.slice(SITE_ORIGIN.length) || "/";
  }
  return url;
};

export const isInternalHref = (href: string) => href.startsWith("/") && !href.startsWith("//");

/** Text marker standing in for a CTA inside the article's Markdown (a paragraph of its own) */
export const ctaSlotMarker = (index: number) => `[[CTA_SLOT:${index}]]`;
export const CTA_SLOT_PATTERN = /^\[\[CTA_SLOT:(\d+)\]\]$/;

/**
 * Put the middle-of-article and inline-marker CTAs into the Markdown as slot
 * markers. The middle CTA goes before the middle H2 heading (or, with fewer
 * than two H2s, between the middle paragraphs); [[CTA:name]] markers get the
 * inline CTA with that marker name, or the first inline CTA. Markers with no
 * CTA are removed.
 */
export const placeCtasInMarkdown = (content: string, ctas: PlacedCta[]) => {
  const slots: PlacedCta[] = [];
  let markdown = content || "";

  const middle = ctas.filter((c) => c.placement_position === "middle_article");
  if (middle.length > 0) {
    const block = middle.map((cta) => `\n\n${ctaSlotMarker(slots.push(cta) - 1)}\n\n`).join("");
    const h2s = [...markdown.matchAll(/^## .+$/gm)];
    if (h2s.length >= 2) {
      const target = h2s[Math.ceil(h2s.length / 2) - 1];
      markdown = markdown.slice(0, target.index) + block + markdown.slice(target.index);
    } else {
      // Between paragraphs, about halfway through
      const breaks = [...markdown.matchAll(/\n\s*\n/g)].map((m) => m.index as number);
      if (breaks.length > 0) {
        const at = breaks.reduce((best, i) => (Math.abs(i - markdown.length / 2) < Math.abs(best - markdown.length / 2) ? i : best));
        markdown = markdown.slice(0, at) + block + markdown.slice(at);
      } else {
        markdown += block;
      }
    }
  }

  const inline = ctas.filter((c) => c.placement_position === "inline_marker");
  markdown = markdown.replace(/\[\[CTA:([^\]]+)\]\]/g, (_match, name: string) => {
    const cta = inline.find((c) => c.position_config?.marker_name === name) || inline[0];
    return cta ? `\n\n${ctaSlotMarker(slots.push(cta) - 1)}\n\n` : "";
  });

  return { markdown, slots };
};
