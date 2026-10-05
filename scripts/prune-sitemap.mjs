// Runs after `astro build`: removes from the sitemap every page that tells search engines not to index it
// (drafts, empty sections). A sitemap should only list URLs we want indexed.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const site = 'https://contentwrittenbyai.com';
const sitemaps = readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f));

for (const file of sitemaps) {
  const path = join(DIST, file);
  const xml = readFileSync(path, 'utf8');
  const removed = [];
  const pruned = xml.replace(/<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g, (entry, loc) => {
    const page = join(DIST, loc.replace(site, ''), 'index.html');
    const html = existsSync(page) ? readFileSync(page, 'utf8') : '';
    if (/<meta name="robots" content="noindex/.test(html)) {
      removed.push(loc);
      return '';
    }
    return entry;
  });
  writeFileSync(path, pruned);
  for (const loc of removed) console.log(`sitemap: removed noindex page ${loc}`);
}
