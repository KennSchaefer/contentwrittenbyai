// Weekly Lab Notebook snapshot: pulls last week's numbers from Search Console, GA4 and SEMrush
// and writes src/content/metrics/<week-end>.json. Runs in GitHub Actions (.github/workflows/metrics.yml).
//
// A source that isn't configured or fails is recorded as such in the snapshot, never filled with guesses.
// Env: GA4_PROPERTY_ID, SEMRUSH_API_KEY, GSC_SITE (default sc-domain:contentwrittenbyai.com),
// LOGS_DIR (a local copy of the server's access logs, for crawler counts; see crawler-logs.mjs).
// Google auth comes from Application Default Credentials (keyless GitHub OIDC in CI).
import { writeFileSync, existsSync } from 'node:fs';
import { GoogleAuth } from 'google-auth-library';
import { crawlerCounts } from './crawler-logs.mjs';

const DOMAIN = 'contentwrittenbyai.com';
const ORIGIN = `https://${DOMAIN}`;
const GSC_SITE = process.env.GSC_SITE || `sc-domain:${DOMAIN}`;

// The most recent full Monday-to-Sunday week that ended at least 3 days ago (Search Console lags 2 to 3 days)
function lastFullWeek(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - 3);
  const dow = d.getUTCDay(); // 0 = Sunday
  const end = new Date(d);
  end.setUTCDate(d.getUTCDate() - (dow === 0 ? 0 : dow)); // back to the latest Sunday
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 6);
  const iso = (x) => x.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end) };
}

const week = process.env.WEEK_END
  ? (() => { const e = new Date(process.env.WEEK_END); const s = new Date(e); s.setUTCDate(e.getUTCDate() - 6); return { start: s.toISOString().slice(0, 10), end: process.env.WEEK_END }; })()
  : lastFullWeek();

const pathOf = (url) => {
  try {
    const u = new URL(url, ORIGIN);
    return u.hostname.replace(/^www\./, '') === DOMAIN ? u.pathname : null;
  } catch {
    return null;
  }
};

let auth;
async function googleFetch(url, body, scope) {
  auth ??= new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/webmasters.readonly', 'https://www.googleapis.com/auth/analytics.readonly'] });
  const client = await auth.getClient();
  const res = await client.request({ url, method: 'POST', data: body });
  return res.data;
}

// ---- Search Console ----
async function searchConsole() {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`;
  const base = { startDate: week.start, endDate: week.end, dataState: 'final' };
  const [byPage, byPageQuery, byDate, total] = await Promise.all([
    googleFetch(url, { ...base, dimensions: ['page'], rowLimit: 1000 }),
    googleFetch(url, { ...base, dimensions: ['page', 'query'], rowLimit: 5000 }),
    googleFetch(url, { ...base, dimensions: ['date'], rowLimit: 31 }),
    googleFetch(url, { ...base, rowLimit: 1 }),
  ]);
  const pages = {};
  for (const r of byPage.rows ?? []) {
    const path = pathOf(r.keys[0]);
    if (path) pages[path] = { clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position };
  }
  for (const r of byPageQuery.rows ?? []) {
    const path = pathOf(r.keys[0]);
    const p = path && pages[path];
    if (!p) continue;
    const better = !p.topQuery || r.clicks > p.topQuery.clicks || (r.clicks === p.topQuery.clicks && r.impressions > p.topQuery.impressions);
    if (better) p.topQuery = { query: r.keys[1], clicks: r.clicks, impressions: r.impressions, position: r.position };
  }
  const t = total.rows?.[0];
  return {
    site: t ? { clicks: t.clicks, impressions: t.impressions, ctr: t.ctr, position: t.position } : { clicks: 0, impressions: 0 },
    daily: (byDate.rows ?? []).map((r) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
    pages,
  };
}

// ---- GA4 ----
async function ga4() {
  const id = process.env.GA4_PROPERTY_ID;
  if (!id) throw new Error('GA4_PROPERTY_ID not set');
  const data = await googleFetch(`https://analyticsdata.googleapis.com/v1beta/properties/${id}:runReport`, {
    dateRanges: [{ startDate: week.start, endDate: week.end }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }, { name: 'engagedSessions' }, { name: 'userEngagementDuration' }],
    limit: 1000,
  });
  const pages = {};
  let views = 0, sessions = 0;
  for (const r of data.rows ?? []) {
    const path = r.dimensionValues[0].value;
    const [v, s, e, dur] = r.metricValues.map((m) => Number(m.value));
    views += v; sessions += s;
    pages[path] = { views: v, sessions: s, engagedSessions: e, avgEngagementSeconds: s ? Math.round(dur / s) : 0 };
  }
  return { site: { views, sessions }, pages };
}

// ---- SEMrush ----
async function semrush() {
  const key = process.env.SEMRUSH_API_KEY;
  if (!key) throw new Error('SEMRUSH_API_KEY not set');
  const params = new URLSearchParams({
    type: 'domain_organic', key, domain: DOMAIN, database: 'us', display_limit: '500',
    // keyword, position, volume, URL, SERP features on the keyword, SERP features where the domain appears
    export_columns: 'Ph,Po,Nq,Ur,Fk,Fp',
  });
  const res = await fetch(`https://api.semrush.com/?${params}`);
  const text = await res.text();
  if (text.startsWith('ERROR 50')) return { site: { keywords: 0, top10: 0 }, pages: {} }; // "nothing found": no rankings yet
  if (!res.ok || text.startsWith('ERROR')) throw new Error(text.slice(0, 200));
  // Columns come back in export_columns order; the header row is skipped rather than trusted by name
  const rows = text.trim().split(/\r?\n/).slice(1).map((l) => {
    const [keyword, position, volume, url, keywordFeatures, domainFeatures] = l.split(';');
    return { keyword, position: Number(position), volume: Number(volume), url, keywordFeatures, domainFeatures };
  });
  const pages = {};
  for (const r of rows) {
    const path = pathOf(r.url);
    if (!path) continue;
    const p = (pages[path] ??= { keywords: 0, top10: 0, best: null, serpFeatures: [] });
    p.keywords++;
    if (r.position <= 10) p.top10++;
    if (!p.best || r.position < p.best.position) p.best = { keyword: r.keyword, position: r.position, volume: r.volume };
    // SEMrush feature codes where this domain itself appears (e.g. in an AI Overview); mapped to names on the Lab page
    for (const f of (r.domainFeatures ?? '').split(',').filter(Boolean)) if (!p.serpFeatures.includes(f)) p.serpFeatures.push(f);
  }
  return { site: { keywords: rows.length, top10: rows.filter((r) => r.position <= 10).length }, pages };
}

async function attempt(name, fn) {
  try {
    return { ok: true, ...(await fn()) };
  } catch (e) {
    console.error(`${name}: ${e.message}`);
    return { ok: false, error: String(e.message).slice(0, 300) };
  }
}

async function crawlers() {
  if (!process.env.LOGS_DIR) throw new Error('LOGS_DIR not set');
  return crawlerCounts(process.env.LOGS_DIR, week);
}

const [gsc, ga, sem, crawl] = await Promise.all([
  attempt('gsc', searchConsole), attempt('ga4', ga4), attempt('semrush', semrush), attempt('logs', crawlers),
]);

const paths = new Set([...Object.keys(gsc.pages ?? {}), ...Object.keys(ga.pages ?? {}), ...Object.keys(sem.pages ?? {})]);
const snapshot = {
  week,
  collectedAt: new Date().toISOString(),
  sources: {
    searchConsole: gsc.ok ? { ok: true, property: GSC_SITE } : { ok: false, error: gsc.error },
    ga4: ga.ok ? { ok: true } : { ok: false, error: ga.error },
    semrush: sem.ok ? { ok: true, database: 'us' } : { ok: false, error: sem.error },
    serverLogs: crawl.ok ? { ok: true, files: crawl.files } : { ok: false, error: crawl.error },
  },
  site: { ...(gsc.site ?? {}), ...(ga.site ?? {}), ...(sem.site ?? {}) },
  daily: gsc.daily ?? [],
  // Requests by user agent, from the server's access logs (EXP-001). User agents can be spoofed.
  ...(crawl.ok && { crawlers: { llmsTxt: crawl.llmsTxt, bots: crawl.bots, otherBots: crawl.otherBots, visitors: crawl.visitors } }),
  pages: [...paths].sort().map((path) => ({
    path,
    ...(gsc.pages?.[path] && { search: gsc.pages[path] }),
    ...(ga.pages?.[path] && { analytics: ga.pages[path] }),
    ...(sem.pages?.[path] && { rankings: sem.pages[path] }),
  })),
};

// Every source failed: write nothing and fail the run, rather than publish an empty week as if it were real
if (!gsc.ok && !ga.ok && !sem.ok) {
  console.error('All sources failed; no snapshot written.');
  process.exit(1);
}

const out = `src/content/metrics/${week.end}.json`;
if (existsSync(out) && !process.env.OVERWRITE) {
  console.log(`${out} already exists; set OVERWRITE=1 to replace it`);
  process.exit(0);
}
writeFileSync(out, JSON.stringify(snapshot, null, 2) + '\n');
console.log(`wrote ${out}: ${snapshot.pages.length} pages; sources ok: gsc=${gsc.ok} ga4=${ga.ok} semrush=${sem.ok}`);
