import type { APIRoute } from 'astro';
import { db } from '../../lib/server/supabase';
import { sendEmail } from '../../lib/server/email';

// Public: GET approved testimonials (CDN-cached), POST a new one for approval.
export const prerender = false;

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const GET: APIRoute = async () => {
  const client = db();
  if (!client) return json(200, []);
  const { data, error } = await client
    .from('testimonials')
    .select('name, body, approved_at')
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })
    .limit(50);
  if (error) {
    console.error('[testimonial:get]', error.message);
    return json(200, []);
  }
  // Cached at Vercel's edge for a minute, then refreshed in the background.
  return json(200, data, { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' });
};

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: 'bad_request' });
  }
  const get = (k: string, max: number) => String(form.get(k) ?? '').trim().slice(0, max);
  if (get('website', 200)) return json(200, { ok: true }); // honeypot

  const name = get('name', 80);
  const email = get('email', 254).toLowerCase();
  const body = get('body', 3000);
  const consent = form.get('consent') === 'on';
  if (!name) return json(400, { ok: false, error: 'name_required' });
  if (body.length < 10) return json(400, { ok: false, error: 'body_too_short' });
  if (email && !EMAIL_RE.test(email)) return json(400, { ok: false, error: 'invalid_email' });
  if (!consent) return json(400, { ok: false, error: 'consent_required' });

  const client = db();
  if (!client) return json(503, { ok: false, error: 'not_configured' });
  const { error } = await client.from('testimonials').insert({ name, email: email || null, body, consent });
  if (error) {
    console.error('[testimonial:post]', error.message);
    return json(502, { ok: false, error: 'save_failed' });
  }
  await sendEmail({
    subject: `New testimonial from ${name} (awaiting approval)`,
    rows: [['Name', name], ['Email', email], ['Testimonial', body]],
    replyTo: email || undefined,
    footer: 'Approve or reject it at https://satmanavyogitattoos.com/admin#testimonials',
  }).catch((e) => console.error('[testimonial:email]', e));
  return json(200, { ok: true });
};
