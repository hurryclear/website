// Dark-mode toggle button. The site's only React island; used by Header.astro.
import type { ReactNode } from 'react';

export default function ThemeToggle({ label, children }: { label: string; children: ReactNode }) {
  // Astro renders React components to static HTML and ships NO JavaScript for them by default.
  // The `client:load` directive in Header.astro tells Astro to also send this component's JS and
  // "hydrate" it (attach this onClick) as soon as the page loads.
  //
  // The initial theme is NOT decided here. That has to happen before first paint, otherwise dark
  // users see a white flash, and React only runs after the page has loaded. So a small inline
  // <script> in BaseLayout's <head> sets the `dark` class early. This component only handles clicks.
  //
  // Both icons come in as `children` (static HTML from Astro) and CSS shows one of them
  // (`dark:hidden` / `hidden dark:block`). So React state never has to know the current theme,
  // and there can be no hydration mismatch between server HTML and the first client render.
  function toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.theme = isDark ? 'dark' : 'light';
    } catch {
      // Storage can be blocked (private mode, site data off). The toggle still works for this visit.
    }
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={toggle}
      className="inline-flex items-center p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600"
    >
      {children}
    </button>
  );
}
