import type { APIRoute } from 'astro';
import { isAdmin, SESSION_COOKIE } from '../../../lib/server/auth';
import { db } from '../../../lib/server/supabase';

export const prerender = false;

const STATUSES = ['new', 'contacted', 'booked', 'archived'];

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isAdmin(cookies.get(SESSION_COOKIE)?.value))) return new Response('Unauthorized', { status: 401 });
  const client = db();
  if (!client) return new Response('Database not configured', { status: 503 });
  const { id, status } = await request.json().catch(() => ({}));
  if (typeof id !== 'string' || !STATUSES.includes(status)) return new Response('Bad request', { status: 400 });
  const { error } = await client.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return new Response(error.message, { status: 500 });
  return new Response(null, { status: 204 });
};
