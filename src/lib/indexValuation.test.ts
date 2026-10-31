// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addMonths,
  computeValuation,
  formatGap,
  gapFor,
  labelForGap,
  latestCompleteMonth,
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

test('labels use the gap as displayed, so 22 vs 20 (exactly 10.00% premium) is Near', () => {
  assert.equal(labelForGap(gapFor(22, 20)), 'Near');
  assert.equal(labelForGap(gapFor(18, 20)), 'Near');
});

test('gap shows as a discount or premium', () => {
  assert.equal(formatGap(gapFor(19.7, 22.0)), '10.45% discount');
  assert.equal(formatGap(gapFor(33.7, 28.2)), '19.50% premium');
  assert.equal(formatGap(gapFor(20, 20)), 'At the median');
  assert.equal(formatGap(null), '—');
});

const october: IndexPeRow[] = [
  { index_code: 'NIFTY50', month: '2026-10-01', as_of_date: '2026-10-30', pe: 19.7, median_pe: 22.0 },
  { index_code: 'NIFTYMIDCAP150', month: '2026-10-01', as_of_date: '2026-10-30', pe: 28.6, median_pe: 29.8 },
  { index_code: 'NIFTYSMALLCAP250', month: '2026-10-01', as_of_date: '2026-10-30', pe: 33.7, median_pe: 28.2 },
  { index_code: 'NIFTY500', month: '2026-10-01', as_of_date: '2026-10-30', pe: 22.0, median_pe: 23.7 },
];

test('acceptance: October 2026 table from the brief', () => {
  const table = computeValuation(october, '2026-10-01');
  assert.deepEqual(
    table.map((r) => [r.name, r.pe, r.median, formatGap(r.gap), r.label]),
    [
      ['Nifty 50', 19.7, 22.0, '10.45% discount', 'Below'],
      ['Nifty Midcap 150', 28.6, 29.8, '4.03% discount', 'Near'],
      ['Nifty Smallcap 250', 33.7, 28.2, '19.50% premium', 'Above'],
      ['Nifty 500', 22.0, 23.7, '7.17% discount', 'Near'],
    ],
  );
});

test('a missing index shows dashes', () => {
  const nifty500 = computeValuation(october.slice(0, 3), '2026-10-01')[3];
  assert.equal(nifty500.pe, null);
  assert.equal(nifty500.label, null);
});

test('latest month is the newest one with all four indices', () => {
  const rows = [...october, { ...october[0], month: '2026-11-01', as_of_date: '2026-11-27' }];
  assert.equal(latestCompleteMonth(rows), '2026-10-01');
  assert.equal(addMonths('2026-01-01', -1), '2025-12-01');
});
