// Small moments of surprise & delight. Everything degrades gracefully and respects reduced motion.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

/* ---------- Toast ---------- */
let toastTimer = 0;
export function toast(msg: string, ms = 3600) {
  const t = $('[data-toast]');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('show'), ms);
}

/* ---------- Header: solid on scroll, hide on scroll-down ---------- */
const header = $('[data-header]');
let lastY = window.scrollY;
function onScrollHeader() {
  if (!header) return;
  const y = window.scrollY;
  const always = header.dataset.solid === 'always';
  header.classList.toggle('is-solid', always || y > 40);
  const open = document.documentElement.classList.contains('menu-open');
  header.classList.toggle('is-hidden', !open && y > 400 && y > lastY + 4);
  if (y < lastY - 4) header.classList.remove('is-hidden');
  lastY = y;
}

/* ---------- Mobile menu ---------- */
const menuBtn = $('[data-menu]');
menuBtn?.addEventListener('click', () => {
  const open = document.documentElement.classList.toggle('menu-open');
  menuBtn.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});
$$('#nav a').forEach((a) =>
  a.addEventListener('click', () => {
    document.documentElement.classList.remove('menu-open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }),
);

/* ---------- Mala (prayer-bead) reading progress ---------- */
const mala = $('[data-mala]');
const beads = mala ? $$('.bead', mala) : [];
let malaDone = false;
function onScrollMala() {
  if (!mala) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  mala.classList.toggle('show', window.scrollY > 300);
  const lit = Math.round(p * beads.length);
  beads.forEach((b, i) => b.classList.toggle('on', i < lit));
  const done = p > 0.985;
  if (done && !malaDone) toast('One full round of the mala. Om shanti. 🙏');
  malaDone = done;
  mala.classList.toggle('done', done);
}
mala?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

/* ---------- Mantra ticker: drifts, and speeds with scroll ---------- */
const tickers = $$('[data-ticker] .ticker__track');
let tx = 0;
let boost = 0;
let lastScroll = window.scrollY;
function tick() {
  const dy = window.scrollY - lastScroll;
  lastScroll = window.scrollY;
  boost = boost * 0.92 + dy * 0.08;
  tx -= 0.35 + Math.abs(boost) * 0.6;
  tickers.forEach((t) => {
    const half = t.scrollWidth / 2;
    if (half && -tx >= half) tx += half;
    t.style.transform = `translate3d(${tx}px,0,0) skewX(${Math.max(-8, Math.min(8, -boost * 0.4))}deg)`;
  });
  requestAnimationFrame(tick);
}
if (tickers.length && !reduce) requestAnimationFrame(tick);

/* ---------- Scroll reveals (fade + "ink bleed" for images) ---------- */
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }),
  { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
);
$$('.reveal, .reveal-ink').forEach((el) => io.observe(el));

/* ---------- Button glow follows the pointer ---------- */
document.addEventListener('pointermove', (e) => {
  const btn = (e.target as HTMLElement).closest?.('.btn') as HTMLElement | null;
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  btn.style.setProperty('--mx', `${e.clientX - r.left}px`);
  btn.style.setProperty('--my', `${e.clientY - r.top}px`);
});

/* ---------- Hero: ember glow follows the cursor ---------- */
const hero = $('[data-hero]');
const glow = $('[data-hero-glow]');
if (hero && glow && !reduce && matchMedia('(pointer:fine)').matches) {
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    glow.style.setProperty('--gx', `${e.clientX - r.left}px`);
    glow.style.setProperty('--gy', `${e.clientY - r.top}px`);
  });
}

/* ---------- Om: a gentle synthesized drone ---------- */
let ctx: AudioContext | null = null;
let sounding = false;
function soundOm(from?: HTMLElement) {
  if (sounding) return;
  sounding = true;
  try {
    ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.22, now + 1.2);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 6.5);
    // Low-pass sweep gives the "Ah-Oo-Mm" closing of the mouth
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1600, now);
    lp.frequency.exponentialRampToValueAtTime(900, now + 2.5);
    lp.frequency.exponentialRampToValueAtTime(220, now + 5.5);
    lp.connect(master).connect(ctx.destination);
    // 136.1 Hz, the traditional "Om" tone, with soft harmonics and a slow beat
    [[136.1, 0.5], [136.6, 0.35], [272.2, 0.18], [408.3, 0.08], [68.05, 0.3]].forEach(([f, g]) => {
      const o = ctx!.createOscillator();
      const og = ctx!.createGain();
      o.type = f > 300 ? 'sine' : 'triangle';
      o.frequency.value = f;
      og.gain.value = g;
      o.connect(og).connect(lp);
      o.start(now);
      o.stop(now + 6.8);
    });
  } catch {
    /* audio unavailable: still show the ripple */
  }
  if (from) {
    from.classList.add('sounding');
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('span');
      ring.className = 'om-ring';
      ring.style.animationDelay = `${i * 0.9}s`;
      from.appendChild(ring);
      setTimeout(() => ring.remove(), 4800 + i * 900);
    }
  }
  setTimeout(() => {
    sounding = false;
    from?.classList.remove('sounding');
  }, 6600);
}
$$('[data-om]').forEach((b) => b.addEventListener('click', () => soundOm(b)));
// Secret: type "om" anywhere (outside form fields)
let keys = '';
document.addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement;
  if (t.closest('input, textarea, select, [contenteditable]')) return;
  keys = (keys + e.key.toLowerCase()).slice(-2);
  if (keys === 'om') {
    soundOm($<HTMLElement>('[data-om]') ?? undefined);
    toast('ॐ  You found the hidden mantra.');
  }
});

/* ---------- Breathing practice ---------- */
const breath = $('[data-breath]');
const circle = $('[data-breath-circle]');
const word = $('[data-breath-word]');
const hint = $('[data-breath-hint]');
let breathTimers: number[] = [];
let lastFocus: HTMLElement | null = null;
function closeBreath() {
  breathTimers.forEach(clearTimeout);
  breathTimers = [];
  breath?.classList.remove('open');
  breath?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lastFocus?.focus();
}
function openBreath() {
  if (!breath || !circle || !word || !hint) return;
  lastFocus = document.activeElement as HTMLElement;
  breath.classList.add('open');
  breath.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $<HTMLElement>('[data-breath-close]', breath)?.focus();
  const phases: [string, number, number][] = [];
  for (let i = 0; i < 3; i++) phases.push(['Breathe in', 4000, 1], ['Hold', 2000, 1], ['Breathe out', 6000, 0.45]);
  let t = 600;
  word.textContent = 'Settle in';
  hint.textContent = 'Three slow breaths. Follow the lotus.';
  circle.style.setProperty('--t', '1s');
  circle.style.setProperty('--s', '.45');
  phases.forEach(([w, d, s], i) => {
    breathTimers.push(
      window.setTimeout(() => {
        word.textContent = w;
        hint.textContent = `Breath ${Math.floor(i / 3) + 1} of 3`;
        circle.style.setProperty('--t', `${d}ms`);
        circle.style.setProperty('--s', String(s));
      }, t),
    );
    t += d;
  });
  breathTimers.push(
    window.setTimeout(() => {
      word.textContent = 'Welcome.';
      hint.textContent = 'Carry this stillness into your intention.';
    }, t),
    window.setTimeout(closeBreath, t + 3200),
  );
}
$$('[data-breath-open]').forEach((b) => b.addEventListener('click', openBreath));
$('[data-breath-close]')?.addEventListener('click', closeBreath);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && breath?.classList.contains('open')) closeBreath();
});

/* ---------- Diya: light a lamp ---------- */
const diya = $('[data-diya]');
const diyaLabel = $('[data-diya-label]');
function setDiya(lit: boolean) {
  diya?.classList.toggle('lit', lit);
  diya?.setAttribute('aria-pressed', String(lit));
  if (diyaLabel) diyaLabel.textContent = lit ? 'May your path be lit' : 'Light a diya';
}
try {
  setDiya(localStorage.getItem('sm-diya') === '1');
} catch {}
diya?.addEventListener('click', () => {
  const lit = !diya.classList.contains('lit');
  setDiya(lit);
  try {
    localStorage.setItem('sm-diya', lit ? '1' : '0');
  } catch {}
  if (lit) toast('A small light, offered for all beings. 🪔');
});

/* ---------- Lightbox ---------- */
const tiles = $$<HTMLButtonElement>('[data-lightbox]');
if (tiles.length) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Tattoo gallery viewer');
  lb.innerHTML = `
    <button class="lb-btn lb-prev" aria-label="Previous">‹</button>
    <figure><img alt="" /><figcaption></figcaption></figure>
    <button class="lb-btn lb-next" aria-label="Next">›</button>
    <button class="lb-btn lb-close" aria-label="Close">×</button>`;
  document.body.appendChild(lb);
  const img = $<HTMLImageElement>('img', lb)!;
  const cap = $('figcaption', lb)!;
  let idx = 0;
  let opener: HTMLElement | null = null;
  const show = (i: number) => {
    idx = (i + tiles.length) % tiles.length;
    const t = tiles[idx];
    img.style.opacity = '0';
    const next = new Image();
    next.src = t.dataset.full!;
    next.onload = () => {
      img.src = next.src;
      img.alt = t.dataset.alt ?? '';
      img.style.opacity = '1';
    };
    cap.innerHTML = `<b>${t.dataset.title ?? ''}</b>${t.dataset.alt ?? ''} · ${idx + 1} / ${tiles.length}`;
  };
  const open = (i: number) => {
    opener = tiles[i];
    show(i);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    $<HTMLButtonElement>('.lb-close', lb)!.focus();
  };
  const close = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    opener?.focus();
  };
  tiles.forEach((t, i) => t.addEventListener('click', () => open(i)));
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

/* ---------- Testimonial carousel ---------- */
$$('[data-carousel]').forEach((car) => {
  const slides = $$('.quote', car);
  const dots = $(`[data-dots="${car.id}"]`);
  if (!slides.length || !dots) return;
  let i = 0;
  let timer = 0;
  const go = (n: number) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => {
      s.classList.toggle('active', k === i);
      s.setAttribute('aria-hidden', String(k !== i));
    });
    $$('button', dots).forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
  };
  slides.forEach((_, k) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('aria-label', `Show testimonial ${k + 1}`);
    d.addEventListener('click', () => {
      go(k);
      restart();
    });
    dots.appendChild(d);
  });
  const restart = () => {
    clearInterval(timer);
    if (!reduce) timer = window.setInterval(() => go(i + 1), 7000);
  };
  car.addEventListener('mouseenter', () => clearInterval(timer));
  car.addEventListener('mouseleave', restart);
  go(0);
  restart();
});

/* ---------- Scroll loop ---------- */
let ticking = false;
window.addEventListener(
  'scroll',
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollHeader();
      onScrollMala();
      ticking = false;
    });
  },
  { passive: true },
);
onScrollHeader();
onScrollMala();

/* ---------- A note for the curious ---------- */
console.log('%cॐ Om Narbhavi Swaha', 'font: 700 20px Cinzel, serif; color:#d7322a');
console.log('%cCurious soul: try typing "om" on the page.', 'color:#c9a24a');
