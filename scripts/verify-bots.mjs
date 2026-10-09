// Checks whether a request that claims to be a known crawler came from that crawler's operator, using the
// IP ranges each operator publishes, or reverse DNS where that's the documented method. Used by crawler-logs.mjs.
// IPs are checked in memory only. Nothing here stores or prints them.
import { BlockList, isIPv6 } from 'node:net';
import { reverse, lookup } from 'node:dns/promises';

const GOOGLE = [
  'https://developers.google.com/static/crawling/ipranges/common-crawlers.json',
  'https://developers.google.com/static/crawling/ipranges/special-crawlers.json',
  'https://developers.google.com/static/crawling/ipranges/user-triggered-fetchers.json',
];
const ANTHROPIC = ['https://claude.com/crawling/bots.json'];
const PERPLEXITY = ['https://www.perplexity.ai/perplexitybot.json', 'https://www.perplexity.ai/perplexity-user.json'];

// How each bot in crawler-logs.mjs is verified: published IP lists, or reverse DNS (forward-confirmed) suffixes.
// A bot that isn't listed here has no documented verification method and is reported as unverifiable.
export const VERIFY = {
  GPTBot: { lists: ['https://openai.com/gptbot.json'] },
  'OAI-SearchBot': { lists: ['https://openai.com/searchbot.json'] },
  'ChatGPT-User': { lists: ['https://openai.com/chatgpt-user.json'] },
  ClaudeBot: { lists: ANTHROPIC },
  'Claude-User': { lists: ANTHROPIC },
  'Claude-SearchBot': { lists: ANTHROPIC },
  PerplexityBot: { lists: PERPLEXITY },
  'Perplexity-User': { lists: PERPLEXITY },
  Googlebot: { lists: GOOGLE },
  GoogleOther: { lists: GOOGLE },
  'Google-CloudVertexBot': { lists: GOOGLE },
  bingbot: { lists: ['https://www.bing.com/toolbox/bingbot.json'] },
  Applebot: { lists: ['https://search.developer.apple.com/applebot.json'] },
  CCBot: { lists: ['https://index.commoncrawl.org/ccbot.json'] },
  Amazonbot: { dns: ['.crawl.amazonbot.amazon'] },
};

const listCache = new Map();
async function blockList(urls) {
  const key = urls.join(' ');
  if (!listCache.has(key)) {
    listCache.set(key, (async () => {
      const list = new BlockList();
      for (const url of urls) {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
        for (const p of (await res.json()).prefixes ?? []) {
          const cidr = p.ipv4Prefix ?? p.ipv6Prefix;
          if (!cidr) continue;
          const [net, bits] = cidr.split('/');
          list.addSubnet(net, Number(bits), p.ipv6Prefix ? 'ipv6' : 'ipv4');
        }
      }
      return list;
    })());
  }
  return listCache.get(key);
}

async function dnsMatches(ip, suffixes) {
  try {
    const names = await reverse(ip);
    for (const name of names.filter((n) => suffixes.some((s) => n.endsWith(s)))) {
      const addrs = await lookup(name, { all: true });
      if (addrs.some((a) => a.address === ip)) return true;
    }
  } catch {}
  return false;
}

// Returns true (verified), false (claimed but not from the operator), or null (no method, or the list
// couldn't be fetched, so we can't say either way).
export async function verifyBot(bot, ip) {
  const how = VERIFY[bot];
  if (!how) return null;
  if (how.dns) return dnsMatches(ip, how.dns);
  try {
    return (await blockList(how.lists)).check(ip, isIPv6(ip) ? 'ipv6' : 'ipv4');
  } catch (e) {
    console.error(`bot verification for ${bot} unavailable: ${e.message}`);
    return null;
  }
}
