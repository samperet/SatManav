import type { APIRoute } from 'astro';
import { isAdmin, SESSION_COOKIE } from '../../../lib/server/auth';
import { readPhoto } from '../../../lib/server/photos';

export const prerender = false;

// Streams a private lead photo from Vercel Blob, for signed-in admins only.
export const GET: APIRoute = async ({ cookies, url }) => {
  if (!(await isAdmin(cookies.get(SESSION_COOKIE)?.value))) return new Response('Unauthorized', { status: 401 });
  const p = url.searchParams.get('p') ?? '';
  if (!/^leads\/[0-9a-f-]{36}\/[\w.\-]+$/i.test(p)) return new Response('Bad request', { status: 400 });
  try {
    const photo = await readPhoto(p);
    if (!photo?.stream) return new Response('Not found', { status: 404 });
    return new Response(photo.stream, {
      headers: {
        'Content-Type': photo.blob.contentType ?? 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[photo]', err);
    return new Response('Not found', { status: 404 });
  }
};
