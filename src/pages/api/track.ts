import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { db } from '../../lib/server/supabase';
import { attribute, clientIp, deviceInfo, geo, isBot, visitorId, type Touch } from '../../lib/server/attribution';

// Cookieless page-view beacon. Stores no IP and no raw user agent.
export const prerender = false;

const ok = () => new Response(null, { status: 204 });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const client = db();
  const ua = request.headers.get('user-agent') ?? '';
  if (!client || isBot(ua)) return ok();

  let body: { p?: string; entry?: boolean; t?: Touch };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return ok();
  }
  const path = typeof body.p === 'string' ? body.p.slice(0, 200) : '';
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return ok();

  const a = body.entry ? attribute(body.t ?? {}) : null;
  const row = {
    visitor: await visitorId(clientIp(request, clientAddress), ua, getSecret('SUPABASE_SECRET_KEY') ?? ''),
    path,
    source: a?.source ?? null,
    medium: a?.medium ?? null,
    referrer_host: a?.referrer_host ?? null,
    utm_source: a?.utm_source ?? null,
    utm_medium: a?.utm_medium ?? null,
    utm_campaign: a?.utm_campaign ?? null,
    ...geo(request.headers),
    ...deviceInfo(ua),
  };
  const { error } = await client.from('pageviews').insert(row);
  if (error) console.error('[track]', error.message);
  return ok();
};
