import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { SECTIONS, type Section } from './consts';

// Every post carries a provenance record: the "how this was made" label.
const provenance = z.object({
  // Model(s) that wrote the draft, e.g. "Claude Opus 5.5"
  models: z.array(z.string()).min(1),
  // One-line summary of the brief or prompt given to the model
  brief: z.string(),
  // How much a human changed the AI draft
  humanEdit: z.enum(['none', 'light', 'moderate', 'heavy']),
  // Who reviewed and approved it for publishing
  editor: z.string().optional(),
  // Fact-check status
  factCheck: z.enum(['not-needed', 'pending', 'checked']).default('pending'),
  // Optional notes: what the human changed and why, tools used, etc.
  notes: z.string().optional(),
});

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    // Title tag, when it should differ from the on-page H1 (title)
    seoTitle: z.string().optional(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(Object.keys(SECTIONS) as [Section, ...Section[]]),
    // Lab Notebook experiments only: an ID like EXP-001 and where the experiment stands
    experiment: z.string().regex(/^EXP-\d{3}$/).optional(),
    status: z.enum(['planned', 'running', 'done']).optional(),
    // Lab Notebook experiments only: one-line result, or where things stand
    result: z.string().max(120).optional(),
    tags: z.array(z.string()).default([]),
    // Original research only: the published dataset behind the article, marked up as a schema.org Dataset
    dataset: z
      .object({
        name: z.string(),
        description: z.string().min(50).max(5000),
        // Repo-relative path, e.g. pipeline/<slug>/study.json
        file: z.string(),
        temporalCoverage: z.string().optional(),
      })
      .optional(),
    draft: z.boolean().default(false),
    provenance,
  }),
});

// Source ledger: one file per post, named after the post's slug.
// Claims are kept short on purpose. The ledger records only factual claims the article relies on.
const claim = z.object({
  id: z.string(),
  // The claim as a single short statement
  claim: z.string().max(200),
  sourceUrl: z.url(),
  sourceName: z.string().max(80),
  // official: government, standards body, or the company speaking about itself
  // primary: original research or data; reputable: established publication; weak: blog, forum, aggregator
  tier: z.enum(['official', 'primary', 'reputable', 'weak']),
  // What the independent verifier found when it re-read the source
  verdict: z.enum(['supported', 'partial', 'contradicted', 'not-found', 'unreachable']),
  // Short reason for the verdict
  reason: z.string().max(160),
  // auto: supported by an official or primary source, so it clears without review
  // approved / rejected: a human ruled on it; pending: waiting for a human
  decision: z.enum(['auto', 'approved', 'rejected', 'pending']),
  // Whether the published text uses this claim
  used: z.boolean(),
});

const ledgers = defineCollection({
  loader: glob({ base: './src/content/ledgers', pattern: '*.json' }),
  schema: z.object({
    verifiedAt: z.coerce.date(),
    verifier: z.string(),
    claims: z.array(claim),
  }),
});

// Site log: dated changes to the site and what prompted them, shown in the Lab Notebook
const sitelog = defineCollection({
  loader: file('src/content/sitelog.json'),
  schema: z.object({
    date: z.coerce.date(),
    text: z.string().max(240),
  }),
});

// "In real life · by a real human": the editor's first-hand section for a post, one file per post slug.
// Written by a person, never by AI. `sample: true` marks an AI-written placeholder and blocks publishing.
const irl = defineCollection({
  loader: glob({ base: './src/content/irl', pattern: '*.md' }),
  schema: z.object({
    author: z.string(),
    // A descriptive H2 specific to this article, not a fixed label
    heading: z.string(),
    // Optional short excerpt shown near the top of the article
    pullQuote: z.string().max(240).optional(),
    sample: z.boolean().default(false),
  }),
});

// Weekly search and analytics snapshots, written by scripts/collect-metrics.mjs (one file per week, named by its Sunday)
const num = z.number().optional();
const metrics = defineCollection({
  loader: glob({ base: './src/content/metrics', pattern: '*.json' }),
  schema: z.object({
    week: z.object({ start: z.string(), end: z.string() }),
    collectedAt: z.coerce.date(),
    sources: z.record(z.string(), z.object({ ok: z.boolean(), error: z.string().optional() }).passthrough()),
    site: z.object({ clicks: num, impressions: num, ctr: num, position: num, views: num, sessions: num, keywords: num, top10: num }),
    daily: z.array(z.object({ date: z.string(), clicks: z.number(), impressions: z.number() })),
    pages: z.array(
      z.object({
        path: z.string(),
        search: z
          .object({
            clicks: z.number(), impressions: z.number(), ctr: z.number(), position: z.number(),
            topQuery: z.object({ query: z.string(), clicks: z.number(), impressions: z.number(), position: z.number() }).optional(),
          })
          .optional(),
        analytics: z.object({ views: z.number(), sessions: z.number(), engagedSessions: z.number(), avgEngagementSeconds: z.number() }).optional(),
        rankings: z
          .object({
            keywords: z.number(), top10: z.number(),
            best: z.object({ keyword: z.string(), position: z.number(), volume: z.number() }).nullable(),
            serpFeatures: z.array(z.string()),
          })
          .optional(),
      }),
    ),
  }),
});

export const collections = { posts, ledgers, sitelog, irl, metrics };
