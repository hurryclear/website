// Pure helpers for dates, taxonomy terms and draft filtering. Used by pages and src/lib/posts.ts.
// No Astro imports on purpose, so Node can unit-test this file directly (tests/content-utils.test.ts).

// UTC so a date like 2026-08-27 never shifts a day depending on the build machine's timezone.
const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "Aug 27, 2026" */
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

/** "2026-08-27", for <time datetime="..."> */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "Learning in Public" -> "learning-in-public". Keeps any Unicode letters/numbers. */
export function slugifyTerm(name: string): string {
  return name
    .toLowerCase()
    // Spell out + and # first, so "C++", "C#" and "C" don't all collapse to "c".
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export type TermCount = { name: string; slug: string; count: number };

/** Takes one list of term names per post. Groups by slug; a post counts once per term. */
export function countTerms(names: string[][]): TermCount[] {
  const bySlug = new Map<string, TermCount>();
  for (const postNames of names) {
    const seen = new Set<string>();
    for (const name of postNames) {
      const slug = slugifyTerm(name);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const existing = bySlug.get(slug);
      if (existing) existing.count++;
      else bySlug.set(slug, { name, slug, count: 1 });
    }
  }
  return [...bySlug.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'en'));
}

/** Drafts and future-dated posts show in `astro dev` but are hidden from the production build. */
export function isPublished(
  entry: { data: { draft: boolean; date: Date } },
  isProd: boolean,
  now: Date = new Date(),
): boolean {
  return !isProd || (!entry.data.draft && entry.data.date <= now);
}

/** Sort comparator: newest first. */
export function byDateDesc(a: { data: { date: Date } }, b: { data: { date: Date } }): number {
  return b.data.date.valueOf() - a.data.date.valueOf();
}
