// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_REAL_WORTH_ASSETS, REAL_WORTH_DEFAULT_INPUTS } from '../content/realWorth';
import { axisMax, calculateRealWorth, clampRates, formatInr, isValid, parseTyping, validate } from './realWorth';

const lakh = (v: number) => (v / 1_00_000).toFixed(2);

test('defaults match the test values in the brief (today’s money, 7% inflation)', () => {
  const r = calculateRealWorth(REAL_WORTH_DEFAULT_INPUTS, DEFAULT_REAL_WORTH_ASSETS, 7);
  const byKey = Object.fromEntries(r.rows.map((row) => [row.key, row]));
  assert.equal(lakh(byKey.savings.today), '9.35');
  assert.equal(lakh(byKey.fd.today), '17.12');
  assert.equal(lakh(byKey.debt.today), '19.43');
  assert.equal(lakh(byKey.gold.today), '32.71');
  assert.equal(lakh(byKey.gold.todayWeak!), '13.91');
  assert.equal(lakh(byKey.equity.today), '46.73');
  assert.equal(lakh(byKey.equity.todayWeak!), '27.43');
  assert.equal(lakh(r.keptUpToday), '19.43');
  assert.equal(lakh(r.cashToday), '6.45');
  assert.equal(lakh(r.totalPutIn), '35.00');
  assert.equal(byKey.savings.todayWeak, null);
  assert.equal(byKey.fd.todayWeak, null);
  assert.equal(byKey.debt.todayWeak, null);
});

test('rows stay in the fixed order', () => {
  const r = calculateRealWorth(REAL_WORTH_DEFAULT_INPUTS, DEFAULT_REAL_WORTH_ASSETS, 7);
  assert.deepEqual(r.rows.map((row) => row.label), ['Savings account', 'Fixed deposit', 'Debt funds', 'Gold', 'Equity funds']);
});

test('headline numbers format the Indian way', () => {
  assert.equal(formatInr(3500000), '₹35.0 L');
  assert.equal(formatInr(645000), '₹6.5 L');
  assert.equal(formatInr(12500000), '₹1.25 Cr');
  assert.equal(formatInr(85000), '₹85,000');
});

test('validation messages', () => {
  const ok = REAL_WORTH_DEFAULT_INPUTS;
  assert.equal(isValid(ok), true);
  assert.equal(validate({ ...ok, age: 17 }).age, 'Enter an age between 18 and 70');
  assert.equal(validate({ ...ok, retireAge: 35 }).retireAge, 'Retirement age must be more than your age');
  assert.equal(validate({ ...ok, retireAge: 81 }).retireAge, 'Enter a retirement age up to 80');
  assert.equal(validate({ ...ok, savedToday: 0, monthly: 0 }).amounts, 'Enter money saved, a monthly amount, or both');
});

test('weak rate never goes above typical', () => {
  assert.deepEqual(clampRates(4, 9), { typical: 4, weak: 4 });
  assert.deepEqual(clampRates(25, 9), { typical: 20, weak: 9 });
  assert.deepEqual(clampRates(7, null), { typical: 7, weak: null });
});

test('axis max is a neat number above the largest value', () => {
  assert.equal(axisMax([4673000, 935000], 1943000), 6000000);
  assert.equal(axisMax([100], 0), 120);
});

test('typed amounts keep only digits', () => {
  assert.equal(parseTyping('5,00,000'), 500000);
  assert.equal(parseTyping('₹ 10k'), 10);
  assert.equal(parseTyping(''), 0);
});
