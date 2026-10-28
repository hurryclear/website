// Unit tests for src/lib/content-utils.ts. Run by Node's built-in test runner (npm run test:unit).
// Relative import with .ts extension because Node doesn't resolve tsconfig aliases.
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, isoDate, slugifyTerm, countTerms, isPublished } from '../src/lib/content-utils.ts';

test('formatDate is timezone-proof', () => {
  assert.equal(formatDate(new Date('2026-08-27')), 'Aug 27, 2026');
  assert.equal(isoDate(new Date('2026-08-27')), '2026-08-27');
});
test('slugifyTerm', () => {
  assert.equal(slugifyTerm('Learning in Public'), 'learning-in-public');
  assert.equal(slugifyTerm('  Astro  '), 'astro');
  assert.equal(slugifyTerm('数据'), '数据');
  assert.equal(slugifyTerm('C++ / Rust!'), 'c-rust');
});
test('countTerms merges case variants and sorts by count', () => {
  assert.deepEqual(countTerms([['Astro', 'NLP'], ['astro'], ['NLP', 'NLP']]), [
    { name: 'Astro', slug: 'astro', count: 2 },
    { name: 'NLP', slug: 'nlp', count: 2 },
  ]);
  assert.deepEqual(countTerms([]), []);
});
test('isPublished hides drafts only in production', () => {
  const draft = { data: { draft: true } };
  assert.equal(isPublished(draft, true), false);
  assert.equal(isPublished(draft, false), true);
});
