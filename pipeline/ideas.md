# Content ideas

Articles we might write next. Nothing here is approved: an idea becomes an article only when the editor picks it and approves its brief (stage 02 of [our methodology](https://contentwrittenbyai.com/methodology/)).

Every idea has to answer "what does this add that the current top results don't?" If the honest answer is "a better summary", it doesn't belong on this list.

Search data: SEMrush, US database, October 6, 2026. Volume is monthly searches; KD is keyword difficulty (0 to 100). These are starting points for stage 01, not the final keyword set.

## Shortlist

### 1. EXP-001: We ran our own article through AI detectors

- **Section:** Lab Notebook (experiment)
- **What it adds:** original data. We know exactly which words on our site were written by AI and which by a human (the "In real life" sections, and the edit diffs). That makes our own pages a labeled test set, which most detector reviews don't have. Run the AI text, the human text and a mixed version through the main detectors and report hit rates, false positives and how scores move between runs.
- **Keywords:** are ai detectors accurate (3,600, KD 71), how accurate are ai detectors (1,900, KD 81), gptzero accuracy (390, KD 41), can google detect ai content (50, KD 44)
- **Needs from the editor:** a few hundred more words of human-written text as a control (or permission to use existing posts' IRL sections), and possibly paid detector accounts.
- **Notes:** small sample, so the write-up must say so. Repeatable each quarter, which fits the Lab format.

### 2. Model shootout: same brief, same verified facts, three models

- **Section:** Reviews
- **What it adds:** a controlled test instead of opinion. Give Claude, GPT and Gemini the same approved brief and the same verified claim set, then count what each one adds that isn't in the claims (unsupported statements), how closely it follows the brief, and how the editor scores the drafts blind.
- **Keywords:** best ai for writing (4,400, KD 59), claude vs gemini (3,600, KD 39), best ai model for writing (210, KD 44), chatgpt vs claude for writing (50, KD 50). "claude vs chatgpt" (49,500, KD 53) is mostly not writing intent.
- **Needs from the editor:** blind scoring, and API access or accounts for the other models.
- **Notes:** this site is run by Claude, which is a conflict of interest. The test design has to remove it (blind scoring, published prompts and outputs), and the article has to say so up front.

### 3. What our fact-checker caught: a catalog of AI errors

- **Section:** Guides
- **What it adds:** real examples from our own ledgers and study data: claims an AI researcher pulled that the verifier rejected, misquotes, outdated stats and the reason each failed. Most "AI hallucination" pages use the same handful of famous examples. Then the practical how-to: the checks that caught each type.
- **Keywords:** ai hallucinations examples (480, KD 76), fact check ai (210, KD 42), ai hallucination (9,900, KD 83, a long-term target only)
- **Needs from the editor:** nothing new. Better after two or three more articles, so the catalog isn't thin.

### 4. Does llms.txt do anything? A server-log experiment

- **Section:** Lab Notebook (experiment)
- **What it adds:** first-hand evidence. Publish an llms.txt, then check our raw server logs for which AI crawlers actually request it, and compare with requests for sitemap.xml and robots.txt over the same period.
- **Keywords:** llms.txt (3,600, KD 59), does llms.txt work (20)
- **Needs from the editor:** access to SiteGround raw access logs (to confirm they're available and how long they're kept).
- **Notes:** needs a few weeks of logs before there's anything to report, so it should start early even if the write-up comes later.

### 5. How to label AI content: what's required and what's sensible

- **Section:** Policy
- **What it adds:** a primary-source analysis of what Google, the FTC and the EU AI Act's transparency rules actually say about disclosing AI-generated content, alongside a worked example (our own Content Facts label and why each field is there).
- **Keywords:** ai disclosure (140, KD 38), ai content labeling (20), ai content policy (20)
- **Needs from the editor:** a view on what clients and publishers are actually doing.
- **Notes:** low volume but high CPC on "ai disclosure" ($6.22), which suggests commercial interest. The legal sources need careful verification; the article explains rules and isn't legal advice.

## Later

- **Do AI humanizers make text better or worse?** Run AI text through humanizer tools, then through detectors (ties into EXP-001) and through our fact-checker, to see whether they introduce errors. Head terms are huge but unwinnable (ai humanizer 673,000, KD 89); "how to humanize ai text" is 1,900 at KD 87. Better as a follow-up to EXP-001.
- **How to show up in AI Overviews.** how to rank in ai overviews (720, KD 35, CPC $6.46). Low difficulty, but every agency has written this one. Only worth it with our own AI Overview data, which waits on confirming the SEMrush AI Overview feature code.
- **First monthly Lab field note.** Already planned for early November 2026, after a full month of metrics.

## Picked

When an idea is picked, it moves here with a link to its `pipeline/<slug>/` folder.

- **EXP-002: Does llms.txt do anything?** (idea 4). Picked October 6, 2026. The file (`/llms.txt`, generated from `src/pages/llms.txt.ts`) went up first so the logs can build up. The write-up comes once there's enough data.
- **EXP-001: AI detectors** (idea 1). Picked October 6, 2026. Next up for keyword research and a brief.
