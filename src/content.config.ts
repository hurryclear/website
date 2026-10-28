// Content collections: defines the shape (schema) of everything under src/content/.
// Astro reads this file by name. Relative imports only here, as aliases aren't resolved in this file.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Blog posts: src/content/posts/*.md, entry id = file name without extension.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    // Write dates as YYYY-MM-DD. A time plus offset can land on the previous UTC day, so reject it.
    date: z.coerce.date().refine((d) => d.getTime() % 86_400_000 === 0, {
      message: 'date must be date-only (YYYY-MM-DD), without a time',
    }),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

// Standalone pages (home text, about, privacy): src/content/pages/*.md
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(), // may be '' (the about page shows no title)
    description: z.string().optional(),
  }),
});

export const collections = { posts, pages };
