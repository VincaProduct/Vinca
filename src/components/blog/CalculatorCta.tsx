import { Link } from "react-router-dom";
import { Calculator } from "lucide-react";
import { CALCULATOR_CTA } from "@/lib/relatedPosts";

/** Shown after every article (same markup as the server-rendered page) */
export const CalculatorCta = () => (
  <aside className="mt-12 sm:mt-16 rounded-lg border border-primary/20 bg-primary/5 p-6 sm:p-8">
    <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-display font-bold mb-2">
      <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" aria-hidden="true" />
      {CALCULATOR_CTA.heading}
    </h2>
    <p className="text-muted-foreground mb-5">{CALCULATOR_CTA.text}</p>
    <Link
      to={CALCULATOR_CTA.href}
      className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      {CALCULATOR_CTA.button}
    </Link>
  </aside>
);
