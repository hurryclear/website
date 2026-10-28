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
  assert.equal(slugifyTerm('C++ / Rust!'), 'cplusplus-rust');
  assert.equal(slugifyTerm('C#'), 'csharp');
  assert.equal(slugifyTerm('C'), 'c');
  assert.equal(slugifyTerm('!!!'), '');
});
test('countTerms merges case variants and sorts by count', () => {
  assert.deepEqual(countTerms([['Astro', 'NLP'], ['astro'], ['NLP', 'NLP']]), [
    { name: 'Astro', slug: 'astro', count: 2 },
    { name: 'NLP', slug: 'nlp', count: 2 },
  ]);
  assert.deepEqual(countTerms([]), []);
});
test('countTerms skips names that slugify to nothing', () => {
  assert.deepEqual(countTerms([['!!!', 'Astro']]), [{ name: 'Astro', slug: 'astro', count: 1 }]);
});
test('countTerms keeps C, C++ and C# apart', () => {
  assert.equal(countTerms([['C', 'C++', 'C#']]).length, 3);
});
test('isPublished hides drafts only in production', () => {
  const now = new Date('2026-10-29');
  const draft = { data: { draft: true, date: new Date('2026-01-01') } };
  assert.equal(isPublished(draft, true, now), false);
  assert.equal(isPublished(draft, false, now), true);
});
test('isPublished hides future posts in production but shows them in dev', () => {
  const now = new Date('2026-10-29');
  const future = { data: { draft: false, date: new Date('2026-12-01') } };
  const past = { data: { draft: false, date: new Date('2026-10-01') } };
  assert.equal(isPublished(future, true, now), false);
  assert.equal(isPublished(future, false, now), true);
  assert.equal(isPublished(past, true, now), true);
});
