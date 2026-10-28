# Astro Rebuild of hurryclear.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Hugo site hurryclear-web to Astro + React + Tailwind in this repo. The look and behaviour should match the old site, and the code should be written so Hur can learn from it and extend it.

**Architecture:** A static Astro site. Markdown lives in two content collections: `posts` and `pages` (home, about, privacy). One `BaseLayout` provides the header, footer and the optional right rail. Site-wide settings live in `src/config.ts` and UI strings in `src/i18n/ui.ts`. Pure helpers (dates, term slugs, counts) live in `src/lib/content-utils.ts` with no Astro imports, so plain Node can unit-test them. The dark-mode toggle is the one React island. Everything else is `.astro` with a little plain `<script>`.

**Tech Stack:** Astro 7.2, @astrojs/react 6 (React 19), Tailwind CSS 4 via `@tailwindcss/vite`, `@tailwindcss/typography`, `@astrojs/check`, Node's built-in `node:test`, Cloudflare (wrangler static assets).

**Spec:** `docs/superpowers/specs/2026-10-28-astro-rebuild-design.md`. Read it first; this plan argues from it.

**Old site:** Clone it once for reference and copying: `git clone --depth 1 https://github.com/hurryclear/hurryclear-web.git "$SCRATCH/old-site"`, where `$SCRATCH` is your scratch directory. Below, `OLD/` means that clone. Its Tailwind classes in `OLD/layouts/**` are the visual source of truth. Copy class lists verbatim unless a step says otherwise.

## Global Constraints

- Work on branch `astro-rebuild`, created from `main` at `fa75259`. Never push to or deploy hurryclear.com.
- Node `>=22.12.0` (from `package.json` engines). The dev machine runs Node 24, which runs `.ts` test files natively.
- Keep `@astrojs/react` and React. Do not add libraries beyond those listed in Tech Stack.
- Import through the tsconfig aliases `@components/*`, `@layouts/*` and `@assets/*`. Add `@lib/*` → `./src/lib/*` and `@config` → `./src/config.ts`. Use relative imports only inside `src/content.config.ts`, and in test files because Node doesn't resolve the aliases.
- Every file starts with a short comment saying what it is and where it's used. Also add *why* comments on Astro- or React-specific things: frontmatter fence, `Astro.props`, `client:load`, `getStaticPaths`, `render()`, `set:html`. Match the density of the old Hugo partials and don't comment the obvious.
- Mark each placeholder with `TODO(hur):` plus one line saying what goes there and which Astro docs page to read.
- Copy from the spec: site title `Hur Jiang`. Page `<title>` is `"{Title} :: Hur Jiang"`, or just `Hur Jiang` on home. Date format `Aug 27, 2026`. Accent colour `emerald-600`.
- Source repo for the footer "Source" link: `https://github.com/hurryclear/website`, branch `main`.
- `astro.config.mjs`: `site: "https://hurryclear.com"`, no `base`, `trailingSlash: "ignore"`.
- Commit after every task with a conventional message ending in `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **localStorage blocked** (private mode or strict browser settings). The page must still render in the OS theme, and clicking the toggle must still switch themes for the session without throwing. Tests in Task 3.
2. **Category or tag names with capitals, spaces or Chinese** (`"Learning in Public"`, `"数据"`). URLs stay stable and readable, and `Astro`/`astro` merge into one term with one count. Tests in Task 2.
3. **Dates near midnight / builder timezone.** `date = 2026-08-27` renders "Aug 27, 2026" on any machine, including a Cloudflare build in UTC and Hur's laptop in Germany. Test in Task 2.
4. **Draft posts.** `draft: true` posts are absent from the production build: no list entry, no page, no category count. Tests in Task 2 (helper) and Task 5 (fixture).
5. **Unknown URLs on Cloudflare.** `/does-not-exist` serves the styled 404 page with status 404. `dist/404.html` must exist and `wrangler.jsonc` must use `"not_found_handling": "404-page"`. Tests in Tasks 6 and 7.

---

## File Structure

```
astro.config.mjs            site, integrations (react), vite plugin (tailwind)
tsconfig.json               + @lib/*, @config aliases
package.json                + scripts: check, test, test:unit, test:build
wrangler.jsonc              Cloudflare static assets from ./dist
README.md                   rewritten: "How this site works"
src/config.ts               SITE, MAIN_NAV, FOOTER_NAV, SOCIAL_LINKS (the old hugo.yaml params)
src/i18n/ui.ts              UI strings + t(key); zh-cn placeholder
src/content.config.ts       collections: posts, pages
src/content/posts/hello-world.md
src/content/pages/{home,about,privacy}.md
src/lib/content-utils.ts    pure helpers (unit-tested)
src/lib/posts.ts            getPublishedPosts(), getTerms() — wraps astro:content
src/styles/global.css       Tailwind entry + ported main.css rules
src/assets/images/profile-avatar.png
src/assets/icons/*.svg      copied from OLD/assets/icons
src/layouts/BaseLayout.astro
src/components/Icon.astro
src/components/Header.astro       site name + Menu + search link + ThemeToggle
src/components/Menu.astro         main nav + mobile dropdown <script>
src/components/ThemeToggle.tsx    React island
src/components/Footer.astro
src/components/SocialLinks.astro
src/components/ProfileCard.astro
src/components/CategoryRail.astro
src/components/Prose.astro        prose wrapper for rendered Markdown
src/components/PostList.astro     list used by /posts/ and term pages
src/components/PageHeading.astro  h1 + optional description
src/pages/index.astro
src/pages/about.astro
src/pages/privacy.astro
src/pages/posts/index.astro
src/pages/posts/[slug].astro
src/pages/categories/index.astro
src/pages/categories/[term].astro
src/pages/tags/index.astro
src/pages/tags/[term].astro
src/pages/search.astro            placeholder
src/pages/404.astro
tests/content-utils.test.ts       unit tests (node:test)
tests/build.test.mjs              assertions on dist/ HTML after `astro build`
tests/helpers.mjs                 readPage(path) -> string from dist
```

Delete (they're preserved in commit `56a7a8c`): `src/layouts/Layout.astro`, `src/components/Welcome.astro`, `Navigation.astro`, `Social.astro`, `src/pages/blog.astro`, `src/pages/500.astro`, `src/scripts/`, `src/content/blog/`, `src/assets/astro.svg`, `src/assets/background.svg`. `Header`, `Footer`, `Menu`, `BaseLayout`, `about.astro`, `404.astro` and `global.css` get rewritten in place. Keep `public/favicon.svg` and `public/favicon.ico`.

---

### Task 1: Tooling, cleanup and test harness

**Files:**
- Modify: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`, `src/pages/index.astro`
- Delete: the files listed above
- Create: `tests/helpers.mjs`, `tests/build.test.mjs`

**Interfaces:**
- Produces: `npm test` runs `test:unit` (`node --test tests/*.test.ts`) and then `test:build` (`astro build && node --test tests/*.test.mjs`). `npm run check` runs `astro check`. `readPage(path: string): string` in `tests/helpers.mjs` returns the contents of `dist/<path>` (for `"posts/"`, read `dist/posts/index.html`). It throws if the file is missing. `src/styles/global.css` is the single stylesheet, and later tasks import it only from `BaseLayout`.

- [ ] **Step 1: Create the branch.** `git switch -c astro-rebuild`

- [ ] **Step 2: Install tooling.** Run `npx astro add tailwind --yes`. This adds `@tailwindcss/vite` to `astro.config.mjs` and creates or overwrites `src/styles/global.css`. Then run `npm i -D @tailwindcss/typography @astrojs/check typescript`.

- [ ] **Step 3: Delete the tutorial files** listed under File Structure.

- [ ] **Step 4: Write the failing build test** in `tests/build.test.mjs`:

```js
test('home page builds and links a stylesheet containing prose and dark styles', () => {
  const html = readPage('');
  const href = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/)?.[1];
  assert.ok(href, 'stylesheet link');
  const css = readFileSync(join('dist', href), 'utf8');
  assert.match(css, /\.prose\b/);
  assert.match(css, /\.dark/);            // class-based dark variant is compiled
});
```

Add the scripts to `package.json`. Set `"test:unit": "TZ=America/Los_Angeles node --test tests/*.test.ts"`. The negative UTC offset makes a non-UTC date bug show up. No unit test file exists until Task 2, so run only `test:build` in this task.

- [ ] **Step 5: Run it and confirm it fails.** Run `npm run test:build`. Expected: FAIL, because there's no prose class yet and possibly no stylesheet link.

- [ ] **Step 6: Port the styles into `src/styles/global.css`.** It starts with `@import "tailwindcss"; @plugin "@tailwindcss/typography"; @custom-variant dark (&:where(.dark, .dark *));`. Then copy the two `@layer base` blocks and the `.site-footer*` `@layer components` block from `OLD/assets/css/main.css` verbatim. Replace `@config` and the `prose-quoteless` JS config with plain CSS that sets `content: none` on `.prose-quoteless :where(blockquote p:first-of-type)::before/::after` and `.prose-quoteless :where(code)::before/::after`.

- [ ] **Step 7: Make a temporary `index.astro`** that imports `global.css` and renders `<article class="prose prose-slate dark:prose-invert prose-quoteless">Hello</article>` inside `<html><body>`. Task 3 replaces it. In `astro.config.mjs`, set `site` and remove the commented `base`. Add the `@lib/*` and `@config` aliases to `tsconfig.json`.

- [ ] **Step 8: Run the tests and confirm they pass.** `npm run test:build` should PASS, and `npm run check` should report 0 errors.

- [ ] **Step 9: Commit.** `git commit -am "chore: set up Tailwind 4, tests, and remove tutorial code"`. Include new and deleted files with `git add -A` first.

---

### Task 2: Site config, UI strings, content helpers and collections

**Files:**
- Create: `src/config.ts`, `src/i18n/ui.ts`, `src/lib/content-utils.ts`, `src/lib/posts.ts`, `src/content.config.ts`, `src/content/posts/hello-world.md`, `src/content/pages/home.md`, `about.md`, `privacy.md`, `src/assets/images/profile-avatar.png`, `src/assets/icons/*.svg`
- Test: `tests/content-utils.test.ts`

**Interfaces:**
- Produces, in `src/config.ts`:
  - `SITE = { title: 'Hur Jiang', description: 'personal site', author: { name, email }, bio, repoUrl: 'https://github.com/hurryclear/website', repoBranch: 'main', since: 2026 }`. Copy `bio` from `OLD/hugo.yaml` `params.profile.bio`.
  - `MAIN_NAV: { label: string; href: string }[]` = Home `/`, Posts `/posts/`, About `/about/`.
  - `FOOTER_NAV`, which has Privacy `/privacy/`. The Source link is computed in the Footer.
  - `SOCIAL_LINKS: { title: string; icon: IconName; href: string }[]` for GitHub `https://github.com/hurryclear` and LinkedIn `https://www.linkedin.com/in/hurryclear/`.
- Produces `src/i18n/ui.ts`: `ui = { en: {...} } as const` and `t(key: keyof typeof ui.en): string`. Keys: `nav.openMenu`, `theme.toggle`, `search.title`, `search.comingSoon`, `rail.categories`, `rail.noCategories`, `rail.allCategories`, `profile.more`, `list.empty`, `404.title`, `404.sorry`, `404.home`. Copy the English values from `OLD/i18n/en.yaml`. Use `"No categories yet."`, `"All categories"`, `"More about me"` and `"Nothing here yet."`, and add `"Search is coming soon."`. Add a `TODO(hur):` saying zh-cn goes here, plus where `i18n` goes in `astro.config.mjs` (docs: Internationalization guide).
- Produces `src/lib/content-utils.ts`, which has no Astro imports:
  - `formatDate(date: Date): string` returns `"Aug 27, 2026"`. It formats in UTC with `Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })`.
  - `isoDate(date: Date): string` returns `"2026-08-27"`.
  - `slugifyTerm(name: string): string` lowercases, replaces each run of characters that aren't Unicode letters or numbers (`/[^\p{L}\p{N}]+/gu`) with one `-`, and trims `-` from both ends.
  - `countTerms(names: string[][]): { name: string; slug: string; count: number }[]` takes one array of names per post and groups them by slug. `name` is the first spelling seen. A post that repeats a term counts once. Results sort by count descending, then name ascending.
  - `isPublished(entry: { data: { draft: boolean } }, isProd: boolean): boolean` returns `!isProd || !entry.data.draft`.
  - `byDateDesc(a, b)`, a comparator on `data.date`.
- Produces `src/lib/posts.ts`:
  - `getPublishedPosts(): Promise<CollectionEntry<'posts'>[]>` filters with `isPublished(e, import.meta.env.PROD)` and sorts with `byDateDesc`.
  - `getTerms(kind: 'categories' | 'tags'): Promise<ReturnType<typeof countTerms>>`.
  - `postsWithTerm(posts, kind, slug)` filters to the posts that have a term with that slug.
- Produces collections:
  - `posts` uses `glob({ pattern: '**/*.md', base: './src/content/posts' })`. Its schema is `title: string`, `date: z.coerce.date()`, `description?: string`, `draft: boolean default false`, `categories: string[] default []`, `tags: string[] default []`.
  - `pages` uses `glob` on `./src/content/pages`, with `title: string` (may be `''`) and `description?: string`.
  - Entry ids: `hello-world`, `home`, `about`, `privacy`.

- [ ] **Step 1: Write the failing unit tests** in `tests/content-utils.test.ts`. Import from `'../src/lib/content-utils.ts'`.

```ts
test('formatDate is timezone-proof', () => {
  assert.equal(formatDate(new Date('2026-08-27')), 'Aug 27, 2026');
  assert.equal(isoDate(new Date('2026-08-27')), '2026-08-27');
});
test('slugifyTerm', () => {
  assert.equal(slugifyTerm('Learning in Public'), 'learning-in-public');
  assert.equal(slugifyTerm('  Astro  '), 'astro');
  assert.equal(slugifyTerm('数据'), '数据');
  assert.equal(slugifyTerm('C++ / Rust!'), 'c-rust');
});
test('countTerms merges case variants and sorts by count', () => {
  assert.deepEqual(countTerms([['Astro', 'NLP'], ['astro'], ['NLP', 'NLP']]), [
    { name: 'Astro', slug: 'astro', count: 2 },
    { name: 'NLP', slug: 'nlp', count: 2 },
  ]);
  assert.deepEqual(countTerms([]), []);
});
test('isPublished hides drafts only in production', () => {
  const draft = { data: { draft: true } };
  assert.equal(isPublished(draft, true), false);
  assert.equal(isPublished(draft, false), true);
});
```

- [ ] **Step 2: Run the tests and confirm they fail.** Run `npm run test:unit`. Expected: FAIL with "Cannot find module".

- [ ] **Step 3: Implement `src/lib/content-utils.ts`** with the signatures above.

- [ ] **Step 4: Run the tests and confirm they pass.** Run `npm run test:unit`. Expected: PASS.

- [ ] **Step 5: Add config, UI strings, collections, content and assets.**
  - Copy `OLD/content/posts/hello-world/index.md` to `src/content/posts/hello-world.md`, converting TOML `+++` to YAML `---`.
  - Copy `OLD/content/_index.md` to `pages/home.md` (title `Home`), `OLD/content/about/index.md` to `pages/about.md` (title `''`, description `About Hur Jiang`), and `OLD/content/privacy/index.md` to `pages/privacy.md`. Keep the bodies verbatim.
  - Copy `OLD/assets/images/profile-avatar.png` and `OLD/assets/icons/*.svg`.
  - Write `src/lib/posts.ts`, `src/config.ts` and `src/i18n/ui.ts`.
  - Export `type IconName` from `src/config.ts` as the union of icon file basenames: `'search' | 'brand-github' | 'brand-linkedin' | 'menu-2' | 'chevron-right' | 'hash' | 'category-2' | 'brightness-down' | 'moon-stars' | 'language' | 'calendar'`.

- [ ] **Step 6: Verify.** Run `npm run check` (0 errors) and `npm test` (all PASS). `astro build` must not report schema errors.

- [ ] **Step 7: Commit.** `feat: add site config, content collections and content helpers`

---

### Task 3: Base layout, header, menu, React theme toggle, footer

**Files:**
- Create or rewrite: `src/layouts/BaseLayout.astro`, `src/components/{Icon,Header,Menu,Footer}.astro`, `src/components/ThemeToggle.tsx`
- Modify: `src/pages/index.astro` (temporary body inside `BaseLayout`; Task 4 finishes it)
- Test: `tests/build.test.mjs`

**Interfaces:**
- Consumes: `SITE`, `MAIN_NAV`, `FOOTER_NAV`, `IconName` from `@config`, `t` from `src/i18n/ui.ts`, and `global.css`.
- Produces:
  - `BaseLayout` props: `{ title?: string; description?: string; rail?: 'profile' | 'categories' | 'none'; sourcePath?: string }`.
    - `title` is omitted on home, which makes `<title>` `Hur Jiang`.
    - `rail` defaults to `'profile'`.
    - `sourcePath` is the repo-relative content file, e.g. `src/content/posts/hello-world.md`. Pages built from a collection entry pass `entry.filePath`. Without `sourcePath`, the footer's Source link points to `SITE.repoUrl`, as the Hugo footer did.
  - `BaseLayout` imports `ProfileCard` and `CategoryRail` directly; it has no named slots. Until Task 4 creates them, render an empty `<aside>` with a plain `TODO` comment, which Task 4 removes.
  - The temporary home page in this task passes `sourcePath="src/content/pages/home.md"`.
  - `Icon.astro` props: `{ name: IconName; class?: string }`. It renders `<i class={class}>` with the SVG inlined. It loads the SVGs with `import.meta.glob('@assets/icons/*.svg', { query: '?raw', import: 'default', eager: true })` and uses `set:html`.
  - `ThemeToggle.tsx`: `export default function ThemeToggle({ label, children }: { label: string; children: ReactNode })`. Children are the two `<Icon>`s, passed from Astro as static HTML. The click handler flips `document.documentElement.classList` `dark` and writes `localStorage.theme`, with the write in `try/catch`. The comment explains `client:load` and why the no-flash script can't be React.
  - Active nav item: `aria-current="page"` plus `text-emerald-600` when `Astro.url.pathname === href`, or when `href !== '/'` and the pathname starts with `href`.

- [ ] **Step 1: Write the failing tests** in `tests/build.test.mjs`:

```js
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
```

Attribute order in the regexes can differ from what Astro emits. If a test fails only because of order, loosen the regex rather than reordering the markup.

- [ ] **Step 2: Run the tests and confirm they fail.** Run `npm run test:build`. Expected: FAIL.

- [ ] **Step 3: Implement the files.**
  - Port the markup and classes from `OLD/layouts/_default/baseof.html`, `partials/header.html`, `partials/menu.html`, `partials/footer.html`, `partials/head.html` and `assets/js/main.js`.
  - Leave out the language switcher. Put a `TODO(hur):` where it would go, pointing to the Internationalization guide.
  - The inline no-flash script uses `<script is:inline>` and comes before the CSS. The comment explains `is:inline`.
  - `Menu.astro` keeps the old toggle-and-outside-click behaviour in a bundled `<script>`. It also sets `aria-expanded` on the button and closes on `Escape`.
  - The footer year is computed at build time.

- [ ] **Step 4: Run the tests and confirm they pass.** Run `npm run test:build` (PASS) and `npm run check` (0 errors).

- [ ] **Step 5: Manual check.** Run `astro dev --background` and open `/`. Check:
  - The toggle switches the theme and the choice persists across a reload.
  - With site data blocked (Chrome: Settings → Site data → block for localhost), the page loads in the OS theme, toggling works, and the console shows no errors.
  - At under 768px width, the hamburger opens the menu, an outside click closes it, and so does Esc.

  Then run `astro dev stop`.

- [ ] **Step 6: Commit.** `feat: add base layout, header, menu, React theme toggle and footer`

---

### Task 4: Right rail and plain pages (home, about, privacy)

**Files:**
- Create: `src/components/{SocialLinks,ProfileCard,CategoryRail,Prose,PageHeading}.astro`, `src/pages/privacy.astro`
- Rewrite: `src/pages/index.astro`, `src/pages/about.astro`
- Modify: `src/layouts/BaseLayout.astro` (render the rail)
- Test: `tests/build.test.mjs`

**Interfaces:**
- Consumes: `getEntry('pages', id)` and `render()` from `astro:content`, `getTerms('categories')`, `SOCIAL_LINKS`, `SITE`, `t`, `Icon`.
- Produces:
  - `Prose.astro` wraps its slot in `div.prose.prose-slate.dark:prose-invert.prose-quoteless.max-w-none`.
  - `PageHeading.astro` props: `{ title: string; description?: string }`. It renders the h1 and description with the classes from `OLD/layouts/_default/single.html`, and renders no h1 when `title` is `''`.
  - `SocialLinks.astro` has no props.
  - `ProfileCard.astro` has no props. Its avatar uses `<Image src={avatar} width={256} format="webp" quality={85} class="profile-avatar rounded-full ...">` from `astro:assets`.
  - `CategoryRail.astro` has no props and links each term to `/categories/<slug>/`.
  - About's `<title>` is `About :: Hur Jiang` even though `title` is `''` (`title || 'About'`).

- [ ] **Step 1: Write the failing tests:**

```js
test('home renders essay and profile rail', () => {
  const html = readPage('');
  assert.match(html, /I start the blog because I’?'?m tired/);
  assert.match(html, /<img[^>]+class="[^"]*profile-avatar[^"]*"[^>]+src="[^"]+\.webp"/);
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
```

- [ ] **Step 2: Run the tests and confirm they fail.** Run `npm run test:build`. Expected: FAIL.

- [ ] **Step 3: Implement.** Port the classes from `OLD/layouts/partials/{profile-card,categories,social_media}.html` and `OLD/layouts/index.html`. `BaseLayout` renders the rail as `hidden lg:block` → `sticky top-24`, as in `baseof.html`. With `rail='none'`, it renders the main content without the grid.

- [ ] **Step 4: Run the tests and confirm they pass.** `npm test` should PASS and `npm run check` should report 0 errors.

- [ ] **Step 5: Commit.** `feat: add profile card, category rail, home, about and privacy pages`

---

### Task 5: Posts list, single post, taxonomy pages

**Files:**
- Create: `src/components/PostList.astro`, `src/pages/posts/index.astro`, `src/pages/posts/[slug].astro`, `src/pages/categories/index.astro`, `src/pages/categories/[term].astro`, `src/pages/tags/index.astro`, `src/pages/tags/[term].astro`
- Test: `tests/build.test.mjs`

**Interfaces:**
- Consumes: `getPublishedPosts`, `getTerms`, `postsWithTerm`, `formatDate`, `isoDate`, `slugifyTerm`, `Prose`, `PageHeading`, `Icon`.
- Produces:
  - `PostList.astro` props: `{ posts: CollectionEntry<'posts'>[] }`. It renders `t('list.empty')` when the list is empty.
  - `[slug].astro`'s `getStaticPaths` maps `getPublishedPosts()` to `{ params: { slug: post.id }, props: { post } }`.
  - `[term].astro`'s `getStaticPaths` maps `getTerms(kind)` to `{ params: { term: slug }, props: { name, posts } }`.
  - All of these pages use `rail="categories"`.
  - Index pages list every term with its count, linking to `/<kind>/<slug>/`.
  - Leave a `TODO(hur):` in `posts/index.astro` about `paginate()` (Routing guide → Pagination).

- [ ] **Step 1: Write the failing tests.** Add a temporary draft fixture, `src/content/posts/zz-draft-fixture.md`, with `title: Draft Fixture`, `date: 2026-09-01`, `draft: true` and `categories: [Secret]`. Delete it in Step 5, after the passing run. The "drafts never ship" test stays: it asserts the fixture's page and category are absent, so it still passes once the fixture is gone.

```js
test('posts list shows hello world with formatted date', () => {
  const html = readPage('posts/');
  assert.match(html, /<title>Posts :: Hur Jiang<\/title>/);
  assert.match(html, /href="\/posts\/hello-world\/"[^>]*>\s*Hello World/);
  assert.match(html, /<time datetime="2026-08-27">Aug 27, 2026<\/time>/);
  assert.match(html, /No categories yet\./);           // rail empty state
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
```

- [ ] **Step 2: Run the tests and confirm they fail.** Run `npm run test:build`. Expected: FAIL.

- [ ] **Step 3: Implement.** Port the classes from `OLD/layouts/_default/list.html` and `OLD/layouts/posts/single.html`. Term links on a post read `#Name` and point to `/categories/<slug>/` or `/tags/<slug>/`.

- [ ] **Step 4: Run the tests and confirm they pass.** `npm test` should PASS and `npm run check` should report 0 errors.

- [ ] **Step 5: Remove the draft fixture and re-run.** Delete `zz-draft-fixture.md` and run `npm test` again. Expected: PASS.

- [ ] **Step 6: Commit.** `feat: add posts list, post pages and category/tag pages`

---

### Task 6: 404 page and search placeholder

**Files:**
- Rewrite: `src/pages/404.astro`
- Create: `src/pages/search.astro`
- Test: `tests/build.test.mjs`

**Interfaces:**
- Consumes: `BaseLayout` with `rail="none"`, and `t`.
- Produces: `dist/404.html` and `dist/search/index.html`.

- [ ] **Step 1: Write the failing tests:**

```js
test('404 page', () => {
  const html = readPage('404.html');
  assert.match(html, /Page not found/);
  assert.match(html, /<a[^>]+href="\/"[^>]*>\s*Go back home/);
  assert.doesNotMatch(html, /profile-avatar/);           // no rail
});
test('search placeholder', () => {
  const html = readPage('search/');
  assert.match(html, /<title>Search :: Hur Jiang<\/title>/);
  assert.match(html, /Search is coming soon\./);
  assert.doesNotMatch(html, /profile-avatar/);
});
```

- [ ] **Step 2: Run the tests and confirm they fail.** Run `npm run test:build`. Expected: FAIL.

- [ ] **Step 3: Implement.**
  - `404.astro` ports the markup from `OLD/layouts/404.html`.
  - `search.astro` uses the heading and the search input row from `OLD/layouts/search/search.html`, with the input `disabled` and the coming-soon text below it.
  - Add a `TODO(hur):` in `search.astro` covering the options for later: build a JSON index with an Astro endpoint (`src/pages/search.json.ts`, Endpoints guide) plus a React island using Fuse.js, *or* Pagefind. Point to the docs for each.

- [ ] **Step 4: Run the tests and confirm they pass.** `npm test` should PASS.

- [ ] **Step 5: Commit.** `feat: add 404 page and search placeholder`

---

### Task 7: Cloudflare config, README, and parity check

**Files:**
- Create: `wrangler.jsonc`
- Rewrite: `README.md`
- Test: `tests/build.test.mjs`

**Interfaces:**
- Produces: `wrangler.jsonc` = `{ "name": "hurryclear-astro", "compatibility_date": "2026-10-01", "assets": { "directory": "./dist", "not_found_handling": "404-page" } }`, with a comment at the top. `wrangler` is not installed as a dependency. The README tells Hur to run `npx wrangler deploy` after `npm run build`, or to connect the repo in the Cloudflare dashboard (Workers & Pages → Create → Import a repository), with build command `npm run build` and `NODE_VERSION` set to `22`. The custom domain is not added.

- [ ] **Step 1: Write the failing test:**

```js
test('cloudflare serves dist with the 404 page', () => {
  const cfg = readFileSync('wrangler.jsonc', 'utf8');
  assert.match(cfg, /"directory":\s*"\.\/dist"/);
  assert.match(cfg, /"not_found_handling":\s*"404-page"/);
  assert.doesNotMatch(cfg, /hurryclear\.com/);
});
```

- [ ] **Step 2: Run the test and confirm it fails.** Run `npm run test:build`. Expected: FAIL (ENOENT).

- [ ] **Step 3: Write `wrangler.jsonc` and the README.** The README has these sections:
  - **How this site works:** a folder map matching the File Structure above, with one line each.
  - **Add a post:** the frontmatter fields from the `posts` schema.
  - **Develop:** `astro dev --background`, `astro dev stop`, `npm test`, `npm run check`.
  - **Deploy (preview only):** as above.
  - **Placeholders:** tell Hur to run `grep -rn "TODO(hur)" src`, and list each placeholder with its docs link.
  - **Adding server features later:** `npx astro add cloudflare` (the `@astrojs/cloudflare` adapter).

- [ ] **Step 4: Run the test and confirm it passes.** `npm test` should PASS and `npm run check` should report 0 errors.

- [ ] **Step 5: Visual parity check.**
  - Run the old site: `cd OLD && npm install && hugo server` on port 1313. Hugo extended 0.165 is required. If Hugo isn't installed, compare against https://hurryclear.com instead.
  - Run the new site with `astro dev --background`.
  - Compare `/`, `/posts/`, `/posts/hello-world/`, `/about/` and `/does-not-exist` at 1280px and 375px, in light and dark mode.
  - Fix any class differences you find, then re-run `npm test`.
  - Run `astro dev stop`.

  Note any difference you chose to keep in the commit message.

- [ ] **Step 6: Placeholder audit.** Run `grep -rn "TODO(hur)" src`. Expected: entries for i18n (`ui.ts`, Header), search (`search.astro`) and pagination (`posts/index.astro`), and nothing else. In particular, Task 3's temporary rail TODO must be gone.

- [ ] **Step 7: Commit.** `docs: add Cloudflare preview config and README`
