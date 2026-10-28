// Test helper: reads built HTML from dist/ after `astro build`. Used by tests/*.test.mjs.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// readPage("") -> dist/index.html, readPage("posts/") -> dist/posts/index.html
export function readPage(path) {
  const file = path === '' || path.endsWith('/')
    ? join('dist', path, 'index.html')
    : join('dist', path);
  if (!existsSync(file)) throw new Error(`Missing build output: ${file}`);
  return readFileSync(file, 'utf8');
}
