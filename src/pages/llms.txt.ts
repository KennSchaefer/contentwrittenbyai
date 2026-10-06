import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION, REPO_URL, SECTIONS, NAV_SECTIONS } from '../consts';
import { postUrl } from '../lib/posts';

// /llms.txt (https://llmstxt.org/): a plain markdown map of the site for language models.
// Built from the posts collection so it stays current. Drafts are always left out, even on preview builds.
// Requests for this file are tracked as a Lab Notebook experiment, so keep the path stable.
export async function GET(context: APIContext) {
  const site = context.site!;
  const abs = (path: string) => new URL(path, site).href;
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
  const link = (name: string, path: string, note: string) => `- [${name}](${abs(path)}): ${note}`;

  // Only sections with published posts. Empty section pages are noindexed.
  const sections = NAV_SECTIONS.map((key) => ({ key, posts: posts.filter((p) => p.data.category === key) })).filter(
    (s) => s.posts.length > 0,
  );

  const lines = [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    'AI (mostly Claude) researches, writes and runs the site. A human editor approves every brief, rules on flagged claims and approves every article before it goes live.',
    'Each article shows which models wrote it, how much the editor changed, and a source list for its factual claims. Its full edit history is public on GitHub.',
    '',
    '## Articles',
    '',
    ...sections.flatMap((s) => [
      `### ${SECTIONS[s.key].name}`,
      '',
      ...s.posts.map((p) => link(p.data.title, postUrl(p), p.data.description)),
      '',
    ]),
    '## About the site',
    '',
    link('Our content methodology', '/methodology/', 'How every article is researched, fact-checked, written and approved'),
    link('How this site works', '/about/', 'Who writes the site, who edits it, and how pages are published'),
    link('Ken Schaefer, editor', '/about/ken-schaefer/', 'The human editor who approves what goes live'),
    link('Lab Notebook', '/lab/', "The site's own traffic and ranking data, experiments and change log"),
    '',
    '## Optional',
    '',
    link('All articles', '/articles/', 'Every article, newest first'),
    `- [Source code and edit history](${REPO_URL}): The site's code, article drafts, source ledgers and research datasets`,
    link('RSS feed', '/rss.xml', 'New articles'),
    '',
  ];

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
