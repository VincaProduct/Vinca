import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DISCLOSURE,
  completeMonths,
  computeValuation,
  formatAsOf,
  formatGap,
  formatMonth,
  formatPe,
  SOURCE_NOTE,
  type IndexPeRow,
  type ValuationLabel,
} from '@/lib/indexValuation';

interface IndexValuationTableProps {
  rows: IndexPeRow[];
  /** Optional "Learn how P/E works" link */
  learnMoreHref?: string;
}

/**
 * Badge colours: cool shades below the median, grey near it, warm shades above.
 * No red or green, so the labels describe the valuation without reading as
 * buy or sell signals.
 */
const LABEL_STYLE: Record<ValuationLabel, string> = {
  'Well below': 'bg-sky-500/20 text-sky-700 dark:text-sky-300 ring-sky-500/40',
  Below: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-sky-500/25',
  Near: 'bg-muted text-muted-foreground ring-border',
  Above: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/25',
  'Well above': 'bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-amber-500/40',
};

/**
 * "How today's P/E compares with the last 5 years": each index's month-end
 * P/E against its own 5-year median. Educational only, with no verdicts or
 * calls to action. Standalone so it can go on a public page too.
 */
export function IndexValuationTable({ rows, learnMoreHref }: IndexValuationTableProps) {
  const months = useMemo(() => completeMonths(rows), [rows]);
  const [month, setMonth] = useState<string | null>(null);
  const selected = month ?? months[0] ?? null;

  const table = useMemo(() => (selected ? computeValuation(rows, selected) : []), [rows, selected]);
  const asOf = formatAsOf(
    selected ? rows.find((r) => r.month === selected && r.index_code === 'NIFTY50')?.as_of_date ?? null : null,
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">How today’s P/E compares with the last 5 years</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {selected ? `Data as of ${asOf} · Updated monthly` : 'Updated monthly'}
          </p>
        </div>
        {months.length > 1 && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>View month</span>
            <select
              value={selected ?? ''}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900"
            >
              {months.map((m) => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {!selected ? (
        <p className="text-sm text-slate-500">The latest index P/E data will appear here once it has been added.</p>
      ) : (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[680px] overflow-hidden rounded-xl text-sm">
            <thead>
              <tr className="bg-primary/10 text-left text-xs uppercase tracking-wide text-primary">
                <th className="rounded-l-lg px-4 py-3 font-semibold">Market segment</th>
                <th className="px-4 py-3 font-semibold">Index</th>
                <th className="px-4 py-3 text-right font-semibold">P/E</th>
                <th className="px-4 py-3 text-right font-semibold">5-yr median P/E</th>
                <th className="px-4 py-3 text-right font-semibold">Discount / premium</th>
                <th className="rounded-r-lg px-4 py-3 font-semibold">Vs 5-yr median</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.code} className="border-b border-border transition-colors last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3.5 text-muted-foreground">{row.segment}</td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">{row.name}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-foreground">{formatPe(row.pe)}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">{formatPe(row.median)}</td>
                  <td className="px-4 py-3.5 text-right font-medium tabular-nums text-foreground">{formatGap(row.gap)}</td>
                  <td className="px-4 py-3.5">
                    {row.label ? (
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${LABEL_STYLE[row.label]}`}>
                        {row.label}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="space-y-1.5 border-t border-border pt-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{SOURCE_NOTE}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{DISCLOSURE}</p>
        {learnMoreHref && (
          <Link to={learnMoreHref} className="inline-block text-xs font-medium text-emerald-700 hover:underline">
            Learn how P/E works →
          </Link>
        )}
      </div>
    </div>
  );
}
