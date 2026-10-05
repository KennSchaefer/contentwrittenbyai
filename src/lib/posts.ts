import { getCollection, type CollectionEntry } from 'astro:content';
import { SECTIONS, type Section } from '../consts';

type Post = CollectionEntry<'posts'>;

// Preview builds (preview.contentwrittenbyai.com) include drafts, are noindexed and load no analytics
export const IS_PREVIEW = import.meta.env.PUBLIC_PREVIEW === 'true';

// Published posts, newest first. Drafts show only in `astro dev` and preview builds.
export async function getPosts(section?: Section) {
  const posts = await getCollection(
    'posts',
    ({ data }) => (import.meta.env.DEV || IS_PREVIEW || !data.draft) && (!section || data.category === section),
  );
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

// Posts live in their section's folder, e.g. /guides/<slug>/
export const postUrl = (post: Post) => `${SECTIONS[post.data.category].path}${post.id}/`;

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function readingMinutes(post: Post) {
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

// Totals across the published posts' ledgers, for the Lab Notebook panels
export async function siteStats() {
  const posts = await getPosts();
  const ids = new Set(posts.map((p) => p.id.split('/').pop()));
  const ledgers = (await getCollection('ledgers')).filter((l) => ids.has(l.id));
  const claims = ledgers.flatMap((l) => l.data.claims);
  return {
    articles: posts.length,
    claimsVerified: claims.filter((c) => c.used).length,
    claimsCut: claims.filter((c) => !c.used && c.decision === 'rejected').length,
  };
}

// Turns <mark data-claim="c1">...</mark> in rendered post HTML into an underlined claim
// followed by a tag linking to that claim's line in the source list.
export function linkClaims(html: string) {
  return html.replace(
    /<mark data-claim="([a-z0-9-]+)">([\s\S]*?)<\/mark>/g,
    (_, id: string, text: string) =>
      `<mark class="claim">${text}</mark><a class="claim-tag" href="#claim-${id}" aria-label="Source for this claim (${id.toUpperCase()})">${id.toUpperCase()}</a>`,
  );
}
