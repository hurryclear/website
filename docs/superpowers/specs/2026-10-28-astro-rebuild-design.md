# Rebuild hurryclear.com in Astro — design

Date: 2026-10-28
Repo: `website` (this repo). Reference site: https://github.com/hurryclear/hurryclear-web (Hugo).

## Intent

Hur is rebuilding their personal site/blog, currently Hugo + Tailwind on Cloudflare,
in **Astro + React**. They don't need anything Astro does today; they chose it
because it is more flexible for features they may want later and don't know yet.
This is the *start* of the site, not a finished product.

The rebuild has two goals, equally important:

1. **Port the old site's look and behaviour quickly and faithfully.** No redesign.
2. **Leave Hur able to read, understand and extend the code alone.** They are
   learning Astro and React. The code is a teaching base: plain over clever,
   idiomatic Astro (so the official docs match what they see), with comments
   explaining *why* where it isn't obvious, and clearly marked placeholders
   for features they will build later themselves.

## Goals

- Same visual result as the Hugo site in light and dark mode, desktop and mobile.
- Same pages and URLs: `/`, `/posts/`, `/posts/<slug>/`, `/about/`, `/privacy/`,
  `/categories/<term>/`, `/tags/<term>/`, `/search/` (placeholder), 404.
- Content managed with Astro **content collections** (Markdown), so adding a post
  is "drop a `.md` file in a folder".
- React installed **and used in one small, real place**, so there is a working
  island to copy from (Claude's call: the dark-mode toggle — see below).
- Deployed to Cloudflare on a **separate preview address**; hurryclear.com keeps
  serving the Hugo site until Hur decides to switch.

## Non-goals (placeholders only, Hur builds later)

- **Search.** Keep the search icon in the header; `/search/` renders a simple
  "coming soon" page in the site layout. A comment points to where a search
  index / React search island would go.
- **Chinese (zh-cn) version.** No translation, no language switcher in the
  header. Structure the code so i18n can be added later without moving files
  around (e.g. UI strings kept in one small module, not scattered), and leave a
  comment where Astro's `i18n` config and the language switcher would go.
- Pagination beyond what's needed (one post exists). A simple list is fine;
  a comment can note Astro's `paginate()` for later.
- SEO/OpenGraph polish beyond the old site's description + canonical.

## Anti-goals

- Over-engineering: no extra libraries, abstractions or config that Hur would
  have to understand before touching anything. If the old site did it with a
  bit of CSS and plain JS, do the same unless React is the point.
- Code that only Claude can maintain: no dense one-liners, no magic.
- Diverging from Astro conventions (project layout, content collections,
  `getStaticPaths`) — Hur will be reading the Astro docs alongside the code.
- Touching the live hurryclear.com deployment.

## Constraints and decisions

### Decided by Hur
- Stack: **Astro + React**, deployed on **Cloudflare**.
- **Keep React** even though nothing strictly needs it yet.
- Search and Chinese version: **placeholders**.
- Deployment: **separate** from the live site.

### Claude's calls (Hur can override)
- **Tailwind CSS v4 + `@tailwindcss/typography`**, via the Vite plugin
  (`npx astro add tailwind`). The old styling is all Tailwind utilities, so this
  is the fastest exact port. Carry over the old `main.css` rules: v3-style
  default border colour, `.profile-avatar`, `.footnote-backref`, the
  `.site-footer*` component classes, and the `prose-quoteless` variant
  (rewrite as v4 CSS instead of a `tailwind.config.js` if straightforward).
- Dark mode is class-based (`.dark` on `<html>`), as before. Tailwind v4 needs
  `@custom-variant dark (&:where(.dark, .dark *));` for this.
- **Replace the Astro tutorial code** currently in the repo: `Layout.astro`,
  `Welcome.astro`, tutorial `BaseLayout`/`Header`/`Footer`/`Menu`/`Navigation`/
  `Social`, `about.astro`, `blog.astro`, `scripts/menu.js`, `styles/global.css`,
  the three tutorial posts, `assets/astro.svg`, `assets/background.svg`, the
  empty `404.astro`/`500.astro`. Hur's tutorial work was committed on `main`
  as `56a7a8c Astro tutorial progress` before the rebuild, so it stays in
  history. The rebuild happens on its own branch off that commit. Drop `/blog`;
  the old site uses `/posts`.
- **Keep Hur's tsconfig path aliases** (`@components/*`, `@layouts/*`,
  `@assets/*`) and use them for imports in the new code. Add more aliases
  (e.g. `@config`) only if there's a clear need.
- **Dark-mode toggle as the React island** (`client:load`). The inline
  no-flash script in `<head>` stays plain JS (it must run before paint). The
  mobile menu stays a plain Astro `<script>`, so Hur sees both ways side by side.
  Comments should say why each is done the way it is.
- **Content copied as-is** from the old repo: homepage essay (`_index.md`),
  About (empty headings), Hello World post, Privacy, avatar
  (`assets/images/profile-avatar.png`), and the SVG icons.
- Site-wide settings (title, author, bio, social links, menu items, footer
  links) live in **one config module** (e.g. `src/config.ts`), playing the role
  of `hugo.yaml` `params`.
- Output is **static** (Astro default). No Cloudflare adapter yet; note in a
  comment/README that `@astrojs/cloudflare` is what to add if server features
  are ever wanted.
- Re-enable `site` in `astro.config.mjs` (`https://hurryclear.com`) and remove
  `base: "/home"` (it was commented out; the site lives at the root).

## What to build (from the old site)

Reference files are in the old repo under `layouts/` and `assets/`.

- **Base layout** (`baseof.html`): `<title>` = "Title :: Hur Jiang" (just
  "Hur Jiang" on home); meta description + canonical; no-flash dark script;
  body `min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900`; sticky blurred
  header; `main` max-w-6xl; on `lg+` a two-column grid
  `[minmax(0,1fr)_13rem]` with a sticky right rail — **profile card** on home /
  About / Privacy, **category list** on posts and taxonomy pages; no rail on
  404 and search.
- **Header**: site name (emerald hover) left; right side: main menu
  (Home / Posts / About, current page emerald), search icon link, dark-mode toggle.
  Mobile: hamburger opens a floating panel; outside click closes it.
- **Footer**: © current year + site title; Privacy link; Source link pointing to
  this page's source file on GitHub (repo URL configurable — it will change from
  `hurryclear-web` to this repo).
- **Profile card**: avatar (optimised with Astro `<Image>`), name, bio, social
  icons (GitHub, LinkedIn), "More about me →".
- **Category rail**: categories with post counts, sorted by count; "No categories
  yet." when empty.
- **Homepage**: the essay rendered as prose.
- **Posts list**: title, date ("Jan 2, 2006" format), description, divided list;
  "Nothing here yet." when empty.
- **Single post**: title, description, calendar icon + date, `#category`/`#tag`
  links, prose body.
- **Plain page** (About, Privacy): title, optional description, prose body.
- **Taxonomy pages**: `/categories/<term>/` and `/tags/<term>/` reuse the post
  list. Index pages `/categories/` and `/tags/` (the rail links to
  `/categories/`).
- **404**: centred emerald "404", "Page not found", sorry text, "Go back home →".
- **Icons**: inline SVGs from the old `assets/icons/`, via a small `Icon.astro`.

## Learning aids

- Comments in each file at roughly the density of the old Hugo partials: a short
  header saying what the file is and where it's used, plus *why* notes on
  anything Astro- or React-specific (frontmatter fence, props, `client:*`
  directives, `getStaticPaths`, collections).
- A short README section "How this site works": where pages, layouts,
  components, content and config live; how to add a post; how to run, build and
  deploy; where the placeholders are and what to read in the Astro docs to fill
  them.
- Placeholder spots marked with a consistent tag (e.g. `TODO(hur):`) so Hur can
  grep for them.

## Deployment

Cloudflare, static assets from `dist/`, on its own project name (e.g.
`hurryclear-astro`) so it gets its own `*.workers.dev` / `*.pages.dev` address.
Do not add the hurryclear.com custom domain. Include whatever config file is
needed (e.g. `wrangler.jsonc` with `assets.directory: ./dist` and
`not_found_handling: "404-page"`, matching the old repo) and document the
Cloudflare dashboard settings in the README. Hur performs any dashboard /
login steps.

## Left to the builder

- Exact file/component split, names, and whether a piece is one component or two.
- Tailwind setup details, as long as the result matches visually.
- Date formatting approach; content schema details (fields: title, date,
  description, draft, categories, tags).
- Cloudflare Workers vs Pages, as long as it's a separate address and
  documented.
- Verifying visual parity by running both sites side by side.
