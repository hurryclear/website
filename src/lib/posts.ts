// Shared post queries (published posts, category/tag counts). Used by the list, post and term pages.
import { getCollection, type CollectionEntry } from 'astro:content';
import { byDateDesc, countTerms, isPublished, slugifyTerm } from './content-utils.ts';

type Post = CollectionEntry<'posts'>;

// getCollection reads the `posts` collection defined in src/content.config.ts.
// import.meta.env.PROD is true in `astro build`, false in `astro dev`.
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', (e) => isPublished(e, import.meta.env.PROD));
  return posts.sort(byDateDesc);
}

export async function getTerms(kind: 'categories' | 'tags'): Promise<ReturnType<typeof countTerms>> {
  const posts = await getPublishedPosts();
  return countTerms(posts.map((p) => p.data[kind]));
}

export function postsWithTerm(posts: Post[], kind: 'categories' | 'tags', slug: string): Post[] {
  return posts.filter((p) => p.data[kind].some((name) => slugifyTerm(name) === slug));
}
