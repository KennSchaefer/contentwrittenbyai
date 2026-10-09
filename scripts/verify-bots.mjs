// Checks whether a request that claims to be a known crawler came from that crawler's operator, using the
// IP ranges each operator publishes. Used by crawler-logs.mjs.
// IPs are checked in memory only. Nothing here stores or prints them.
import { BlockList, isIPv6 } from 'node:net';

const GOOGLE = [
  'https://developers.google.com/static/crawling/ipranges/common-crawlers.json',
  'https://developers.google.com/static/crawling/ipranges/special-crawlers.json',
  'https://developers.google.com/static/crawling/ipranges/user-triggered-fetchers.json',
];
const ANTHROPIC = ['https://claude.com/crawling/bots.json'];
const PERPLEXITY = ['https://www.perplexity.com/perplexitybot.json', 'https://www.perplexity.com/perplexity-user.json'];

// Each operator's published IP list, per bot in crawler-logs.mjs. A bot that isn't listed here has no
// published list and is reported as unverifiable.
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
  // Amazon publishes its lists as JSON inside an HTML page (https://developer.amazon.com/amazonbot)
  Amazonbot: { lists: ['https://developer.amazon.com/amazonbot/ip-addresses/'] },
  'Amzn-SearchBot': { lists: ['https://developer.amazon.com/amazonbot/searchbot-ip-addresses/'] },
  'Amzn-User': { lists: ['https://developer.amazon.com/amazonbot/live-ip-addresses/'] },
};

// Every list uses the same {"ipv4Prefix": "..."} / {"ipv6Prefix": "..."} entries, as a JSON file or embedded in a
// page, so the prefixes are read straight from the text. Only these fields are read: Amazon's page also echoes
// the visitor's own IP elsewhere.
const PREFIX = /"(ipv4Prefix|ipv6Prefix)"\s*:\s*"([0-9a-fA-F.:]+)(?:\/(\d{1,3}))?"/g;

const listCache = new Map();
async function blockList(urls) {
  const key = urls.join(' ');
  if (!listCache.has(key)) {
    listCache.set(key, (async () => {
      const list = new BlockList();
      for (const url of urls) {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 (compatible; contentwrittenbyai-metrics)' } });
        if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
        let n = 0;
        for (const [, field, net, bits] of (await res.text()).matchAll(PREFIX)) {
          const type = field === 'ipv6Prefix' ? 'ipv6' : 'ipv4';
          list.addSubnet(net, bits ? Number(bits) : type === 'ipv6' ? 128 : 32, type);
          n++;
        }
        // An empty list means the format changed, not that every request is fake
        if (!n) throw new Error(`${url}: no IP prefixes found`);
      }
      return list;
    })());
  }
  return listCache.get(key);
}

// Returns true (verified), false (claimed but not from the operator), or null (no published list, or the list
// couldn't be read, so we can't say either way).
export async function verifyBot(bot, ip) {
  const how = VERIFY[bot];
  if (!how) return null;
  try {
    return (await blockList(how.lists)).check(ip, isIPv6(ip) ? 'ipv6' : 'ipv4');
  } catch (e) {
    console.error(`bot verification for ${bot} unavailable: ${e.message}`);
    return null;
  }
}
