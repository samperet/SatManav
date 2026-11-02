import type { APIRoute } from 'astro';
import { isAdmin, SESSION_COOKIE } from '../../../../lib/server/auth';
import { dbConfigured, query } from '../../../../lib/server/db';
import { vapidKeys } from '../../../../lib/server/push';

export const prerender = false;

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const guard = async (cookie: string | undefined) => {
  if (!(await isAdmin(cookie))) return json(401, { ok: false, error: 'unauthorized' });
  if (!dbConfigured()) return json(503, { ok: false, error: 'database_not_configured' });
  return null;
};

const isPushEndpoint = (s: unknown): s is string => {
  if (typeof s !== 'string' || s.length > 1000) return false;
  try {
    return new URL(s).protocol === 'https:';
  } catch {
    return false;
  }
};

// GET: the public key the browser needs to subscribe, plus how many devices are subscribed.
export const GET: APIRoute = async ({ cookies }) => {
  const denied = await guard(cookies.get(SESSION_COOKIE)?.value);
  if (denied) return denied;
  const { publicKey } = await vapidKeys();
  const rows = await query<{ n: number }>('select count(*)::int as n from push_subscriptions');
  return json(200, { ok: true, publicKey, devices: rows[0].n });
};

// POST: subscribe this device ({ subscription, label }).
export const POST: APIRoute = async ({ cookies, request }) => {
  const denied = await guard(cookies.get(SESSION_COOKIE)?.value);
  if (denied) return denied;
  const { subscription, label } = await request.json().catch(() => ({}));
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;
  if (!isPushEndpoint(endpoint) || typeof p256dh !== 'string' || typeof auth !== 'string' || p256dh.length > 200 || auth.length > 100) {
    return json(400, { ok: false, error: 'bad_subscription' });
  }
  await query(
    `insert into push_subscriptions (endpoint, p256dh, auth, label) values ($1, $2, $3, $4)
     on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth, label = excluded.label`,
    [endpoint, p256dh, auth, typeof label === 'string' ? label.slice(0, 80) : null],
  );
  return json(200, { ok: true });
};

// DELETE: unsubscribe this device ({ endpoint }).
export const DELETE: APIRoute = async ({ cookies, request }) => {
  const denied = await guard(cookies.get(SESSION_COOKIE)?.value);
  if (denied) return denied;
  const { endpoint } = await request.json().catch(() => ({}));
  if (!isPushEndpoint(endpoint)) return json(400, { ok: false, error: 'bad_endpoint' });
  await query('delete from push_subscriptions where endpoint = $1', [endpoint]);
  return json(200, { ok: true });
};
