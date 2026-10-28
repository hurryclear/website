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

test('home renders essay and profile rail', () => {
  const html = readPage('');
  assert.match(html, /I start the blog because I’?'?m tired/);
  // Astro puts src before class, so match the tag and check both attributes inside it.
  const img = html.match(/<img[^>]*class="[^"]*profile-avatar[^"]*"[^>]*>/)?.[0] ?? '';
  assert.match(img, /src="[^"]+\.webp"/);
  assert.match(html, /Data Engineer &amp; Software Developer/);
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/hurryclear\/"/);
  assert.match(html, /href="\/about\/"[^>]*>\s*More about me/);
});

test('about and privacy pages', () => {
  const about = readPage('about/');
  assert.match(about, /<title>About :: Hur Jiang<\/title>/);
  assert.match(about, /<h1[^>]*>Education<\/h1>/);
  assert.match(about, /<a[^>]+href="\/about\/"[^>]+aria-current="page"/);
  assert.match(readPage('privacy/'), /This site does not collect personal data/);
});

test('posts list shows hello world with formatted date', () => {
  const html = readPage('posts/');
  assert.match(html, /<title>Posts :: Hur Jiang<\/title>/);
  assert.match(html, /href="\/posts\/hello-world\/"[^>]*>\s*Hello World/);
  assert.match(html, /<time datetime="2026-08-27">Aug 27, 2026<\/time>/);
  assert.match(html, /No categories yet\./); // rail empty state
  assert.match(html, /<a[^>]+href="\/posts\/"[^>]+aria-current="page"/);
});

test('single post', () => {
  const html = readPage('posts/hello-world/');
  assert.match(html, /<title>Hello World :: Hur Jiang<\/title>/);
  assert.match(html, /First post on the new site\./);
  assert.match(html, /This is the first post\./);
  assert.match(html, /<a[^>]+href="\/posts\/"[^>]+aria-current="page"/);
  assert.match(html, /blob\/main\/src\/content\/posts\/hello-world\.md/);
});

test('drafts never ship', () => {
  assert.throws(() => readPage('posts/zz-draft-fixture/'));
  assert.doesNotMatch(readPage('posts/'), /Draft Fixture/);
  assert.throws(() => readPage('categories/secret/'));
});

test('taxonomy index pages exist', () => {
  assert.match(readPage('categories/'), /<title>Categories :: Hur Jiang<\/title>/);
  assert.match(readPage('tags/'), /<title>Tags :: Hur Jiang<\/title>/);
});

test('404 page', () => {
  const html = readPage('404.html');
  assert.match(html, /Page not found/);
  assert.match(html, /<a[^>]+href="\/"[^>]*>\s*Go back home/);
  assert.doesNotMatch(html, /profile-avatar/); // no rail
});

test('search placeholder', () => {
  const html = readPage('search/');
  assert.match(html, /<title>Search :: Hur Jiang<\/title>/);
  assert.match(html, /Search is coming soon\./);
  assert.doesNotMatch(html, /profile-avatar/);
});

test('cloudflare serves dist with the 404 page', () => {
  const cfg = readFileSync('wrangler.jsonc', 'utf8');
  assert.match(cfg, /"directory":\s*"\.\/dist"/);
  assert.match(cfg, /"not_found_handling":\s*"404-page"/);
  assert.doesNotMatch(cfg, /hurryclear\.com/);
});
