// Counts crawler requests in SiteGround's daily access logs (<domain>-YYYY-MM-DD.gz, nginx format) for EXP-001:
// which bots ask for /llms.txt, compared with robots.txt, the sitemap and ordinary pages, plus visits from agents
// that don't identify as bots (browsers, and anything pretending to be one).
//
// Only aggregate counts leave this script. Raw log lines hold visitor IPs and must never be committed or printed.
// Bots are identified by user agent alone, which can be spoofed. The counts are what agents claimed to be.
//
// Used by collect-metrics.mjs (LOGS_DIR), or on its own for a date range:
//   node scripts/crawler-logs.mjs <logs-dir> <start YYYY-MM-DD> <end YYYY-MM-DD>
import { readdirSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// First match wins, so more specific names come before ones they contain
const BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-CloudVertexBot', 'GoogleOther', 'Googlebot',
  'bingbot', 'Applebot', 'Amazonbot', 'meta-externalagent', 'meta-externalfetcher',
  'DuckAssistBot', 'MistralAI-User', 'cohere-ai', 'Bytespider', 'CCBot', 'YouBot', 'Diffbot',
];
const botOf = (ua) => BOTS.find((b) => ua.toLowerCase().includes(b.toLowerCase())) ?? null;
// Other self-identified automated agents (SEO crawlers, scanners, scripts), labeled by the name they give
const otherBotOf = (ua) => {
  if (!ua || ua === '-') return 'No user agent';
  const named = ua.match(/([A-Za-z][\w.-]*(?:bot|crawler|spider))\b/i);
  if (named) return named[1];
  const tool = ua.match(/^(curl|wget|python-requests|python-urllib|Go-http-client|okhttp|axios|node-fetch|undici|libwww-perl|Java)\b/i)
    ?? ua.match(/\b(HeadlessChrome)\b/);
  return tool ? tool[1] : null;
};
// A page view: a successful GET of an HTML page (folder URL or .html), not an asset
const isPage = (method, path, status) => method === 'GET' && status === '200' && /(\/|\.html)$/.test(path.split('?')[0]);

const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
// <ip> <host> - [09/Sep/2026:07:47:03 +0000] "GET /robots.txt HTTP/1.1" 200 46 "<referrer>" "<user agent>" | ...
const LINE = /^\S+ \S+ \S+ \[(\d{2})\/(\w{3})\/(\d{4}):[^\]]+\] "(\S+) (\S+)[^"]*" (\d{3}) \S+ "[^"]*" "([^"]*)"/;

const kindOf = (path) => {
  const p = path.split('?')[0];
  if (p === '/llms.txt') return 'llmsTxt';
  if (p === '/robots.txt') return 'robotsTxt';
  if (/^\/sitemap[\w-]*\.xml$/.test(p)) return 'sitemap';
  return 'other';
};

const shift = (iso, days) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export function crawlerCounts(dir, { start, end }) {
  // A file is named for the day it was rotated and holds roughly the day before, so read a day either side
  // and keep only requests whose own timestamp falls in the range.
  const files = readdirSync(dir).filter((f) => {
    const m = f.match(/-(\d{4}-\d{2}-\d{2})\.gz$/);
    return m && m[1] >= shift(start, -1) && m[1] <= shift(end, 2);
  });
  if (!files.length) throw new Error(`no log files for ${start} to ${end}`);

  const bots = {};
  const otherBots = {};
  const visitors = { requests: 0, pageViews: 0, llmsTxt: 0 };
  // Who asked for /llms.txt: a bot's name, or "Browser" for agents that don't identify as bots
  const llmsTxt = { requests: 0, byStatus: {}, agents: {} };
  const tally = (table, name, kind) => {
    table[name] ??= { llmsTxt: 0, robotsTxt: 0, sitemap: 0, other: 0 };
    table[name][kind]++;
  };
  for (const f of files) {
    for (const line of gunzipSync(readFileSync(join(dir, f))).toString('utf8').split('\n')) {
      const m = line.match(LINE);
      if (!m) continue;
      const [, dd, mon, yyyy, method, path, status, ua] = m;
      const day = `${yyyy}-${MONTHS[mon]}-${dd}`;
      if (day < start || day > end || (method !== 'GET' && method !== 'HEAD')) continue;
      const kind = kindOf(path);
      const bot = botOf(ua);
      const otherBot = bot ? null : otherBotOf(ua);
      if (kind === 'llmsTxt') {
        llmsTxt.requests++;
        llmsTxt.byStatus[status] = (llmsTxt.byStatus[status] ?? 0) + 1;
        const who = bot ?? otherBot ?? 'Browser';
        llmsTxt.agents[who] = (llmsTxt.agents[who] ?? 0) + 1;
      }
      if (bot) tally(bots, bot, kind);
      else if (otherBot) tally(otherBots, otherBot, kind);
      else {
        visitors.requests++;
        if (kind === 'llmsTxt') visitors.llmsTxt++;
        if (isPage(method, path, status)) visitors.pageViews++;
      }
    }
  }
  const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  return { files: files.length, llmsTxt: { ...llmsTxt, agents: sorted(llmsTxt.agents) }, bots: sorted(bots), otherBots: sorted(otherBots), visitors };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [dir, start, end] = process.argv.slice(2);
  if (!dir || !start || !end) {
    console.error('usage: node scripts/crawler-logs.mjs <logs-dir> <start> <end>');
    process.exit(1);
  }
  console.log(JSON.stringify(crawlerCounts(dir, { start, end }), null, 2));
}
