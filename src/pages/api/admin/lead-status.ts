import type { APIRoute } from 'astro';
import { isAdmin, SESSION_COOKIE } from '../../../lib/server/auth';
import { db } from '../../../lib/server/db';

export const prerender = false;

const STATUSES = ['new', 'contacted', 'booked', 'archived'];

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isAdmin(cookies.get(SESSION_COOKIE)?.value))) return new Response('Unauthorized', { status: 401 });
  const q = await db();
  if (!q) return new Response('Database not configured', { status: 503 });
  const { id, status } = await request.json().catch(() => ({}));
  if (typeof id !== 'string' || !STATUSES.includes(status)) return new Response('Bad request', { status: 400 });
  try {
    await q(`update leads set status = $2, updated_at = now() where id = $1::uuid`, [id, status]);
  } catch (e) {
    return new Response(e instanceof Error ? e.message : 'Update failed', { status: 500 });
  }
  return new Response(null, { status: 204 });
};
