---
name: new-article
description: Run the site's ten-stage content methodology for a new article, from keyword research to a PR ready for the editor. Use when asked to write, draft, or start an article or post for contentwrittenbyai.com.
---

# New article pipeline

Each article moves through ten stages. **Stop at each editor gate** and wait for the editor's decision before continuing. Any gate can send the work back to an earlier stage. If that happens, rerun forward from that stage instead of patching later output.

Working files live in `pipeline/<slug>/`. They're public in the repo, so write them as if readers will see them.

## 01 Keyword research
Use the SEMrush tools (US database unless the editor says otherwise) to expand the topic into a keyword set grouped by how central each term is. Save the result to `pipeline/<slug>/keywords.json`, with volume, difficulty, intent, and group for each term.

## 02 Brief: EDITOR GATE
Look at what currently ranks for the primary keyword. Write `pipeline/<slug>/brief.md` with the angle (what this piece adds that the ranking pages don't), the H1, section headings, FAQ questions, target length, and the primary and supporting keywords. Commit it on a new branch `article/<slug>`, open a draft PR, and **stop for the editor to approve or edit the brief.**

## 03 Research
Search the live web and pull the factual claims the article will need. Prefer official and primary sources, and look for the original source behind any secondary report. Write `pipeline/<slug>/claims.json` as `[{ id, claim, sourceUrl, sourceName, tier }]`. Record only claims the article will actually rely on, merge duplicates, and aim for 25 or fewer.

## 04 Verification: EDITOR GATE
Delegate to the `claim-verifier` agent. It must be a fresh agent with no research context. It writes `src/content/ledgers/<slug>.json`. Give the editor the pending claims in a compact list (claim, source, verdict, reason), and **stop for them to rule** on each one: approve, reject, or ask for a better source. Record each ruling in the ledger's `decision`.

## 05 Writing
Draft `src/content/posts/<slug>.md` from the approved brief and only the claims whose decision is `auto` or `approved`. Every factual statement in the text must map to one of those claims. Wrap the sentence or phrase that makes the claim in `<mark data-claim="c1">…</mark>`, using the ledger id. The site renders it as an underlined claim with a C1 tag linking to its source line. A normal markdown link to the source inside the mark is fine. Set `used: true` on those claims. Category is one of `research`, `guides`, `reviews`, `policy`, or `lab` (for Lab Notebook pieces; experiments also set `experiment: EXP-00N`, `status` and `result`). Opinions, analysis, and the site's own experiment results don't need ledger entries, but must not be presented as sourced fact. Frontmatter: `draft: true`, `provenance.humanEdit: none`, `provenance.factCheck: checked`.

## 06 Linking
Check that every outbound link resolves to the specific page it claims to (not a homepage or a 404). Add internal links to relevant existing posts.

## 07 Editing: EDITOR GATE
Commit the AI draft as its own commit before any human edit, so the diff stays honest. Mark the PR ready for review. The editor edits directly or asks for changes. After their edits, set `provenance.humanEdit` to reflect how much changed and add `provenance.notes` if useful.

## 08 Quality checks
Run `npm run check`. Fix every error (banned characters, phrases, and patterns in `content-rules.json`, plus ledger gates). Don't game the checker with near-synonyms of banned phrases. Rewrite the sentence.

## 09 Metadata
Write the title (70 characters or fewer) and description (70 to 160 characters) against the final text. They must make only claims the article supports. Structured data is generated from frontmatter automatically. Rerun `npm run check`.

## 10 Publishing
Once the editor approves, flip `draft: false` and set `pubDate` to the publish date. **The editor merges the PR.** Merging deploys the article.
