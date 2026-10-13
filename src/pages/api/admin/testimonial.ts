import type { APIRoute } from 'astro';
import { isAdmin, SESSION_COOKIE } from '../../../lib/server/auth';
import { db } from '../../../lib/server/supabase';

export const prerender = false;

// Moderate a testimonial: approve (optionally with edited text), reject, unpublish or delete.
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isAdmin(cookies.get(SESSION_COOKIE)?.value))) return new Response('Unauthorized', { status: 401 });
  const client = db();
  if (!client) return new Response('Database not configured', { status: 503 });
  const { id, action, name, body } = await request.json().catch(() => ({}));
  if (typeof id !== 'string') return new Response('Bad request', { status: 400 });

  const now = new Date().toISOString();
  const edits: Record<string, string> = {};
  if (typeof name === 'string' && name.trim()) edits.name = name.trim().slice(0, 80);
  if (typeof body === 'string' && body.trim().length >= 10) edits.body = body.trim().slice(0, 3000);

  let query;
  switch (action) {
    case 'approve':
      query = client.from('testimonials').update({ ...edits, status: 'approved', approved_at: now, updated_at: now }).eq('id', id);
      break;
    case 'save':
      query = client.from('testimonials').update({ ...edits, updated_at: now }).eq('id', id);
      break;
    case 'reject':
    case 'unpublish':
      query = client.from('testimonials').update({ status: action === 'reject' ? 'rejected' : 'pending', approved_at: null, updated_at: now }).eq('id', id);
      break;
    case 'delete':
      query = client.from('testimonials').delete().eq('id', id);
      break;
    default:
      return new Response('Bad request', { status: 400 });
  }
  const { error } = await query;
  if (error) return new Response(error.message, { status: 500 });
  return new Response(null, { status: 204 });
};
