import type { APIRoute, GetStaticPaths } from 'astro';
import { ogPages, renderOgImage, renderLogo, type OgPage } from '../../lib/og';

export const getStaticPaths: GetStaticPaths = async () => [
  ...(await ogPages()).map((page) => ({ params: { key: page.key }, props: { page } })),
  { params: { key: 'logo' }, props: { page: null } },
];

export const GET: APIRoute = async ({ props }) => {
  const page = props.page as OgPage | null;
  const body = page ? await renderOgImage(page) : await renderLogo();
  return new Response(new Uint8Array(body), { headers: { 'Content-Type': 'image/png' } });
};
