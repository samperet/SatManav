import { defineMiddleware } from 'astro:middleware';

// CSRF protection for form posts. Replaces Astro's built-in checkOrigin, which compares the
// Origin header with the URL the server sees; behind Vercel's proxy that URL is not the
// public host, so it rejected every legitimate submission. Here we compare against the
// public Host header instead.
const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function hostOf(value: string | null) {
  if (!value || value === 'null') return null;
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

export const onRequest = defineMiddleware(async ({ request, isPrerendered }, next) => {
  if (isPrerendered || !UNSAFE.has(request.method)) return next();
  const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '').split(',')[0].trim().toLowerCase();
  const from = hostOf(request.headers.get('origin')) ?? hostOf(request.headers.get('referer'));
  if (!host || from !== host) {
    return new Response('Cross-site requests are not allowed', { status: 403 });
  }
  return next();
});
