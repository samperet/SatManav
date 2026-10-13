import { getSecret } from 'astro:env/server';

// Password-protected admin: a signed, HttpOnly session cookie. Changing ADMIN_PASSWORD signs everyone out.
export const SESSION_COOKIE = 'sm_admin';
export const SESSION_DAYS = 14;

const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer) => Buffer.from(buf).toString('base64url');

async function sign(data: string): Promise<string> {
  const secret = `${getSecret('ADMIN_PASSWORD') ?? ''}|${getSecret('SUPABASE_SECRET_KEY') ?? ''}`;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

async function sha(s: string) {
  return Buffer.from(await crypto.subtle.digest('SHA-256', enc.encode(s)));
}

/** Constant-time comparison of two strings (hash both so lengths always match). */
async function same(a: string, b: string) {
  const [x, y] = await Promise.all([sha(a), sha(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export const adminConfigured = () => Boolean(getSecret('ADMIN_PASSWORD'));

export async function checkPassword(input: string) {
  const pw = getSecret('ADMIN_PASSWORD');
  return Boolean(pw) && (await same(input, pw!));
}

export async function createSession() {
  const exp = String(Date.now() + SESSION_DAYS * 864e5);
  return `${exp}.${await sign(exp)}`;
}

export async function isAdmin(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || !(Number(exp) > Date.now())) return false;
  return same(sig, await sign(exp));
}
