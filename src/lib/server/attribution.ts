// Where did a visitor come from? Shared by page-view tracking and lead capture.

export type Touch = {
  ref?: string; // document.referrer of the entry page (external only)
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  src?: string; // short ?src= tag, e.g. ?src=instagram on the Instagram bio link
  landing?: string;
};

export type Attribution = {
  source: string;
  medium: string;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

const KNOWN: [RegExp, string, string][] = [
  [/(^|\.)instagram\.com$/, 'Instagram', 'Social'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'Facebook', 'Social'],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, 'X', 'Social'],
  [/(^|\.)tiktok\.com$/, 'TikTok', 'Social'],
  [/(^|\.)pinterest\.[a-z.]+$/, 'Pinterest', 'Social'],
  [/(^|\.)reddit\.com$/, 'Reddit', 'Social'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'YouTube', 'Social'],
  [/(^|\.)linkedin\.com$/, 'LinkedIn', 'Social'],
  [/(^|\.)threads\.net$/, 'Threads', 'Social'],
  [/(^|\.)google\.[a-z.]+$/, 'Google', 'Search'],
  [/(^|\.)bing\.com$/, 'Bing', 'Search'],
  [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo', 'Search'],
  [/(^|\.)search\.yahoo\.com$|(^|\.)yahoo\.com$/, 'Yahoo', 'Search'],
  [/(^|\.)ecosia\.org$/, 'Ecosia', 'Search'],
  [/(^|\.)yelp\.[a-z.]+$/, 'Yelp', 'Referral'],
  [/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com)$/, 'AI assistant', 'Referral'],
];

const ALIASES: Record<string, string> = {
  ig: 'Instagram', insta: 'Instagram', instagram: 'Instagram',
  fb: 'Facebook', facebook: 'Facebook',
  google: 'Google', gbp: 'Google Business Profile', gmb: 'Google Business Profile',
  email: 'Email', newsletter: 'Email', qr: 'QR code', card: 'Business card', flyer: 'Flyer',
};

const clean = (s: unknown, max = 100) => (typeof s === 'string' && s.trim() ? s.trim().slice(0, max) : null);

function hostOf(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

function label(raw: string) {
  const key = raw.toLowerCase();
  return ALIASES[key] ?? raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function attribute(t: Touch): Attribution {
  const utm_source = clean(t.utm_source);
  const utm_medium = clean(t.utm_medium);
  const utm_campaign = clean(t.utm_campaign);
  const tag = clean(t.src) ?? utm_source;
  const referrer_host = hostOf(clean(t.ref, 500));

  if (tag) {
    const known = referrer_host && KNOWN.find(([re]) => re.test(referrer_host));
    const source = label(tag);
    const medium = utm_medium ? label(utm_medium) : known ? known[2] : source === 'Instagram' || source === 'Facebook' ? 'Social' : 'Campaign';
    return { source, medium, referrer_host, utm_source, utm_medium, utm_campaign };
  }
  if (referrer_host) {
    const known = KNOWN.find(([re]) => re.test(referrer_host));
    return known
      ? { source: known[1], medium: known[2], referrer_host, utm_source, utm_medium, utm_campaign }
      : { source: referrer_host, medium: 'Referral', referrer_host, utm_source, utm_medium, utm_campaign };
  }
  return { source: 'Direct', medium: 'Direct', referrer_host: null, utm_source, utm_medium, utm_campaign };
}

/** Coarse device/browser/OS from the user agent (no fingerprinting, no storage of the raw UA). */
export function deviceInfo(ua: string) {
  const device = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua) ? 'Tablet' : /Mobi|iPhone|Android/i.test(ua) ? 'Mobile' : 'Desktop';
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /OPR\/|Opera/.test(ua) ? 'Opera'
    : /SamsungBrowser/.test(ua) ? 'Samsung Internet'
    : /Instagram/.test(ua) ? 'Instagram in-app'
    : /FBAN|FBAV/.test(ua) ? 'Facebook in-app'
    : /Firefox|FxiOS/.test(ua) ? 'Firefox'
    : /Chrome|CriOS/.test(ua) ? 'Chrome'
    : /Safari/.test(ua) ? 'Safari'
    : 'Other';
  const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'Other';
  return { device, browser, os };
}

export const isBot = (ua: string) =>
  !ua || /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|preview|headless|lighthouse|pagespeed|monitor|curl|wget|python|httpclient|axios|node-fetch/i.test(ua);

/** Visitor location from Vercel's edge headers (empty locally). */
export function geo(headers: Headers) {
  const dec = (v: string | null) => {
    if (!v) return null;
    try {
      return decodeURIComponent(v).slice(0, 80);
    } catch {
      return v.slice(0, 80);
    }
  };
  return {
    country: dec(headers.get('x-vercel-ip-country')),
    region: dec(headers.get('x-vercel-ip-country-region')),
    city: dec(headers.get('x-vercel-ip-city')),
  };
}

/** Anonymous visitor id: hash of IP + UA with a salt that rotates daily, so nobody can be tracked across days. */
export async function visitorId(ip: string, ua: string, secret: string) {
  const day = new Date().toISOString().slice(0, 10);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${day}|${secret}|${ip}|${ua}`));
  return Buffer.from(buf).toString('hex').slice(0, 20);
}

export function clientIp(request: Request, fallback?: string) {
  return request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || fallback || '0.0.0.0';
}
