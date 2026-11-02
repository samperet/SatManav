import type { APIRoute } from 'astro';
import { isAdmin, SESSION_COOKIE } from '../../../lib/server/auth';
import { dbConfigured, query } from '../../../lib/server/db';

export const prerender = false;

const STATUSES = ['new', 'contacted', 'booked', 'archived'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isAdmin(cookies.get(SESSION_COOKIE)?.value))) return new Response('Unauthorized', { status: 401 });
  if (!dbConfigured()) return new Response('Database not configured', { status: 503 });
  const { id, status } = await request.json().catch(() => ({}));
  if (typeof id !== 'string' || !UUID_RE.test(id) || !STATUSES.includes(status)) return new Response('Bad request', { status: 400 });
  try {
    await query('update leads set status = $2, updated_at = now() where id = $1', [id, status]);
  } catch (err) {
    console.error('[lead-status]', err);
    return new Response('Could not save', { status: 500 });
  }
  return new Response(null, { status: 204 });
};
