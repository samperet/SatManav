import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { db, PHOTO_BUCKET } from '../../lib/server/supabase';
import { attribute, clientIp, deviceInfo, geo, visitorId, type Touch } from '../../lib/server/attribution';
import { sendEmail } from '../../lib/server/email';

// Journey form: saves each lead to the database (shown in /admin) and emails it to Shug.
export const prerender = false;

const MAX_PHOTOS = 8;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB in total
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const field = (form: FormData, name: string, max = 5000) => String(form.get(name) ?? '').trim().slice(0, max);
const rating = (form: FormData, name: string) => {
  const n = Number(field(form, name, 1));
  return n >= 1 && n <= 5 ? n : null;
};
const FOOTER = 'Reply to this email to answer them directly. All leads: https://satmanavyogitattoos.com/admin';

/** Run both delivery channels; succeed if at least one worked. */
async function deliver(label: string, store: () => Promise<boolean>, email: () => Promise<boolean>) {
  const [s, e] = await Promise.allSettled([store(), email()]);
  if (s.status === 'rejected') console.error(`[lead:${label}] store`, s.reason);
  if (e.status === 'rejected') console.error(`[lead:${label}] email`, e.reason);
  return (s.status === 'fulfilled' && s.value) || (e.status === 'fulfilled' && e.value);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: 'bad_request' });
  }

  // Honeypot: bots fill every field. Pretend success so they move on.
  if (field(form, 'website')) return json(200, { ok: true });

  const email = field(form, 'email', 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return json(400, { ok: false, error: 'invalid_email' });

  const client = db();
  const stage = field(form, 'stage', 20);
  let touch: Touch = {};
  try {
    touch = JSON.parse(field(form, 'touch', 2000) || '{}');
  } catch {}
  const a = attribute(touch);
  const ua = request.headers.get('user-agent') ?? '';
  const sourceLine = [a.source, a.utm_campaign && `campaign: ${a.utm_campaign}`].filter(Boolean).join(' · ');

  if (stage === 'email') {
    let id: string | null = null;
    const sent = await deliver(
      'email',
      async () => {
        if (!client) return false;
        const { data, error } = await client
          .from('leads')
          .insert({
            email,
            stage: 'email',
            source: a.source,
            medium: a.medium,
            referrer_host: a.referrer_host,
            utm_campaign: a.utm_campaign,
            landing_path: typeof touch.landing === 'string' ? touch.landing.slice(0, 200) : null,
            ...geo(request.headers),
            device: deviceInfo(ua).device,
            visitor: await visitorId(clientIp(request, clientAddress), ua, getSecret('SUPABASE_SECRET_KEY') ?? ''),
          })
          .select('id')
          .single();
        if (error) throw error;
        id = data.id;
        return true;
      },
      () => sendEmail({ subject: `New lead: ${email}`, rows: [['Email', email], ['Source', sourceLine], ['Step', 'Email only (step 1)']], replyTo: email, footer: FOOTER }),
    );
    return sent ? json(200, { ok: true, id }) : json(502, { ok: false, error: 'send_failed' });
  }

  if (stage === 'details') {
    const photos = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);
    if (photos.length > MAX_PHOTOS) return json(400, { ok: false, error: 'too_many_photos' });
    if (photos.some((p) => !p.type.startsWith('image/'))) return json(400, { ok: false, error: 'not_an_image' });
    if (photos.reduce((n, p) => n + p.size, 0) > MAX_PHOTO_BYTES) return json(413, { ok: false, error: 'photos_too_large' });

    const files = await Promise.all(
      photos.map(async (p, i) => ({
        name: (p.name || `photo-${i + 1}.jpg`).replace(/[^\w.\-]+/g, '_').slice(-80),
        type: p.type,
        bytes: Buffer.from(await p.arrayBuffer()),
      })),
    );
    const details = {
      first_name: field(form, 'first', 100) || null,
      last_name: field(form, 'last', 100) || null,
      phone: field(form, 'phone', 40) || null,
      intention: field(form, 'intention') || null,
      geometric: rating(form, 'geometric'),
      abstract: rating(form, 'abstract'),
      eastern: rating(form, 'eastern'),
      message: field(form, 'message') || null,
    };
    const name = [details.first_name, details.last_name].filter(Boolean).join(' ');
    const rate = (n: number | null) => (n ? `${n} / 5` : '');
    const idIn = field(form, 'id', 40);

    const sent = await deliver(
      'details',
      async () => {
        if (!client) return false;
        // Reuse the step-1 row when we have it; otherwise create one.
        let id = UUID_RE.test(idIn) ? idIn : null;
        if (id) {
          const { data } = await client.from('leads').select('id').eq('id', id).eq('email', email).maybeSingle();
          id = data?.id ?? null;
        }
        if (!id) {
          const { data, error } = await client
            .from('leads')
            .insert({ email, stage: 'details', source: a.source, medium: a.medium, referrer_host: a.referrer_host, utm_campaign: a.utm_campaign, ...geo(request.headers), device: deviceInfo(ua).device })
            .select('id')
            .single();
          if (error) throw error;
          id = data.id as string;
        }
        const paths: string[] = [];
        for (const [i, f] of files.entries()) {
          const path = `${id}/${Date.now()}-${i + 1}-${f.name}`;
          const { error } = await client.storage.from(PHOTO_BUCKET).upload(path, f.bytes, { contentType: f.type, upsert: false });
          if (error) console.error('[lead] photo upload', error.message);
          else paths.push(path);
        }
        const { error } = await client
          .from('leads')
          .update({ ...details, stage: 'details', photos: paths, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
        return true;
      },
      () =>
        sendEmail({
          subject: `Journey details: ${name || email}`,
          rows: [
            ['Name', name],
            ['Email', email],
            ['Phone', details.phone ?? ''],
            ['What is your intention for our work together?', details.intention ?? ''],
            ['Geometric', rate(details.geometric)],
            ['Abstract', rate(details.abstract)],
            ['Eastern Traditional', rate(details.eastern)],
            ['Anything else you want to add?', details.message ?? ''],
            ['Source', sourceLine],
          ],
          replyTo: email,
          attachments: files.map((f) => ({ filename: f.name, content: f.bytes.toString('base64') })),
          footer: FOOTER,
        }),
    );
    return sent ? json(200, { ok: true }) : json(502, { ok: false, error: 'send_failed' });
  }

  return json(400, { ok: false, error: 'unknown_stage' });
};
