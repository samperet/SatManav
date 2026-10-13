import { getSecret } from 'astro:env/server';

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export type Attachment = { filename: string; content: string };

/** Email Shug via Resend. Returns false (without throwing) when email isn't configured. */
export async function sendEmail(opts: { subject: string; rows: [string, string][]; replyTo?: string; attachments?: Attachment[]; footer?: string }) {
  const apiKey = getSecret('RESEND_API_KEY');
  if (!apiKey) return false;
  const to = getSecret('LEAD_TO_EMAIL') || 'satmanavyogi@gmail.com';
  const from = getSecret('LEAD_FROM_EMAIL') || 'Sat Manav Website <onboarding@resend.dev>';
  const { subject, rows, replyTo, attachments = [], footer = '' } = opts;

  const filled = rows.filter(([, v]) => v);
  const html = `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.5;color:#2a1210">
    <h2 style="color:#a51d14;font-weight:normal">${esc(subject)}</h2>
    <table cellpadding="6" style="border-collapse:collapse">${filled
      .map(([k, v]) => `<tr><td style="vertical-align:top;color:#6b4a44;white-space:nowrap">${esc(k)}</td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
      .join('')}</table>
    ${attachments.length ? `<p style="color:#6b4a44">${attachments.length} photo(s) attached.</p>` : ''}
    ${footer ? `<p style="color:#6b4a44;font-size:13px">${esc(footer)}</p>` : ''}
  </div>`;
  const text = filled.map(([k, v]) => `${k}: ${v}`).join('\n') + (footer ? `\n\n${footer}` : '');

  const res = await fetch(getSecret('RESEND_API_URL') || 'https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], ...(replyTo ? { reply_to: replyTo } : {}), subject, html, text, attachments }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return true;
}
