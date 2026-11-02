import type { APIRoute } from 'astro';
import { isAdmin, SESSION_COOKIE } from '../../../lib/server/auth';
import { db } from '../../../lib/server/db';

export const prerender = false;

// Moderate a testimonial: approve (optionally with edited text), reject, unpublish or delete.
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isAdmin(cookies.get(SESSION_COOKIE)?.value))) return new Response('Unauthorized', { status: 401 });
  const q = await db();
  if (!q) return new Response('Database not configured', { status: 503 });
  const { id, action, name, body } = await request.json().catch(() => ({}));
  if (typeof id !== 'string') return new Response('Bad request', { status: 400 });

  const newName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 80) : null;
  const newBody = typeof body === 'string' && body.trim().length >= 10 ? body.trim().slice(0, 3000) : null;

  let sql: string;
  let params: unknown[] = [id];
  switch (action) {
    case 'approve':
      sql = `update testimonials set name = coalesce($2, name), body = coalesce($3, body), status = 'approved', approved_at = now(), updated_at = now() where id = $1::uuid`;
      params = [id, newName, newBody];
      break;
    case 'save':
      sql = `update testimonials set name = coalesce($2, name), body = coalesce($3, body), updated_at = now() where id = $1::uuid`;
      params = [id, newName, newBody];
      break;
    case 'reject':
    case 'unpublish':
      sql = `update testimonials set status = $2, approved_at = null, updated_at = now() where id = $1::uuid`;
      params = [id, action === 'reject' ? 'rejected' : 'pending'];
      break;
    case 'delete':
      sql = `delete from testimonials where id = $1::uuid`;
      break;
    default:
      return new Response('Bad request', { status: 400 });
  }
  try {
    await q(sql, params);
  } catch (e) {
    return new Response(e instanceof Error ? e.message : 'Update failed', { status: 500 });
  }
  return new Response(null, { status: 204 });
};
