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

export const collections = { posts, ledgers, sitelog, irl };
