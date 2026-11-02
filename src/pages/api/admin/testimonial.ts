import type { APIRoute } from 'astro';
import { isAdmin, SESSION_COOKIE } from '../../../lib/server/auth';
import { dbConfigured, query } from '../../../lib/server/db';

export const prerender = false;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Moderate a testimonial: approve (optionally with edited text), save edits, reject, unpublish or delete.
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isAdmin(cookies.get(SESSION_COOKIE)?.value))) return new Response('Unauthorized', { status: 401 });
  if (!dbConfigured()) return new Response('Database not configured', { status: 503 });
  const { id, action, name, body } = await request.json().catch(() => ({}));
  if (typeof id !== 'string' || !UUID_RE.test(id)) return new Response('Bad request', { status: 400 });

  // null = keep the current value
  const newName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 80) : null;
  const newBody = typeof body === 'string' && body.trim().length >= 10 ? body.trim().slice(0, 3000) : null;

  const SQL: Record<string, [string, unknown[]]> = {
    approve: [`update testimonials set name = coalesce($2, name), body = coalesce($3, body), status = 'approved', approved_at = now(), updated_at = now() where id = $1`, [id, newName, newBody]],
    save: [`update testimonials set name = coalesce($2, name), body = coalesce($3, body), updated_at = now() where id = $1`, [id, newName, newBody]],
    reject: [`update testimonials set status = 'rejected', approved_at = null, updated_at = now() where id = $1`, [id]],
    unpublish: [`update testimonials set status = 'pending', approved_at = null, updated_at = now() where id = $1`, [id]],
    delete: [`delete from testimonials where id = $1`, [id]],
  };
  const op = SQL[action as string];
  if (!op) return new Response('Bad request', { status: 400 });
  try {
    await query(...op);
  } catch (err) {
    console.error('[testimonial:moderate]', err);
    return new Response('Could not save', { status: 500 });
  }
  return new Response(null, { status: 204 });
};
