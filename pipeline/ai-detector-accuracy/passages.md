# EXP-002 passages and protocol amendment (2026-10-18)

Committed before any detector was run. `passages.json` is the fixed list: each passage's source, word count, first and last words, and the SHA-256 of its exact text. `build_passages.py` rebuilds it from fixed sources (Wayback Machine captures by timestamp, git commits by hash, frozen draft files by name). Our own AI text (group A) is published in full. Other writers' text is described by its boundaries and fingerprint only.

## Amendment: Westchester Bars added (editor, 2026-10-18)

The editor owns westchesterbars.com and approved two new groups:

- **WH, human, pre-ChatGPT.** Reviews published in 2022, using the text as captured by the Wayback Machine in November or December 2022. Six of the seven captures are dated on or before November 30, 2022, ChatGPT's launch day. The editor confirms the 2023-and-earlier reviews were written by him, Laura Schaefer or a Scattered Books employee, which writer per review isn't recorded, and none were run through Grammarly. The live pages aren't used: AI scripts have edited them since 2026 (links, facts blocks, FAQs). Eligible: the 2022 reviews with a 2022 capture (10 of 13). After cleaning, 7 reach 300 words.
- **WA, AI drafts.** The 7 reviews whose AI first draft was frozen before the editor saw it (`build_<venue>_post.py --emit`). The drafts were written from the editor's visit notes, so some of his phrases survive in them. That's normal AI-assisted practice, and the article says so. The Applebee's and IHOP draft is left out because its 2026 rewrite was layered over a 2024 human review.
- One passage per review, the first (rules 1 to 3 in `build_passages.py`).

**Considered and dropped:** pairing each WA draft with its published version to measure a human edit. The published text is 90 to 99.8% the same words as the draft, and part of the difference is later AI-script additions, so it doesn't isolate a human edit. Scattered Books product pages were also dropped: none is over 86 words.

## Changes from the brief, applied by the rules rather than by choice

- **Between Shades of Gray** (Laura Schaefer) is excluded: about 240 words of body text, under the 300-word minimum.
- **They Both Die at the End** gives one passage (582 words), so mix M-50b uses a WH passage (Foley's) for its human part.
- **Guide to content optimization for AI search** (BCM) was substantially rewritten in August 2026. The May 2026 capture of the original is used.
- **The Scattered Books pages** are unchanged in body text between the Wayback captures and the live pages. The October 10 update only added related-book links. The captures are used.
- **Constructed mixes** splice at paragraph breaks, so AI shares are close to 25, 50 and 75% but not exact. The actual share of each mix is recorded in `passages.json`.
- **G, Grammarly-edited:** the 5 H passages at the two levels in the brief, 10 samples. The editor records the edited text in the score sheet before scoring, and its fingerprint is added to `study.json`.

## Counts

| Group | Passages | Source |
|---|---|---|
| H | 5 | They Both Die at the End (1), Fahrenheit 451 (2), The ROI of content marketing (2) |
| R | 15 | The 5 AI-assisted pieces, 3 passages each |
| A | 7 | AI draft commits d3cd2be (3), 7ddbec4 (3), 648b82e (1) |
| M | 6 | 25%, 50% and 75% AI, two of each, human-first and AI-first |
| WH | 7 | Westchester Bars reviews 1181, 1216, 1270, 1347, 1417, 1469, 1478 |
| WA | 7 | Westchester Bars drafts 3033, 3056, 3074, 3411, 3531, 3552, 3580 |
| G | 10 | H passages after Grammarly, two levels |

57 samples, 3 runs each per tool.
