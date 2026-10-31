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
  methodologyText,
  type IndexPeRow,
} from '@/lib/indexValuation';

interface IndexValuationTableProps {
  rows: IndexPeRow[];
  /** Optional "Learn how P/E works" link */
  learnMoreHref?: string;
}

/**
 * "How today's P/E compares with the last 5 years": each index's month-end
 * P/E against its own 5-year median. Educational only — neutral styling, no
 * verdicts or calls to action. Standalone so it can go on a public page too.
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
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
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-3 pr-4 font-semibold">Market segment</th>
                <th className="py-3 pr-4 font-semibold">Index</th>
                <th className="py-3 pr-4 font-semibold text-right">P/E</th>
                <th className="py-3 pr-4 font-semibold text-right">5-yr median P/E</th>
                <th className="py-3 pr-4 font-semibold text-right">Discount / premium vs median</th>
                <th className="py-3 font-semibold">Compared with its 5-yr median</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.code} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4 text-slate-500">{row.segment}</td>
                  <td className="py-3 pr-4 font-medium text-slate-900">{row.name}</td>
                  <td className="py-3 pr-4 text-right tabular-nums text-slate-900">{formatPe(row.pe)}</td>
                  <td className="py-3 pr-4 text-right tabular-nums text-slate-900">{formatPe(row.median)}</td>
                  <td className="py-3 pr-4 text-right tabular-nums text-slate-900">{formatGap(row.gap)}</td>
                  <td className="py-3">
                    {row.label ? (
                      // Same neutral badge for every label: colours would read as buy/avoid signals
                      <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
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

      <div className="space-y-3 border-t border-slate-100 pt-4">
        {selected && <p className="text-xs text-slate-500 leading-relaxed">{methodologyText(asOf)}</p>}
        <p className="text-xs text-slate-500 leading-relaxed">{DISCLOSURE}</p>
        {learnMoreHref && (
          <Link to={learnMoreHref} className="inline-block text-xs font-medium text-emerald-700 hover:underline">
            Learn how P/E works →
          </Link>
        )}
      </div>
    </div>
  );
}
