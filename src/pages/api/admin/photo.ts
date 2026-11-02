import type { APIRoute } from 'astro';
import { isAdmin, SESSION_COOKIE } from '../../../lib/server/auth';
import { readPhoto } from '../../../lib/server/photos';

// Streams a lead's photo from the private Blob store to a signed-in admin.
export const prerender = false;

export const GET: APIRoute = async ({ cookies, url }) => {
  if (!(await isAdmin(cookies.get(SESSION_COOKIE)?.value))) return new Response('Unauthorized', { status: 401 });
  const pathname = url.searchParams.get('p') ?? '';
  if (!/^leads\/[\w\-]+\/[\w.\-]+$/.test(pathname)) return new Response('Bad request', { status: 400 });
  const photo = await readPhoto(pathname).catch((e) => {
    console.error('[photo]', e instanceof Error ? e.message : e);
    return null;
  });
  if (!photo) return new Response('Not found', { status: 404 });
  return new Response(photo.stream, {
    headers: {
      'Content-Type': photo.contentType.startsWith('image/') ? photo.contentType : 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=3600',
      ...(photo.size ? { 'Content-Length': String(photo.size) } : {}),
    },
  });
};
