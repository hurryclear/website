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

test('base layout: title, meta, header, footer', () => {
  const html = readPage('');
  assert.match(html, /<title>Hur Jiang<\/title>/);
  assert.match(html, /<meta name="description" content="personal site">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/hurryclear\.com\/">/);
  assert.match(html, /<a[^>]+href="\/search\/"/);
  assert.match(html, /©\s*\d{4}\s*Hur Jiang/);
  assert.match(html, /href="https:\/\/github\.com\/hurryclear\/website\/blob\/main\/src\//);
  assert.match(html, /<a[^>]+href="\/privacy\/"/);
});

test('no-flash theme script runs before the stylesheet and survives blocked storage', () => {
  const html = readPage('');
  const script = html.indexOf('prefers-color-scheme');
  const css = html.search(/<link[^>]+rel="stylesheet"/);
  assert.ok(script > -1 && script < css, 'inline theme script precedes CSS');
  assert.match(html.slice(script - 400, script + 400), /try\s*\{/);
});

test('theme toggle is a hydrated React island', () => {
  assert.match(readPage(''), /<astro-island[^>]+component-url="[^"]*ThemeToggle/);
});

test('home nav item is current on home', () => {
  assert.match(readPage(''), /<a[^>]+href="\/"[^>]+aria-current="page"/);
});
