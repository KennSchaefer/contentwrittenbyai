# Brief: EXP-002, are AI detectors accurate? We tested them on text we know who wrote.

**Section:** Lab Notebook (`experiment: EXP-002`) · **URL:** `/lab/ai-detector-accuracy/` · **Target length:** 2,200 to 3,000 words plus the results tables

*An experiment with a fixed protocol. The protocol and the sample list are committed before any detector is run, so the method can't be adjusted to fit the results. The first round is published as one piece; a repeat each quarter is optional (see "Decisions for the editor").*

## Keywords
- **Primary:** are ai detectors accurate (3,600/mo, KD 71)
- **Core variants:** how accurate are ai detectors (1,900), are ai detectors reliable (720, KD 47), do ai detectors work, can ai detectors be wrong, ai detector accuracy
- **False positives:** why do ai detectors flag my writing (390, KD 28), why is my writing flagged as ai, what percentage of ai detection is acceptable, ai detector false positive
- **Grammarly:** is grammarly ai detector accurate (1,300, KD 34), does grammarly count as ai (1,000, KD 45), how accurate is grammarly ai detector (480, KD 23), does grammarly show up as ai
- **Individual tools** (only the ones we test): is zerogpt accurate (3,600, KD 23), is gptzero accurate (1,900, KD 32), is quillbot ai detector accurate (1,600, KD 47), is copyleaks accurate (720, KD 36), is originality ai accurate (480, KD 53), is scribbr ai detector accurate (260)
- **Supporting:** how do ai detectors work (3,600, KD 67), what is the most accurate ai detector, can google detect ai content (link to our first article)

Full set with volumes: `keywords.json`. The primary term is hard (KD 71), but the tool questions are much easier (KD 20 to 47) and add up to more volume than the primary. A tool-by-tool results section is where this piece can rank first. Excluded: Turnitin (sold only to institutions, so we can't test it), the education-buying questions, and anything about getting around detectors.

## What currently ranks
For "are ai detectors accurate": a Reddit r/writers thread, MIT Sloan EdTech ("AI detectors don't work"), BestColleges, a 2025 study on PubMed Central, the University of Kansas teaching center, Effortless Academic, Grammarly's own blog, and Quora.

- **The guidance pages** (MIT Sloan, KU) cite other people's research, mainly the 2023 Stanford study that found detectors flagged non-native English writers' essays far more often. They don't test anything themselves.
- **The vendor page** (Grammarly) says no detector is 100% accurate, then cites a benchmark score for its own tool. It describes no test of its own.
- **BestColleges** ran a real test, but with three samples (one human essay, one ChatGPT essay, one mix) against two tools.
- **The PMC study** (Erol et al., 2025) is the strongest: 250 human-written neurosurgery abstracts from before ChatGPT, against 750 AI versions, on three detectors. It's academic text from one field, and it tests older OpenAI models.
- **Reddit and Quora** are writers reporting being flagged. They're real experiences, but there's no way to check them.

## What this piece adds that nothing ranking does
1. **Text with known authorship, from a site that records it.** Our AI text has a public commit history showing it came from the model. The human text is published under two writers' names, the editor's and Laura Schaefer's, with each piece's date and the writer's own account of how it was made. Most tests use either student essays or text the tester generated that day.
2. **The test people are actually asking about.** Professional writing, not student essays: articles, reports and posts. And current detectors against a current model (Claude Opus 5.5), not GPT-3.5.
3. **The Grammarly question, tested directly.** "Does Grammarly count as AI?" gets 1,000 searches a month. We run the editor's human text through detectors before and after accepting Grammarly's suggestions. As far as we can find, no ranking page does this.
4. **Run-to-run variation.** Every sample goes through every tool more than once. If a detector gives the same text different scores, readers should know.
5. **Open data.** Every sample (linked, or published in full where it's ours), every score and the protocol, under CC BY like our first study.
6. **First-hand experience** from the editor on what clients and publishers do with detector scores.

## Title and H1
- **Title tag:** Are AI Detectors Accurate? We Tested Them on Text We Know Who Wrote (67 characters)
- **H1:** We know who wrote every word. So we tested the AI detectors.

## Sections
1. **The short answer** (40 to 60 words): written last, from the results. It has to state the false-positive result on human text in plain numbers.
2. **Why most detector tests can't settle it:** the labeled-data problem. You can only measure accuracy if you know for sure who wrote the text. Brief, fair summary of what the strongest existing studies found (Stanford 2023 on non-native writers, Erol et al. 2025, OpenAI withdrawing its own classifier), sourced.
3. **How AI detectors work:** short and sourced. Statistical classifiers trained on human and AI text, and the predictability signals ("perplexity" and "burstiness") that several tools describe. What a score does and doesn't mean, in each vendor's own words. Targets "how do ai detectors work" (3,600).
4. **Our test:** the protocol in plain language (see "Experiment design" below). It's posted before results, and the commit date proves it.
5. **Results:**
   - Human text: how often each tool called the editor's writing AI.
   - AI text: how often each tool caught ours.
   - Mixed text: whether tools found the AI parts or just averaged.
   - Before and after Grammarly: how the scores moved.
   - Same text, different scores: the run-to-run spread.
6. **Tool by tool:** one short, scored verdict per detector we tested. Each answers its "is X accurate" search directly.
7. **Why detectors flag human writing:** what our human samples that got flagged have in common, compared with what the published research says. Targets "why do ai detectors flag my writing" (KD 28).
8. **What it means, so far:** practical guidance for editors and content teams, on what a score can and can't support. No legal or academic-misconduct advice.
9. **In real life · by a real human:** the editor's section (questions below), with its own descriptive H2.
10. **Limits of this experiment:** see below.
11. **FAQ:** below.

## Experiment design (for the editor to approve)
**Samples.** Each piece is 300 words or more, because detectors are unreliable on short text, and several state a minimum length. Long pieces are split into passages of 300 to 600 words.
The source pieces, as labeled by their writers (the editor confirmed authorship and approved linking to all of them, 2026-10-12):

| Group | Piece | Writer | Published |
|---|---|---|---|
| Human | [Between Shades of Gray](https://scatteredbooks.com/book-reviews/between-shades-of-gray/) (Scattered Books) | Laura Schaefer | 2019-01-27 |
| Human | [They Both Die at the End](https://scatteredbooks.com/book-reviews/they-both-die-at-the-end-book-summary-a-heartbreaking-tale-by-adam-silvera/) (Scattered Books) | Laura Schaefer | 2023-08-26 |
| Human | [Fahrenheit 451](https://scatteredbooks.com/book-reviews/fahrenheit-451-ray-bradbury/) (Scattered Books) | Ken Schaefer | 2023-02-18 |
| Human | [The ROI of content marketing](https://www.beebyclarkmeyler.com/what-we-think/roi-of-content-marketing) (Beeby Clark+Meyler) | Ken Schaefer | 2019-10-03 |
| AI-assisted, mixed | [Summary of The Diary of Anne Frank](https://scatteredbooks.com/book-reviews/summary-of-the-diary-of-anne-frank/) (Scattered Books) | Laura Schaefer | 2023-11-30 |
| AI-assisted, mixed | [The complete guide to off-page AEO](https://www.beebyclarkmeyler.com/what-we-think/the-complete-guide-to-off-page-aeo-seo-ai-visibility) (Beeby Clark+Meyler) | Ken Schaefer | 2025-07-30 |
| AI-assisted, mixed | [Guide to content optimization for AI search](https://www.beebyclarkmeyler.com/what-we-think/guide-to-content-optimization-for-ai-search) (Beeby Clark+Meyler) | Ken Schaefer | 2025-06-26 |
| AI-assisted, about 90% AI | [Dune summary and review](https://scatteredbooks.com/book-reviews/dune-summary-review/) (Scattered Books) | Laura Schaefer | 2023-11-09 |
| AI-assisted, about 90% AI | [What we've learned about AI search](https://www.beebyclarkmeyler.com/what-we-think/what-weve-learned-about-ai-search-and-how-to-move-forward) (Beeby Clark+Meyler) | Ken Schaefer | 2026-03-13 |

- **Human (H):** the four human pieces above, split into passages. Two are from before ChatGPT's release (November 2022). Their authorship rests on the writers' word, and the article says so.
- **AI (A):** verbatim AI first drafts from this site's commit history (the "AI draft" commits, before any human edit), matched to the human set in count and length. One caveat to report: our writing rules ban common AI phrases, which may make our AI text harder to detect than typical output.
- **Real-world AI-assisted (R):** the five AI-assisted pieces above. Their proportions are the writers' estimates, not measurements, so this group answers a different question: do detectors agree with what the writers say about their own work?
- **Constructed mix (M):** about 6 passages that splice human (H) and AI (A) paragraphs in exact proportions (25%, 50%, 75% AI). This is the controlled version of the mixed test.
- **Grammarly-edited (G):** the human passages after Grammarly's suggestions are accepted, at two levels: corrections only (spelling, grammar, punctuation), then also its rewrite and tone suggestions. The editor does this in his account, because the result depends on the account's settings.

**Picking passages without cherry-picking.** A piece under 600 words is used whole. A longer piece is split into consecutive passages of 300 to 600 words at paragraph breaks, and if that gives more than 3, we use the first, the middle and the last. Headings, captions, tables, quotes from the books and page furniture are removed. The passage list is committed before any detector is run.

**Checking the text hasn't changed.** The Scattered Books pages show a last-modified date of October 10, 2026. The editor says that was a site-wide update, mostly metadata. For every piece, we compare the live text with an archived copy from before that date (Wayback Machine). If the body text differs, we test the archived version and say so.

**Tools.** 5 to 7 detectors, picked in research from the ones with search demand above: Grammarly, GPTZero, ZeroGPT, QuillBot, Copyleaks, Originality.ai and Scribbr. Each must be testable without an institutional account. Research also records each tool's stated length limits, what its score means, and its terms of use, and our test follows those terms.

**Runs.** Every sample goes through every tool 3 times (separate submissions), with the date and tool version where shown.

**Scoring.** We record the raw score and the tool's own label. For comparability we also apply one fixed rule, decided now: a passage counts as "flagged as AI" if the tool says 50% or more AI, or labels it AI or mostly AI. Headline numbers: the false-positive rate on human text, the detection rate on AI text, and the run-to-run spread.

**Data.** `pipeline/ai-detector-accuracy/study.json`: one row per sample, tool and run. Our own text is published in full. The other writers' text is linked, with passage boundaries described by their first and last words.

## Limits to state in the article
- Small sample: two human writers, one AI model for the controlled AI text, and AI-assisted pieces whose proportions are estimates. The results describe these texts, not every writer or model.
- The human pieces are published online and may be in models' training data, which could affect how detectors score them either way.
- Authorship of the human pieces rests on the writers' own account. Two predate ChatGPT; the others don't.
- Our AI text was written under rules that ban common AI phrasing.
- Detectors change without notice. Results are dated, and the tool versions are recorded where shown.

## FAQ
- Are AI detectors accurate?
- Can AI detectors be wrong about human writing?
- Why do AI detectors flag my writing?
- Does Grammarly count as AI?
- Is Grammarly's AI detector accurate?
- Is ZeroGPT accurate? (and one each for the other tools we test, if the results support a clear answer)
- Can AI detectors detect Claude? (no measured volume yet; covered ahead of demand)
- What percentage of AI detection is acceptable?
- Can Google detect AI content? (short answer, link to our first article)

## In real life · by a real human: questions for the editor
Answer in your own words, any length or format. This section is published as written, apart from typo fixes you approve.
1. Have you, a colleague or a client had human writing flagged as AI? What happened, and what did it cost to sort out?
2. Do clients or publishers you work with run content through AI detectors? What decisions hang on the score?
3. How do you use Grammarly in your own writing? Do you accept its rewrite suggestions, or only corrections?

## Decisions for the editor
1. **Approve the experiment design above**, especially the 50% rule, the passage-picking rule and the two Grammarly levels.
2. **Samples (done, 2026-10-12):** the editor supplied the nine pieces above, confirmed authorship, and approved linking to Beeby Clark+Meyler and naming Laura Schaefer. Still open: if either writer remembers which parts of an AI-assisted piece were AI, note it, and we'll report it beside the detector scores.
3. **Paid tools:** Originality.ai has no free tier we know of (research will confirm). Include it at its lowest paid price, or leave it out?
4. **One-off or repeating:** publish once as `status: complete`, or rerun quarterly as `status: running` with dated rounds?
5. **Who runs the tests:** I can run the free web tools through the browser. Grammarly needs your account. Do you want to run it, or let me use it in your logged-in Chrome?

## Notes
- Tone: fair to the vendors. Every detector says it isn't perfect, so the useful question is how imperfect, on what kind of text. Report misses in both directions.
- No "how to beat detectors" content. Explaining why human text gets flagged is in scope; evasion isn't.
- Internal links: /lab/, /methodology/, the first article (Google and AI content), the llms.txt experiment (as another Lab piece).
- Lab Notebook frontmatter: `experiment: EXP-002`, `status`, and `result` (120 characters or fewer).
