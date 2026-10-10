import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';

// Runs on Vercel as a serverless function; everything else is static.
export const prerender = false;

const MAX_PHOTOS = 8;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB in total
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const field = (form: FormData, name: string, max = 5000) => String(form.get(name) ?? '').trim().slice(0, max);

type Attachment = { filename: string; content: string };

async function sendEmail(subject: string, rows: [string, string][], replyTo: string, attachments: Attachment[] = []) {
  const apiKey = getSecret('RESEND_API_KEY');
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  const to = getSecret('LEAD_TO_EMAIL') || 'satmanavyogi@gmail.com';
  const from = getSecret('LEAD_FROM_EMAIL') || 'Sat Manav Website <onboarding@resend.dev>';

  const filled = rows.filter(([, v]) => v);
  const html = `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.5;color:#2a1210">
    <h2 style="color:#a51d14;font-weight:normal">${esc(subject)}</h2>
    <table cellpadding="6" style="border-collapse:collapse">${filled
      .map(([k, v]) => `<tr><td style="vertical-align:top;color:#6b4a44;white-space:nowrap">${esc(k)}</td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
      .join('')}</table>
    ${attachments.length ? `<p style="color:#6b4a44">${attachments.length} photo(s) attached.</p>` : ''}
    <p style="color:#6b4a44;font-size:13px">Reply to this email to answer ${esc(replyTo)} directly.</p>
  </div>`;
  const text = filled.map(([k, v]) => `${k}: ${v}`).join('\n');

  const res = await fetch(getSecret('RESEND_API_URL') || 'https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, html, text, attachments }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export const POST: APIRoute = async ({ request }) => {
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

  const stage = field(form, 'stage', 20);

  try {
    if (stage === 'email') {
      await sendEmail(`New lead: ${email}`, [
        ['Email', email],
        ['Source', 'Journey form (step 1: email only)'],
      ], email);
      return json(200, { ok: true });
    }

    if (stage === 'details') {
      const photos = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);
      if (photos.length > MAX_PHOTOS) return json(400, { ok: false, error: 'too_many_photos' });
      if (photos.some((p) => !p.type.startsWith('image/'))) return json(400, { ok: false, error: 'not_an_image' });
      if (photos.reduce((n, p) => n + p.size, 0) > MAX_PHOTO_BYTES) return json(413, { ok: false, error: 'photos_too_large' });

      const attachments = await Promise.all(
        photos.map(async (p, i) => ({
          filename: (p.name || `photo-${i + 1}.jpg`).replace(/[^\w.\-]+/g, '_').slice(-80),
          content: Buffer.from(await p.arrayBuffer()).toString('base64'),
        })),
      );
      const name = [field(form, 'first', 100), field(form, 'last', 100)].filter(Boolean).join(' ');
      const rate = (k: string) => (field(form, k, 1) ? `${field(form, k, 1)} / 5` : '');

      await sendEmail(`Journey details: ${name || email}`, [
        ['Name', name],
        ['Email', email],
        ['Phone', field(form, 'phone', 40)],
        ['What is your intention for our work together?', field(form, 'intention')],
        ['Geometric', rate('geometric')],
        ['Abstract', rate('abstract')],
        ['Eastern Traditional', rate('eastern')],
        ['Anything else you want to add?', field(form, 'message')],
      ], email, attachments);
      return json(200, { ok: true });
    }

    return json(400, { ok: false, error: 'unknown_stage' });
  } catch (err) {
    console.error('[lead]', err);
    return json(502, { ok: false, error: 'send_failed' });
  }
};
