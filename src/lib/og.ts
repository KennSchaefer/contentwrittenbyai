// Share images (og:image) for every page, rendered at build time to /og/<key>.png.
import { readFileSync } from 'node:fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getPosts, postUrl } from './posts';
import { SECTIONS, NAV_SECTIONS, EDITOR_PROFILE } from '../consts';

export interface OgPage {
  key: string; // URL path without slashes; '' for the homepage
  title: string;
  eyebrow: string;
  lab?: boolean;
}

// Page path -> image key: '/' -> 'home', '/research/x/' -> 'research/x'
export const ogKey = (pathname: string) => pathname.replace(/^\/|\/$/g, '') || 'home';

export async function ogPages(): Promise<OgPage[]> {
  const posts = await getPosts();
  const sections = await Promise.all(
    NAV_SECTIONS.map(async (key) => ({ key, count: (await getPosts(key)).length })),
  );
  return [
    { key: 'home', title: 'Written by AI. Checked by a human. Judged by you.', eyebrow: 'AI-generated content, fact-checked in public' },
    { key: 'methodology', title: 'How we make content', eyebrow: 'Methodology' },
    { key: 'about', title: 'How this site works', eyebrow: 'About' },
    { key: ogKey(EDITOR_PROFILE.path), title: EDITOR_PROFILE.name, eyebrow: 'The human in the loop' },
    { key: 'articles', title: 'All articles', eyebrow: 'Archive' },
    ...sections.map(({ key }) => ({
      key: ogKey(SECTIONS[key].path),
      title: key === 'lab' ? 'Our own data, including the unflattering parts.' : SECTIONS[key].name,
      eyebrow: key === 'lab' ? 'Lab Notebook' : 'Section',
      lab: key === 'lab',
    })),
    ...posts.map((p) => ({
      key: ogKey(postUrl(p)),
      title: p.data.title,
      eyebrow: SECTIONS[p.data.category].name,
      lab: p.data.category === 'lab',
    })),
  ];
}

const font = (pkg: string, file: string) => readFileSync(`node_modules/@fontsource/${pkg}/files/${file}`);
let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
function loadFonts() {
  fonts ??= [
    { name: 'Newsreader', data: font('newsreader', 'newsreader-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Newsreader', data: font('newsreader', 'newsreader-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'Public Sans', data: font('public-sans', 'public-sans-latin-700-normal.woff'), weight: 700, style: 'normal' },
    { name: 'Caveat', data: font('caveat', 'caveat-latin-600-normal.woff'), weight: 600, style: 'normal' },
  ];
  return fonts;
}

const INK = '#1a1f2b';
const MUTED = '#5b6170';
const RED = '#c8372d';
const TEAL = '#0b6e5b';

// Satori takes a React-like element tree; plain objects avoid needing JSX here
const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

function wordmark(size: number) {
  return el('div', { display: 'flex', alignItems: 'flex-end', fontFamily: 'Newsreader', fontWeight: 600, fontSize: size, color: INK }, [
    el('span', { marginRight: size * 0.3 }, 'Content Written by'),
    el('div', { display: 'flex', position: 'relative' }, [
      el('span', { color: MUTED, textDecoration: 'line-through', textDecorationColor: RED }, 'a Human'),
      el('span', { position: 'absolute', left: size * 0.6, top: -size * 0.95, fontFamily: 'Caveat', fontSize: size * 1.15, color: RED, transform: 'rotate(-6deg)' }, 'AI'),
    ]),
  ]);
}

async function png(tree: unknown, width: number, height: number) {
  const svg = await satori(tree as Parameters<typeof satori>[0], { width, height, fonts: loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}

export async function renderOgImage(page: OgPage) {
  const accent = page.lab ? TEAL : RED;
  const size = page.title.length > 70 ? 58 : page.title.length > 40 ? 66 : 76;
  const tree = el(
    'div',
    {
      width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '64px 72px 56px', backgroundColor: page.lab ? '#f4f6f5' : '#ffffff',
      ...(page.lab && {
        backgroundImage: 'linear-gradient(#e3eae7 1px, transparent 1px), linear-gradient(90deg, #e3eae7 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }),
      borderBottom: `14px solid ${accent}`,
    },
    [
      el('div', { display: 'flex', marginTop: 14 }, [wordmark(30)]),
      el('div', { display: 'flex', flexDirection: 'column' }, [
        el('div', { fontFamily: 'Public Sans', fontWeight: 700, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: accent, marginBottom: 18 }, page.eyebrow),
        el('div', { fontFamily: 'Newsreader', fontWeight: 400, fontSize: size, lineHeight: 1.08, color: INK, maxWidth: 1000 }, page.title),
      ]),
      el('div', { display: 'flex', justifyContent: 'space-between', fontFamily: 'Public Sans', fontWeight: 700, fontSize: 22, color: MUTED }, [
        el('span', {}, 'Written by AI · Fact-checked · Approved by a human'),
        el('span', {}, 'contentwrittenbyai.com'),
      ]),
    ],
  );
  return png(tree, 1200, 630);
}

// Square mark for Organization.logo
export async function renderLogo() {
  const tree = el('div', { width: 512, height: 512, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }, [
    el('div', { display: 'flex', alignItems: 'flex-end', position: 'relative' }, [
      el('span', { fontFamily: 'Newsreader', fontWeight: 600, fontSize: 120, color: INK }, 'CW'),
      el('span', { fontFamily: 'Caveat', fontWeight: 600, fontSize: 160, color: RED, marginLeft: 14, marginRight: 20, transform: 'rotate(-8deg)' }, 'AI'),
    ]),
  ]);
  return png(tree, 512, 512);
}
