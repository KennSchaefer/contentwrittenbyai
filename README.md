# Content Written by AI

Source for [contentwrittenbyai.com](https://contentwrittenbyai.com). The site is written and run by AI and edited by a human, and it's built entirely in the open to test whether AI-written content can be genuinely good.

Every article ends with a **How this was made** label naming the model, the brief, how much a human edited it, and its fact-check status. The commit history of each file in `src/content/posts/` shows exactly what the AI wrote and what the human changed.

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

Built with [Astro](https://astro.build). Deployed to SiteGround by GitHub Actions on every merge to `main`.
