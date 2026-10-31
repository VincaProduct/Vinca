// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  INDICES,
  WINDOW_MONTHS,
  addMonths,
  computeValuation,
  formatGap,
  labelForGap,
  latestCompleteMonth,
  median,
  windowMonths,
  type IndexPeRow,
} from './indexValuation';

test('label boundaries', () => {
  const cases: [number, string][] = [
    [-0.1, 'Near'],
    [-0.1001, 'Below'],
    [-0.2, 'Below'],
    [-0.2001, 'Well below'],
    [0.1, 'Near'],
    [0.1001, 'Above'],
    [0.2, 'Above'],
    [0.2001, 'Well above'],
    [0, 'Near'],
  ];
  for (const [gap, label] of cases) assert.equal(labelForGap(gap), label, `gap ${gap}`);
});

test('labels use the gap as displayed, so 22 vs 20 (exactly +10.00%) is Near', () => {
  assert.equal(labelForGap(22 / 20 - 1), 'Near');
  assert.equal(labelForGap(18 / 20 - 1), 'Near');
});

test('median of 60 values is the average of the 30th and 31st sorted values', () => {
  const values = Array.from({ length: 60 }, (_, i) => 60 - i); // 60..1, unsorted order
  assert.equal(median(values), (30 + 31) / 2);
});

test('the window is the 60 months ending at (and including) the month', () => {
  const months = windowMonths('2026-10-01');
  assert.equal(months.length, WINDOW_MONTHS);
  assert.equal(months[0], '2021-11-01');
  assert.equal(months.at(-1), '2026-10-01');
  assert.equal(addMonths('2026-01-01', -1), '2025-12-01');
});

const fullHistory = (pe: (code: string, i: number) => number, end = '2026-10-01'): IndexPeRow[] =>
  INDICES.flatMap(({ code }) =>
    windowMonths(end).map((month, i) => ({ index_code: code, month, as_of_date: month, pe: pe(code, i) })),
  );

test('a window with one missing month gives "Not enough history"', () => {
  const rows = fullHistory(() => 20).filter((r) => !(r.index_code === 'NIFTY50' && r.month === '2023-03-01'));
  const nifty = computeValuation(rows, '2026-10-01')[0];
  assert.equal(nifty.median, null);
  assert.equal(nifty.gap, null);
  assert.equal(nifty.label, null);
  assert.equal(nifty.note, 'Not enough history');
  // The other indices are unaffected
  assert.equal(computeValuation(rows, '2026-10-01')[1].label, 'Near');
});

test('gap, label and display for a full window', () => {
  // 59 months at 22 and the current month at 19.7: median 22, gap −10.45%
  const rows = fullHistory((code, i) => (code === 'NIFTY50' && i === WINDOW_MONTHS - 1 ? 19.7 : 22));
  const nifty = computeValuation(rows, '2026-10-01')[0];
  assert.equal(nifty.median, 22);
  assert.equal(formatGap(nifty.gap), '−10.45%');
  assert.equal(nifty.label, 'Below');
  assert.equal(formatGap(33.7 / 28.2 - 1), '+19.50%');
  assert.equal(labelForGap(33.7 / 28.2 - 1), 'Above');
});

test('latest month is the newest one with all four indices', () => {
  const rows = fullHistory(() => 20);
  rows.push({ index_code: 'NIFTY50', month: '2026-11-01', as_of_date: '2026-11-28', pe: 20 });
  assert.equal(latestCompleteMonth(rows), '2026-10-01');
});
