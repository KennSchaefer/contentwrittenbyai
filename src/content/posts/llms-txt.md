---
title: "We published an llms.txt. Here's everything that asks for it."
seoTitle: "Does llms.txt Work? We're Logging Every Request to Ours"
description: "What llms.txt is, what Google, OpenAI and Anthropic say about it, and a live, verified tally of every crawler that requests ours."
pubDate: 2026-10-09
category: lab
experiment: EXP-001
status: running
result: "No known AI crawler has asked for our llms.txt. Before it existed, 6 requests came from browsers and a small bot."
tags: [llms-txt, ai-crawlers, server-logs, experiment]
dataset:
  name: "Requests for /llms.txt and AI crawler activity before the file existed (contentwrittenbyai.com, September to October 2026)"
  description: "Aggregate counts from this site's server access logs from September 9 to October 8, 2026, before /llms.txt was published: requests for /llms.txt by status and requester, and requests by each known crawler for llms.txt, robots.txt, sitemaps and other pages, with each crawler's identity checked against its operator's published IP ranges. No IP addresses are included."
  file: pipeline/llms-txt/baseline.json
  temporalCoverage: "2026-09-09/2026-10-08"
draft: true
provenance:
  models: ["Claude Opus 5.5"]
  brief: "Explain llms.txt and test whether it works: publish one, log every request to it with verified crawler identities, and keep a live tally."
  humanEdit: none
  editor: "Ken Schaefer"
  factCheck: checked
---

## The short answer

Not in any way we can measure yet. <mark data-claim="c10">Google's own guidance says [Google Search ignores llms.txt files](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)</mark>, and none of the AI companies we checked says its crawlers read other sites' llms.txt. Our logs agree so far. In the month before our file existed, six requests asked for it, and none came from a known AI crawler. We published ours on October 9, 2026, and the tally below updates every week.

## What llms.txt is

<mark data-claim="c1">llms.txt was [proposed by Jeremy Howard of Answer.AI](https://www.answer.ai/posts/2024-09-03-llmstxt.html) on September 3, 2024, as a way for sites to offer content that's easy for large language models to use.</mark> It's a plain Markdown file. <mark data-claim="c2">The current version of the spec, [v2 at llmstxt.org](https://llmstxt.org/), puts it at the root path, /llms.txt, or at a subpath such as /docs/llms.txt that covers the pages under it.</mark> To see any site's file, add /llms.txt to its domain. (It's often searched as "llm.txt", but the name is plural.)

The format is short. <mark data-claim="c3">An H1 with the site or project name is the only required part. After it come a blockquote summary, optional detail, and H2 sections that each hold a Markdown list of links.</mark> <mark data-claim="c4">By convention, a section titled "Optional" holds secondary links an agent can skip when it needs a shorter context.</mark>

Here's the top of [ours](/llms.txt). It's built automatically from our published articles, so it stays current without anyone editing it:

```
# Content Written by AI

> A site written and run by AI, in the open, to test whether
> AI-written content can be genuinely good and useful.

## Articles

### Research

- [We fact-checked the top 10 answers to "Does Google penalize
  AI content?"](https://contentwrittenbyai.com/research/...): ...

## About the site

- [Our content methodology](https://contentwrittenbyai.com/methodology/): ...

## Optional

- [All articles](https://contentwrittenbyai.com/articles/): ...
```

### How it differs from robots.txt and sitemaps

People often file llms.txt next to robots.txt, but the two do different jobs. <mark data-claim="c7">robots.txt is standardized as the [Robots Exclusion Protocol in RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html) (September 2022), which says its rules "are not a form of access authorization."</mark> It's a set of crawl rules that well-behaved bots choose to follow. <mark data-claim="c5">The llms.txt proposal draws the line itself: robots.txt tells automated tools what access is acceptable, while llms.txt is used on demand, when an agent needs information while helping a user.</mark>

A [sitemap](https://www.sitemaps.org/) is closer, since it's also a list of a site's pages. <mark data-claim="c6">The proposal says a sitemap is no substitute, because it often lacks LLM-readable versions of pages and covers more than fits in a model's context window.</mark>

### What llms-full.txt is

llms-full.txt is a companion file with the full text of a site's documentation in one place, instead of links. <mark data-claim="c9">Mintlify, a documentation platform, says it shipped llms.txt support across every site on its platform in 2024, and that [it and Anthropic then developed llms-full.txt together](https://mintlify.com/customers/anthropic).</mark> That account comes from Mintlify's own customer story.

## What the AI companies have said

The question that matters is whether AI systems read other people's llms.txt files. Publishing one for your own docs is a different thing, and OpenAI and Anthropic both do that.

**Google.** Google Search is the clearest answer on record. <mark data-claim="c10">Its [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), updated July 10, 2026, says you don't need AI text files or Markdown to appear in Google Search, and that Google Search ignores llms.txt files.</mark> That matches what John Mueller said a year earlier. <mark data-claim="c11">In April 2025 he wrote on Reddit, as [reported by Search Engine Journal](https://www.searchenginejournal.com/google-says-llms-txt-comparable-to-keywords-meta-tag/544804/), that none of the AI services had said they use llms.txt, and compared it to the keywords meta tag.</mark>

Another Google team checks for the file, though. <mark data-claim="c12">Chrome's [Lighthouse has an llms.txt audit](https://developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt) that flags a page if fetching llms.txt causes a server error, and marks a missing file (a 404) as not applicable, since the file is optional.</mark> So Search ignores it while a Google audit tool looks for it.

**OpenAI.** <mark data-claim="c13">OpenAI [describes three crawlers](https://developers.openai.com/api/docs/bots): GPTBot collects content that may be used to train its models, OAI-SearchBot surfaces sites in ChatGPT search, and ChatGPT-User visits pages when a user asks ChatGPT to.</mark> <mark data-claim="c15">That page links to OpenAI's own llms.txt for its documentation, and says nothing about its crawlers reading other sites' files.</mark>

**Anthropic.** <mark data-claim="c16">Anthropic publishes [its own llms.txt](https://platform.claude.com/llms.txt) for its developer documentation.</mark> <mark data-claim="c17">Its [crawler page](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), updated April 7, 2026, lists ClaudeBot, Claude-User and Claude-SearchBot and says they honor robots.txt.</mark> We found no statement from Anthropic that its crawlers read llms.txt.

**Perplexity and Microsoft.** <mark data-claim="c18">Perplexity says [PerplexityBot](https://docs.perplexity.ai/guides/bots) surfaces and links sites in Perplexity search and "is not used to crawl content for AI foundation models."</mark> We found no public statement from Perplexity or Microsoft about reading llms.txt.

## The experiment

We published our llms.txt on October 9, 2026, and we're logging every request for it. Here's how the counting works:

- **Logs.** Our host writes a daily access log. Every week, a scheduled job downloads the logs and counts requests by user agent: for /llms.txt, for robots.txt, for the sitemaps, and for everything else. Only the totals are kept. The raw logs contain visitor IP addresses, so they're never published.
- **Identity checks.** A user agent is just a label, and anyone can claim to be GPTBot. So each request from a known crawler is checked against the IP addresses its operator publishes. <mark data-claim="c17">Anthropic publishes its list at claude.com/crawling/bots.json</mark>, <mark data-claim="c18">Perplexity publishes one for PerplexityBot</mark>, and OpenAI, Google, Microsoft, Apple, Common Crawl and Amazon publish theirs too. Every list we use is linked in [our verification code](https://github.com/KennSchaefer/contentwrittenbyai/blob/main/scripts/verify-bots.mjs). Requests that pass are counted as verified. Requests that fail are counted separately.
- **Everything else.** Requesters that aren't on our known-crawler list are still counted by name: SEO tools, scripts, smaller bots and browsers.

**What would count as a result:** a verified AI crawler fetching the file, fetching it repeatedly, or traffic from an AI product that follows a fetch. **When it ends:** we'll close the experiment after six months, in April 2027, or sooner if the answer becomes clear, and publish a final write-up.

## What we've seen so far

We had a head start. The domain was online before the site launched, and our logs go back to September 9, so we can see what asked for /llms.txt before it existed.

**Before the file existed (September 9 to October 8, 2026), /llms.txt was requested six times.** Five came from ordinary browser user agents and one from a small crawler called PipericBot. None came from a known AI crawler. Every request got a 404 or a redirect, because there was nothing there yet.

AI crawlers were visiting the site in that time, just not for that file. In the six days after the site launched on October 3, OAI-SearchBot made 21 requests and Amazonbot made 22, while Googlebot made 69. ChatGPT-User made 3, <mark data-claim="c13">which, by OpenAI's description, means ChatGPT fetched one of our pages for a user</mark>. Every one of those requests passed the identity check. Before launch, two didn't: one request claiming to be Amazonbot and one claiming to be Bingbot came from addresses those companies don't list.

<div data-crawler-tally></div>

So who asks for an llms.txt that doesn't exist? Our guess is SEO and site-audit tools checking whether the file is there. Those tools often identify as an ordinary browser, and <mark data-claim="c12">Chrome's Lighthouse now checks for the file</mark>. That fits what Ahrefs found at much larger scale (below).

## What it means, so far

Two of the best-known data points point the same way as ours. <mark data-claim="c26">Ahrefs [studied 137,210 domains](https://ahrefs.com/blog/llmstxt-study/) in May 2026: 28% published an llms.txt, 97% of the roughly 38,000 valid files got no requests that month, and SEO audit tools were the top requester.</mark> <mark data-claim="c25">Semrush [reports](https://www.semrush.com/blog/llms-txt/) that from mid-August to late October 2025, Search Engine Land's llms.txt got zero visits from Google-Extended, GPTBot, PerplexityBot or ClaudeBot.</mark> One caveat on that last list: <mark data-claim="c20">Google says [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) is a robots.txt token, not a separate crawler</mark>, so it would never show up in a log by that name.

What we add is the before-and-after view, verified identities, and a count that keeps going. One month in, our data says the same thing as theirs: the main readers of llms.txt are tools checking for llms.txt.

**Should you publish one?** It's cheap and harmless. Ours is generated from our list of articles, so it updates itself. But don't expect search traffic or AI citations from it. Google has said Search ignores it, and no AI company we checked says it reads it. If that changes, it should show up in the tally above before it shows up anywhere else.

## How to create an llms.txt file

There are four common routes, depending on how your site is built. Whichever you pick, the thing to get right is keeping the file current. A file written once by hand goes stale the first time you publish something new.

**WordPress plugins.** Three of the big SEO plugins can generate the file for you:

- <mark data-claim="c28">[Yoast SEO](https://yoast.com/yoast-seo-june-10-2025/) added llms.txt generation on June 10, 2025. It builds the file from your recently updated content, your sitemap and your site descriptions, and refreshes it every week.</mark>
- <mark data-claim="c29">[Rank Math](https://rankmath.com/kb/llms-txt/) builds it from the post types and taxonomies you choose, listing each item's title, URL and a short description. You can cap the number of items and add your own content.</mark>
- <mark data-claim="c30">[All in One SEO](https://aioseo.com/features/llms-txt-generator/) generates it automatically in its free Lite version. The llms-full.txt and Markdown options need Pro.</mark>

**Documentation platforms.** If your docs run on one of these, you may already have a file without having done anything:

- <mark data-claim="c31">[Mintlify](https://www.mintlify.com/docs/ai/llmstxt) hosts an llms.txt automatically, lists pages in navigation order, and says the file is "always up to date." A custom llms.txt in your project replaces it.</mark>
- <mark data-claim="c32">[GitBook](https://gitbook.com/docs/publishing-documentation/llm-ready-docs) automatically publishes /llms.txt, listing every published page with a Markdown version, along with /llms-full.txt.</mark>

**Online generators.** These crawl your site and hand you a file. <mark data-claim="c33">Firecrawl's [llms.txt generator](https://docs.firecrawl.dev/features/alpha/llmstxt) crawls a site and writes both llms.txt and llms-full.txt, but Firecrawl stopped maintaining it after June 30, 2025. The service still runs, and Firecrawl points to an example repository instead.</mark> Whatever generator you use, the output is a snapshot, so you'll need to run it again when your site changes.

**Ask your favorite AI to build it.** This is how we made ours. We asked Claude to add an llms.txt to the site, and it wrote [a short script](https://github.com/KennSchaefer/contentwrittenbyai/blob/main/src/pages/llms.txt.ts) that rebuilds the file from our list of published articles every time the site deploys, leaving drafts out. That took one request and a review. If you go this way, a prompt like this one is a good start:

```
Create an llms.txt file for [your site] that follows the spec at
https://llmstxt.org/. Use only URLs that appear in [your sitemap URL].
Start with an H1 of the site name and a one-sentence summary in a
blockquote. Group the most useful pages under H2 headings, one link
per line with a short description. Put less important pages under
an H2 called "Optional".
```

Then check what comes back:

- **Open every link.** An AI can write a plausible URL that doesn't exist. Limiting it to your sitemap helps, but check anyway.
- **Read the summary.** Make sure it describes what your site actually does, in words you'd use.
- **Plan the updates.** If your site changes often, ask for something that regenerates the file from your content (a build step, a plugin setting or a scheduled job) rather than a one-time file.

<div data-irl></div>

## Limits of this experiment

- **One small, new site.** A few hundred requests a week isn't a sample that proves anything on its own. It's one site's record, published as it happens.
- **User agents can be faked.** The identity checks catch crawlers that claim a name they don't own. They can't catch a real AI crawler that hides behind a browser user agent.
- **We're in the data.** Our own link checks and the editor's visits show up in the logs, mostly as scripts and browser page views.
- **IP lists change.** The pre-launch baseline was checked against the lists as published on October 9, 2026, and operators update their ranges over time.
- **Short log retention.** Our host keeps about 30 days of logs, so the weekly counts are the permanent record. A week where the logs can't be read shows as missing in the tally, not as zero.

## FAQ

### What is an llms.txt file?

A Markdown file at the root of a website (/llms.txt) that summarizes the site and links to its most useful pages, so large language models can find them quickly. Jeremy Howard of Answer.AI proposed it in September 2024.

### How do I create an llms.txt file?

Use a plugin or platform that generates it (Yoast SEO, Rank Math and All in One SEO on WordPress; Mintlify and GitBook for documentation sites), run an online generator, or ask an AI assistant to write one from your sitemap. Then check every link, and set it up so the file is regenerated when your content changes.

### Where do you put an llms.txt file?

At the root of your domain, so it loads at yoursite.com/llms.txt. The spec also allows a subpath, such as /docs/llms.txt, for a file that covers just that section.

### Does Google use llms.txt?

Google Search doesn't. Google's AI optimization guide says you don't need AI text files to appear in Google Search and that Google Search ignores llms.txt files. Chrome's Lighthouse does check whether a site's llms.txt causes a server error.

### Does ChatGPT read llms.txt?

OpenAI hasn't said that its crawlers read other sites' llms.txt files. Its crawler documentation covers GPTBot, OAI-SearchBot and ChatGPT-User without mentioning llms.txt beyond OpenAI's own. In our logs, OpenAI's crawlers haven't requested ours.

### Is llms.txt the same as robots.txt?

No. robots.txt holds crawl rules that bots are asked to follow, under the Robots Exclusion Protocol. llms.txt doesn't allow or block anything. It's a guide to a site's content, meant to be read when an AI agent needs it.

### What's the difference between llms.txt and llms-full.txt?

llms.txt is a short list of links. llms-full.txt puts the full text of a site's documentation in one file. Mintlify says it developed the format with Anthropic.
