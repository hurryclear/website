// Site-wide constants: title, bio, navigation and social links. Used by layouts, header, footer and profile card.

// Must match the file names (without .svg) in src/assets/icons/.
export type IconName =
  | 'search' | 'brand-github' | 'brand-linkedin' | 'menu-2' | 'chevron-right' | 'hash'
  | 'category-2' | 'brightness-down' | 'moon-stars' | 'language' | 'calendar';

export const SITE = {
  title: 'Hur Jiang',
  description: 'personal site',
  author: { name: 'Hur Jiang', email: 'hurjiangde@gmail.com' },
  bio: 'Data Engineer & Software Developer @Webis Group // Recent CS graduate passionate about data mining, software development, and NLP research',
  repoUrl: 'https://github.com/hurryclear/website',
  repoBranch: 'main',
};

export const MAIN_NAV: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Posts', href: '/posts/' },
  { label: 'About', href: '/about/' },
];

// The "Source" link is computed in the Footer from SITE.repoUrl.
export const FOOTER_NAV: { label: string; href: string }[] = [
  { label: 'Privacy', href: '/privacy/' },
];

export const SOCIAL_LINKS: { title: string; icon: IconName; href: string }[] = [
  { title: 'GitHub', icon: 'brand-github', href: 'https://github.com/hurryclear' },
  { title: 'LinkedIn', icon: 'brand-linkedin', href: 'https://www.linkedin.com/in/hurryclear/' },
];
