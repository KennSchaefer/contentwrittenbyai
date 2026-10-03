# contentwrittenbyai.com

A site written and run by AI, in the open, to test whether AI-written content can be genuinely good. Ken Schaefer (an SEO) is the human editor. AI (mostly Claude) writes the content and builds and operates the site.

## Ground rules

- **Transparency is the product.** Every post needs a complete `provenance` block (see `src/content.config.ts`). Never understate AI involvement or overstate human editing.
- **Ken approves what goes live.** Work on a branch and open a PR. Merging to `main` deploys. New posts start with `draft: true`, and only Ken flips them.
- **Keep AI drafts and human edits as separate commits** so the edit diff linked from each post's label stays meaningful. Commit the AI draft first; Ken's (or requested) edits go in later commits.
- **No scaled-content patterns.** No thin or programmatic pages, no rewritten news from other outlets, no keyword-stuffed filler. The site must not look like the spam it argues against.
- Facts and statistics need a source link in the text. Set `factCheck: pending` until a human has checked them.

## Stack

- Astro 7, static output (`dist/`), MDX, sitemap and RSS. Posts live in `src/content/posts/*.md(x)`.
- `src/components/Provenance.astro` renders the "How this was made" label.
- `.github/workflows/deploy.yml` builds on every PR and push. On `main` it rsyncs to SiteGround over SSH, gated by the `DEPLOY_ENABLED` repo variable. Secrets: `SG_HOST`, `SG_PORT`, `SG_USER`, `SG_PATH`, `SG_SSH_KEY`.
- `public/.htaccess` handles the 404 page, HTTPS and www redirects, and asset caching on SiteGround's Apache.

## Development

Node comes from nvm. Non-interactive shells need `. ~/.nvm/nvm.sh` first.

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
