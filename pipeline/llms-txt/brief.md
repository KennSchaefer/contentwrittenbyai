# Brief: EXP-001, does llms.txt work? We're logging every request to ours.

**Section:** Lab Notebook (`experiment: EXP-001`, `status: running`) · **URL:** `/lab/llms-txt/` · **Target length:** 1,600 to 2,200 words plus the live tally

*A running experiment. It's published once with the baseline, then the numbers update every week from our server logs without hand edits. The interpretation is revised by PR when something changes.*

## Keywords
- **Primary:** llms.txt (3,600/mo, KD 59)
- **Core variants:** llm.txt, llms txt, llms.txt file, what is llms.txt, does llms.txt work, is llms.txt worth it
- **Supporting:** llm.txt for seo, llms.txt examples, llms.txt standard, where to place the llms.txt file, how to see the llms.txt file of a website, openai llms.txt, llms.txt vs robots.txt, llms-full.txt
- **Crawlers:** claudebot (3,600), oai-searchbot (720, KD 16), gptbot (390, KD 28), ai crawlers, perplexitybot

Full set with volumes: `keywords.json`. The URL uses the exact head term. The "generator" queries (2,400/mo) were out of scope until the editor added the tools section (6a).

## What currently ranks
For both "llms.txt" and "what is llms.txt": the proposal itself (llmstxt.org), Chrome's Lighthouse docs (Lighthouse now audits llms.txt), a Reddit r/SEO thread, Semrush, Ahrefs, GitBook, Mintlify, Search Engine Land, Zeo, YouTube, Medium and Neil Patel.

Two of them already have log data, and we have to be straight about that:
- **Semrush** (September 28, 2026) reports a test on Search Engine Land: no visits from Google-Extended, GPTBot, PerplexityBot or ClaudeBot to its llms.txt from mid-August to late October 2025.
- **Ahrefs** (updated June 15, 2026) cites a study of 137,000 domains: 28% publish an llms.txt, and 97% of those got zero requests for it in May 2026.

Both are snapshots from a past window. Neither shows what was asking for the file before it existed, or who the non-zero requests came from.

## What this piece adds that nothing ranking does
1. **A live, open tally.** Every week's counts, by crawler, published automatically from our own logs, with the code and the data public. The ranking pages give a single number from a past test. Ours keeps moving, and anyone can check it.
2. **A before-and-after baseline.** We logged requests for `/llms.txt` before the file existed (6 requests from September 9 to October 8, 2026: five from browser user agents, one from a small bot, none from a named AI crawler), while OpenAI's, Amazon's and Google's crawlers were visiting other pages. That shows the demand side: who looks for the file, not only whether AI bots fetch it.
3. **Who, not just how many.** Every requester by name: AI crawlers, search crawlers, SEO tools, scripts and browsers, plus human page views for scale.
4. **First-hand experience** from the editor, on what clients are doing with llms.txt.

## Title and H1
- **Title tag:** Does llms.txt Work? We're Logging Every Request to Ours (55 characters)
- **H1:** We published an llms.txt. Here's everything that asks for it.

## Sections
1. **The short answer** (40 to 60 words, answer-first): as of our latest data, no named AI crawler has requested our llms.txt; what does request it, and since when. The number and date come from the live data, so this paragraph is the one part we update by hand when the result changes.
2. **What llms.txt is** (the intro the editor liked): what the file is and where it lives, who proposed it and when, the format (a markdown H1, a summary, sections of links, an "Optional" section), how it differs from robots.txt and sitemap.xml, and llms-full.txt. Show ours as the worked example, with a link to `/llms.txt`.
3. **What the AI companies have said:** a sourced, dated rundown of public statements and documentation from Google, OpenAI, Anthropic, Perplexity and Microsoft on whether their systems read llms.txt, kept separate from what they do with their own sites (publishing your own llms.txt isn't the same as your crawler reading other people's). Also the Lighthouse audit, since a tool now checks for the file.
4. **The experiment:** what we published and when, how we count (daily server logs, user-agent matching, weekly snapshots), and what would count as a result: a named AI crawler fetching the file, repeat fetches, or traffic that follows a fetch. End condition: we close the experiment at six months (April 2027), or earlier if the answer is clear, and publish a final write-up.
5. **What we've seen so far:** the baseline, then the live tally (see "Build" below). Per crawler: llms.txt, robots.txt, sitemap and page requests. Then the other requesters by name, and human page views for scale.
6. **What it means, so far:** our reading of the data, compared fairly with the Semrush and Ahrefs findings. Should you publish one? A practical answer: it's cheap and harmless, and no one should expect traffic from it.
6a. **How to create an llms.txt file** (added by the editor, 2026-10-09, after approving the draft): the main ways to make one, sourced from each tool's own documentation (the spec authors' tooling, CMS plugins, documentation platforms, online generators), whether each keeps the file current, and asking your favorite AI to build it, using how ours was built as the worked example. Targets the "llms.txt generator" queries (2,400/mo), now in scope.
7. **In real life · by a real human:** the editor's section (questions below), with its own descriptive H2.
8. **Limits of this experiment:** one small, new site; user agents can be faked; our own link checks and the editor's visits are in the logs; one log source; SiteGround keeps about 30 days of logs, so anything older than the weekly snapshots is gone.
9. **FAQ:** below.

## FAQ
- What is an llms.txt file?
- Where do you put an llms.txt file?
- Does Google use llms.txt?
- Does ChatGPT read llms.txt?
- Is llms.txt the same as robots.txt?
- What's the difference between llms.txt and llms-full.txt?

## Build (needed before this can publish)
- **Live tally component:** the Lab page reads `crawlers` from every weekly metrics snapshot (`src/content/metrics/*.json`) and the baseline (`pipeline/llms-txt/baseline.json`) and renders a week-by-week table. Real data only, with no placeholders: a week whose logs failed shows as missing, not zero.
- **"Last updated" date** tied to the latest snapshot, so freshness is real, not cosmetic.
- **Verified bot identity (decided by the editor, 2026-10-09: build it first).** Built in `scripts/verify-bots.mjs`. Each request that claims to be a known crawler is checked against the IP ranges its operator publishes (OpenAI's three bots, Anthropic, Perplexity, Google, Bing, Apple, Common Crawl, Amazon). IPs are never stored or published. The tally shows claimed and verified counts side by side. Baseline result: every AI crawler request since launch verified. Before launch, one Amazonbot request and one bingbot request were impostors. A limit to state in the article: the baseline was checked against the lists as published on October 9, 2026, and operators change their ranges over time.

## In real life · by a real human: questions for the editor
Answer in your own words, any length or format. This section is published as written, apart from typo fixes you approve.
1. Have clients or colleagues asked you about llms.txt? What did they expect it to do, and what did you tell them?
2. Have you added llms.txt to any site you work on, and did you see anything afterward, in logs, AI citations or traffic? If you haven't, why not?
3. When a new "do this for AI search" tactic shows up, how do you decide whether it's worth a client's time?

## Notes
- Tone: curious and fair. "Nobody reads it" is a finding, not a punchline, and the article mustn't overstate a small site's data.
- Credit the Semrush and Ahrefs data where we compare with it.
- Internal links: /lab/, /methodology/, the first article (it's what the crawlers were visiting), and the site's own `/llms.txt`.
- Lab Notebook frontmatter: `experiment: EXP-001`, `status: running`, `result` (120 characters or fewer) updated with the short answer.
