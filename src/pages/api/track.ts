import type { APIRoute } from 'astro';
import { db, serverSecret } from '../../lib/server/db';
import { attribute, clientIp, deviceInfo, geo, isBot, visitorId, type Touch } from '../../lib/server/attribution';

// Cookieless page-view beacon. Stores no IP and no raw user agent.
export const prerender = false;

const ok = () => new Response(null, { status: 204 });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ua = request.headers.get('user-agent') ?? '';
  if (isBot(ua)) return ok();

  let body: { p?: string; entry?: boolean; t?: Touch };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return ok();
  }
  const path = typeof body.p === 'string' ? body.p.slice(0, 200) : '';
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return ok();

  try {
    const q = await db();
    if (!q) return ok();
    const a = body.entry ? attribute(body.t ?? {}) : null;
    const g = geo(request.headers);
    const d = deviceInfo(ua);
    await q(
      `insert into pageviews (visitor, path, source, medium, referrer_host, utm_source, utm_medium, utm_campaign, country, region, city, device, browser, os)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        await visitorId(clientIp(request, clientAddress), ua, serverSecret()),
        path,
        a?.source ?? null, a?.medium ?? null, a?.referrer_host ?? null, a?.utm_source ?? null, a?.utm_medium ?? null, a?.utm_campaign ?? null,
        g.country, g.region, g.city,
        d.device, d.browser, d.os,
      ],
    );
  } catch (e) {
    console.error('[track]', e instanceof Error ? e.message : e);
  }
  return ok();
};
