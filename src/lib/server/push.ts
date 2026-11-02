import webpush from 'web-push';
import { getSecret } from 'astro:env/server';
import { dbConfigured, query } from './db';

// Web push for the /admin PWA. The VAPID key pair is generated once and kept in the database,
// so no setup is needed (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY env vars override it if set).

type Vapid = { publicKey: string; privateKey: string };
let cached: Promise<Vapid> | null = null;

export function vapidKeys(): Promise<Vapid> {
  const pub = getSecret('VAPID_PUBLIC_KEY');
  const priv = getSecret('VAPID_PRIVATE_KEY');
  if (pub && priv) return Promise.resolve({ publicKey: pub, privateKey: priv });
  cached ??= (async () => {
    const fresh = webpush.generateVAPIDKeys();
    // First writer wins, so concurrent cold starts agree on one key pair.
    await query(`insert into app_settings (key, value) values ('vapid', $1) on conflict (key) do nothing`, [JSON.stringify(fresh)]);
    const rows = await query<{ value: string }>(`select value from app_settings where key = 'vapid'`);
    return JSON.parse(rows[0].value) as Vapid;
  })().catch((err) => {
    cached = null;
    throw err;
  });
  return cached;
}

export type PushPayload = { title: string; body?: string; url?: string; tag?: string };
type Sub = { endpoint: string; p256dh: string; auth: string };

async function sendTo(sub: Sub, payload: PushPayload, vapid: Vapid) {
  try {
    await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload), {
      vapidDetails: { subject: `mailto:${getSecret('LEAD_TO_EMAIL') || 'satmanavyogi@gmail.com'}`, ...vapid },
      TTL: 60 * 60 * 24,
      urgency: 'high',
      timeout: 8000,
    });
    await query('update push_subscriptions set last_success_at = now() where endpoint = $1', [sub.endpoint]);
    return true;
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      // The browser revoked this subscription; forget the device.
      await query('delete from push_subscriptions where endpoint = $1', [sub.endpoint]);
    } else {
      console.error('[push]', status ?? '', err instanceof Error ? err.message : err);
    }
    return false;
  }
}

/** Notify every subscribed admin device. Never throws. */
export async function notifyAdmins(payload: PushPayload, onlyEndpoint?: string) {
  try {
    if (!dbConfigured()) return 0;
    const subs = await query<Sub>(
      onlyEndpoint ? 'select endpoint, p256dh, auth from push_subscriptions where endpoint = $1' : 'select endpoint, p256dh, auth from push_subscriptions',
      onlyEndpoint ? [onlyEndpoint] : [],
    );
    if (!subs.length) return 0;
    const vapid = await vapidKeys();
    const results = await Promise.all(subs.map((s) => sendTo(s, payload, vapid)));
    return results.filter(Boolean).length;
  } catch (err) {
    console.error('[push]', err);
    return 0;
  }
}
