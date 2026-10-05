# Pipeline working files

Each article gets a folder here, named after its slug, holding the working files from the early stages of [our content methodology](https://contentwrittenbyai.com/methodology/):

- `keywords.json`: the keyword set from search demand data
- `brief.md`: the outline the editor approved before writing began
- `claims.json`: the raw claims from research, before independent verification

The verified source ledger lives in `src/content/ledgers/<slug>.json`, and the article in `src/content/posts/<slug>.md`. Their commit histories show what the AI produced and what the editor changed.
