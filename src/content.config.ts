import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
    category: z.enum(['experiments', 'research', 'guides', 'reviews', 'news', 'policy', 'meta']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    provenance,
  }),
});

export const collections = { posts };
