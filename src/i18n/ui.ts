// UI strings (English only for now) and the t() lookup. Used by components instead of hard-coded text.

// TODO(hur): add the zh-cn strings as a second key next to `en`, and add an `i18n` block
// (defaultLocale, locales) to astro.config.mjs. Read: https://docs.astro.build/en/guides/internationalization/
export const ui = {
  en: {
    'nav.openMenu': 'Open main menu',
    'theme.toggle': 'Toggle dark mode',
    'search.title': 'Search',
    'search.comingSoon': 'Search is coming soon.',
    'rail.categories': 'Categories',
    'rail.noCategories': 'No categories yet.',
    'rail.allCategories': 'All categories',
    'profile.more': 'More about me',
    'list.empty': 'Nothing here yet.',
    '404.title': 'Page not found',
    '404.sorry': 'Sorry, we couldn’t find the page you’re looking for.',
    '404.home': 'Go back home',
  },
} as const;

export function t(key: keyof typeof ui.en): string {
  return ui.en[key];
}
