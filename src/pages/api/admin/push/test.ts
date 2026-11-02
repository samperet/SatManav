import type { APIRoute } from 'astro';
import { isAdmin, SESSION_COOKIE } from '../../../../lib/server/auth';
import { notifyAdmins } from '../../../../lib/server/push';

export const prerender = false;

// POST { endpoint }: send a test notification to this device only.
export const POST: APIRoute = async ({ cookies, request }) => {
  if (!(await isAdmin(cookies.get(SESSION_COOKIE)?.value))) return new Response('Unauthorized', { status: 401 });
  const { endpoint } = await request.json().catch(() => ({}));
  if (typeof endpoint !== 'string') return new Response('Bad request', { status: 400 });
  const sent = await notifyAdmins({ title: 'Sat Manav', body: 'Notifications are working on this device. 🙏', url: '/admin', tag: 'test' }, endpoint);
  return new Response(JSON.stringify({ ok: sent > 0 }), { status: sent > 0 ? 200 : 502, headers: { 'Content-Type': 'application/json' } });
};
