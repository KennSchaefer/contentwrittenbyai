// Enforces the content methodology in code: writing rules, metadata, and source-ledger gates.
// Run with `npm run check`. Exits non-zero on any error; warnings don't block.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { parse as parseYaml } from 'yaml';

const POSTS_DIR = 'src/content/posts';
const LEDGERS_DIR = 'src/content/ledgers';
const rules = JSON.parse(readFileSync('content-rules.json', 'utf8'));

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

function splitFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src, bodyStartLine: 1 };
  return { data: parseYaml(m[1]) ?? {}, body: m[2], bodyStartLine: m[1].split('\n').length + 3 };
}

// Blank out code, URLs and HTML tags so they aren't linted as prose (keeps line numbers intact)
function proseOnly(text) {
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  return text
    .replace(/```[\s\S]*?```/g, blank)
    .replace(/`[^`\n]*`/g, blank)
    .replace(/\]\([^)]*\)/g, (s) => '](' + blank(s.slice(2)))
    .replace(/https?:\/\/\S+/g, blank)
    .replace(/<[^>\n]+>/g, blank);
}

const phraseRes = rules.bannedPhrases.map((p) => ({
  re: new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’]")}\\b`, 'i'),
  label: `banned phrase "${p}"`,
}));
const patternRes = rules.bannedPatterns.map((p) => ({ re: new RegExp(p.pattern, 'i'), label: p.label }));

function lintText(file, text, where, firstLine = 1) {
  text.split('\n').forEach((line, i) => {
    const loc = where === 'body' ? `line ${firstLine + i}` : where;
    for (const [ch, name] of Object.entries(rules.bannedCharacters)) {
      if (line.includes(ch)) err(file, `${loc}: ${name}`);
    }
    for (const { re, label } of [...phraseRes, ...patternRes]) {
      if (re.test(line.replace(/[’]/g, "'"))) err(file, `${loc}: ${label}`);
    }
  });
}

function checkLedger(file, ledger, post) {
  const claims = ledger.claims ?? [];
  const used = claims.filter((c) => c.used);
  for (const c of claims) {
    const id = `claim ${c.id}`;
    if (c.used && !['auto', 'approved'].includes(c.decision)) {
      err(file, `${id} is used in the text but its decision is "${c.decision}"`);
    }
    if (c.decision === 'auto' && !(c.verdict === 'supported' && ['official', 'primary'].includes(c.tier))) {
      err(file, `${id} is "auto" but only supported claims from official or primary sources clear automatically`);
    }
    if (c.decision === 'approved' && ['contradicted', 'unreachable', 'not-found'].includes(c.verdict)) {
      warn(file, `${id} was approved despite a "${c.verdict}" verdict. Make sure the reason explains why`);
    }
    if (!post.draft && c.decision === 'pending') err(file, `${id} is still pending a human decision`);
  }
  if (used.length > 25) warn(file, `${used.length} claims are used. Keep ledgers short and record only the claims the article relies on`);
}

const ledgerFiles = existsSync(LEDGERS_DIR) ? readdirSync(LEDGERS_DIR).filter((f) => f.endsWith('.json')) : [];
const postFiles = readdirSync(POSTS_DIR, { recursive: true }).filter((f) => /\.mdx?$/.test(f));
const postSlugs = new Set();

for (const rel of postFiles) {
  const file = join(POSTS_DIR, rel);
  const slug = rel.replace(/\\/g, '/').replace(/(\/index)?\.mdx?$/, '');
  postSlugs.add(slug);
  const { data, body, bodyStartLine } = splitFrontmatter(readFileSync(file, 'utf8'));
  const draft = data.draft === true;

  // Writing rules apply to metadata too: titles and descriptions appear in search results
  lintText(file, String(data.title ?? ''), 'title');
  lintText(file, String(data.description ?? ''), 'description');
  lintText(file, proseOnly(body), 'body', bodyStartLine);

  const { titleMax, descriptionMin, descriptionMax } = rules.metadata;
  if (data.title?.length > titleMax) warn(file, `title is ${data.title.length} characters (aim for ${titleMax} or fewer)`);
  const dl = data.description?.length ?? 0;
  if (dl < descriptionMin || dl > descriptionMax) warn(file, `description is ${dl} characters (aim for ${descriptionMin}–${descriptionMax})`);

  const ledgerPath = join(LEDGERS_DIR, `${slug.split('/').pop()}.json`);
  const factCheck = data.provenance?.factCheck ?? 'pending';
  if (!draft && factCheck === 'pending') err(file, 'published posts need a completed fact check (provenance.factCheck)');
  if (factCheck === 'checked' && !existsSync(ledgerPath)) err(file, `factCheck is "checked" but there's no ledger at ${ledgerPath}`);
  if (existsSync(ledgerPath)) checkLedger(ledgerPath, JSON.parse(readFileSync(ledgerPath, 'utf8')), { draft });
}

for (const f of ledgerFiles) {
  const slug = basename(f, extname(f));
  if (![...postSlugs].some((s) => s.split('/').pop() === slug)) err(join(LEDGERS_DIR, f), `no post matches this ledger`);
}

for (const w of warnings) console.log(`warn   ${w}`);
for (const e of errors) console.log(`error  ${e}`);
console.log(`\n${postFiles.length} posts, ${ledgerFiles.length} ledgers: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
