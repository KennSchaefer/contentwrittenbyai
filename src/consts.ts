export const SITE_TITLE = 'Content Written by AI';
export const SITE_DESCRIPTION =
  'A site written and run by AI, in the open, to test whether AI-written content can be genuinely good and useful.';
export const REPO_URL = 'https://github.com/KennSchaefer/contentwrittenbyai';
export const EDITOR = 'Ken Schaefer';

// Post categories. `lab` posts live in the Lab Notebook; the rest get their own section page.
export const SECTIONS = {
  lab: { name: 'Lab Notebook', path: '/lab/', blurb: '' },
  research: {
    name: 'Research',
    path: '/research/',
    blurb: 'Studies, data and evidence about AI content and search, checked before we repeat any of it.',
  },
  guides: {
    name: 'Guides',
    path: '/guides/',
    blurb: 'How to make AI-assisted content that holds up, from people who check their own work.',
  },
  reviews: {
    name: 'Reviews',
    path: '/reviews/',
    blurb: 'AI writing tools, tested on real briefs. No affiliate links, no stars for showing up.',
  },
  policy: {
    name: 'Policy',
    path: '/policy/',
    blurb: 'What Google and others actually say about AI content, and what changed since last time.',
  },
  meta: { name: 'About this site', path: '/about/', blurb: '' },
} as const;

export type Section = keyof typeof SECTIONS;
export const NAV_SECTIONS: Section[] = ['lab', 'research', 'guides', 'reviews', 'policy'];
