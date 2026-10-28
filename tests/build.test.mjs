// Build-output tests: run after `astro build` and assert on the HTML/CSS in dist/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readPage } from './helpers.mjs';

test('home page builds and links a stylesheet containing prose and dark styles', () => {
  const html = readPage('');
  const href = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/)?.[1];
  assert.ok(href, 'stylesheet link');
  const css = readFileSync(join('dist', href), 'utf8');
  assert.match(css, /\.prose\b/);
  assert.match(css, /\.dark/); // class-based dark variant is compiled
});
