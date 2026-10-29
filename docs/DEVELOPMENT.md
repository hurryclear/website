# Development notes

A static personal site built with [Astro](https://docs.astro.build), React (one small island), and Tailwind 4. It replaces the old Hugo site. `npm run build` turns everything into plain HTML in `dist/`.

## How this site works

Astro turns files into pages. A `.astro` file has a code fence (`---`) at the top that runs at build time, then HTML below it. Files in `src/pages/` become URLs. Markdown in `src/content/` is the text.

```
astro.config.mjs        site URL, React integration, Tailwind plugin
wrangler.jsonc          Cloudflare config: serve ./dist
src/config.ts           site name, nav links, social links (the old hugo.yaml params)
src/content.config.ts   the shape (schema) of posts and pages
src/content/posts/      one .md file per blog post
src/content/pages/      text for home, about, privacy
src/i18n/ui.ts          UI strings and the t() lookup
src/lib/                helpers: content-utils.ts (pure, unit-tested), posts.ts (reads the posts collection)
src/layouts/            BaseLayout.astro: <head>, header, footer around every page
src/components/         Header, Menu, Footer, ProfileCard, CategoryRail, PostList, Prose, ...
                        ThemeToggle.tsx is the only React component (the dark mode button)
src/pages/              one file per URL: index, about, privacy, posts/, categories/, tags/, search, 404
src/styles/global.css   Tailwind entry and a few custom rules
src/assets/             icons (svg) and the profile image, imported by components
public/                 copied as-is to the site root (favicons)
tests/                  unit tests and build tests (they read the HTML in dist/)
```

## Add a post

Create `src/content/posts/my-post.md`. The file name becomes the URL (`/posts/my-post/`).

```md
---
title: 'My post'              # required
date: 2026-10-29              # required, YYYY-MM-DD only (no time)
description: 'One sentence.'  # optional, shown in the list
draft: false                  # optional, default false. true = never published
categories: ['Notes']         # optional, default []
tags: ['astro']               # optional, default []
---

Write Markdown here.
```

A wrong or missing field makes the build fail with a message naming the file. Write `date` as `YYYY-MM-DD` only: a time plus an offset can render as the previous day, so the schema rejects it. Posts dated in the future are hidden from the production build (like Hugo), and still show in the dev server.

## Develop

```
npm install
npx astro dev --background   # start the dev server in the background
npx astro dev status         # is it running, and on which URL
npx astro dev logs           # see its output
npx astro dev stop           # stop it
npm test                 # unit tests, then build + HTML tests
npm run check            # astro check: types and Astro errors
npm run build            # production build into dist/
```

Needs Node 22.12 or newer.

## Deploy

The `hurryclear` Worker serves https://hurryclear.com (set by `routes` in `wrangler.jsonc`) and also https://hurryclear.hurryclearde.workers.dev. Every deploy goes live on the real domain.

Option 1, from your machine:

```
npm run build
npx wrangler deploy
```

The first run asks you to log in to Cloudflare. `wrangler` is not a dependency; `npx` fetches it.

Option 2, from the dashboard: Workers & Pages, Create, Import a repository. Pick this repo, set the build command to `npm run build`, the deploy command to `npx wrangler deploy`, and add the environment variable `NODE_VERSION` = `22`. The dashboard builds the production branch (`main`), so merge this branch first or change the production branch in the settings.

## Placeholders

Things left for you to build are marked `TODO(hur)`. List them with:

```
grep -rn "TODO(hur)" src
```

Right now there are four:

| Where | What | Read |
| --- | --- | --- |
| `src/i18n/ui.ts` | Add `zh-cn` strings and an `i18n` block in `astro.config.mjs` | https://docs.astro.build/en/guides/internationalization/ |
| `src/components/Header.astro` | Language switcher (needs the same i18n block) | https://docs.astro.build/en/guides/internationalization/ |
| `src/pages/search.astro` | Make search work (JSON endpoint + Fuse.js island, or Pagefind) | https://docs.astro.build/en/guides/endpoints/ and https://pagefind.app/ |
| `src/pages/posts/index.astro` | Split the post list into pages with `paginate()` | https://docs.astro.build/en/guides/routing/ (section "Pagination") |

## Adding server features later

This site is fully static, so it needs no adapter. If you want server code later (forms, API routes, on-demand pages), run:

```
npx astro add cloudflare
```

That installs the `@astrojs/cloudflare` adapter and updates the config. See https://docs.astro.build/en/guides/deploy/cloudflare/.
