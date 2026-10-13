// Header state, mobile menu and gallery lightbox.
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

const header = $('[data-header]');
const onScroll = () => header?.classList.toggle('is-solid', header.dataset.solid === 'always' || window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const menuBtn = $('[data-menu]');
const setMenu = (open: boolean) => {
  document.documentElement.classList.toggle('menu-open', open);
  menuBtn?.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
};
menuBtn?.addEventListener('click', () => setMenu(!document.documentElement.classList.contains('menu-open')));
$$('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

const tiles = $$<HTMLButtonElement>('[data-lightbox]');
if (tiles.length) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = `
    <button class="lb-btn lb-prev" aria-label="Previous">‹</button>
    <img alt="" />
    <button class="lb-btn lb-next" aria-label="Next">›</button>
    <button class="lb-btn lb-close" aria-label="Close">×</button>`;
  document.body.appendChild(lb);
  const img = $<HTMLImageElement>('img', lb)!;
  let idx = 0;
  let opener: HTMLElement | null = null;
  const show = (i: number) => {
    idx = (i + tiles.length) % tiles.length;
    img.src = tiles[idx].dataset.full!;
    img.alt = tiles[idx].dataset.alt ?? '';
  };
  const close = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    opener?.focus();
  };
  tiles.forEach((t, i) =>
    t.addEventListener('click', () => {
      opener = t;
      show(i);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      $<HTMLButtonElement>('.lb-close', lb)!.focus();
    }),
  );
  $('.lb-prev', lb)!.addEventListener('click', () => show(idx - 1));
  $('.lb-next', lb)!.addEventListener('click', () => show(idx + 1));
  $('.lb-close', lb)!.addEventListener('click', close);
  lb.addEventListener('click', (e) => e.target === lb && close());
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let sx = 0;
  lb.addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });
}

/* ---------- Privacy-friendly analytics: no cookies, honours Do Not Track / GPC ---------- */
(() => {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl || navigator.doNotTrack === '1') return;
  const q = new URLSearchParams(location.search);
  let refHost = '';
  try {
    refHost = document.referrer ? new URL(document.referrer).host : '';
  } catch {}
  const external = Boolean(refHost) && refHost !== location.host;
  const touch = {
    ref: external ? document.referrer : undefined,
    utm_source: q.get('utm_source') ?? undefined,
    utm_medium: q.get('utm_medium') ?? undefined,
    utm_campaign: q.get('utm_campaign') ?? undefined,
    src: q.get('src') ?? undefined,
    landing: location.pathname,
  };
  const key = [touch.ref, touch.utm_source, touch.utm_medium, touch.utm_campaign, touch.src].join('|');
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem('sm-touch-key');
  } catch {}
  // An entry = first page of the visit, or arriving again from a new external link/campaign.
  const entry = stored === null || ((external || key.replace(/\|/g, '') !== '') && key !== stored);
  if (entry) {
    try {
      sessionStorage.setItem('sm-touch-key', key);
      sessionStorage.setItem('sm-touch', JSON.stringify(touch));
    } catch {}
  }
  const body = JSON.stringify({ p: location.pathname, entry, t: entry ? touch : undefined });
  if (!navigator.sendBeacon?.('/api/track', body)) {
    fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {});
  }
})();
