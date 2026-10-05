// Shared structured data (schema.org JSON-LD). Base.astro emits one @graph per page;
// pages add their own nodes (Article, ItemList, Dataset...) through its `schema` prop.
import type { CollectionEntry } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION, EDITOR_PROFILE } from '../consts';
import { postUrl } from './posts';

export const SITE = 'https://contentwrittenbyai.com';
export const abs = (path: string) => new URL(path, SITE).href;

export const ids = {
  website: abs('/#website'),
  organization: abs('/#organization'),
  editor: abs(`${EDITOR_PROFILE.path}#person`),
};

export const organization = () => ({
  '@type': 'Organization',
  '@id': ids.organization,
  name: SITE_TITLE,
  url: abs('/'),
  logo: { '@type': 'ImageObject', url: abs('/og/logo.png'), width: 512, height: 512 },
  founder: { '@id': ids.editor },
});

export const website = () => ({
  '@type': 'WebSite',
  '@id': ids.website,
  url: abs('/'),
  name: SITE_TITLE,
  description: SITE_DESCRIPTION,
  publisher: { '@id': ids.organization },
});

export const editorPerson = (full = false) => ({
  '@type': 'Person',
  '@id': ids.editor,
  name: EDITOR_PROFILE.name,
  url: abs(EDITOR_PROFILE.path),
  ...(full && {
    jobTitle: EDITOR_PROFILE.jobTitle,
    image: abs(EDITOR_PROFILE.photo.fallback),
    sameAs: [EDITOR_PROFILE.linkedin],
    worksFor: { '@type': 'Organization', name: EDITOR_PROFILE.employer.name, url: EDITOR_PROFILE.employer.url },
  }),
});

// A list of posts, for section, archive and Lab Notebook pages
export const itemList = (posts: CollectionEntry<'posts'>[]) => ({
  '@type': 'ItemList',
  numberOfItems: posts.length,
  itemListElement: posts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(postUrl(p)), name: p.data.title })),
});

// Pulls question/answer pairs from an article's "FAQ" section (H2 "FAQ", then an H3 per question)
export function faqFromHtml(html: string) {
  const faq = html.split(/<h2[^>]*>FAQ<\/h2>/i)[1];
  if (!faq) return null;
  const text = (s: string) =>
    s.replace(/<a class="claim-tag"[^>]*>.*?<\/a>/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const pairs = [...faq.split(/<h2/)[0].matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|$)/g)]
    .map(([, q, a]) => ({ q: text(q), a: text(a) }))
    .filter((p) => p.q && p.a);
  if (!pairs.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: pairs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}
