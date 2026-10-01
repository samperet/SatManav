# Sat Manav Tattoos — website

A rebuild of [satmanavyogitattoos.com](https://satmanavyogitattoos.com) as a fast static site (Astro), deployed on Vercel.
It keeps the original crimson, ink and parchment style, lotus emblem and mantra ticker. The copy is tightened for clarity, the journey is laid out step by step, and small moments of delight are woven through the site.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Hero, approach, artist, 4-step process + expandable teachings, gallery preview, testimonials, shop preview, offerings, visit |
| `/journey` | Intake form (intention + style ratings) with a live yantra sketch |
| `/gallery` | Full gallery with lightbox (keyboard + swipe) |
| `/shop`, `/shop/[slug]` | Prints & aftercare with order-by-email or payment-link checkout |

Old WooCommerce URLs (`/product/...`) redirect to `/shop/...` via `vercel.json`.

## Surprise & delight

- **Mala progress**: a ring of 27 prayer beads (bottom-right) lights up as you scroll. Finish the page to complete the round. Click it to return to the top.
- **Breathe with the lotus**: the lotus emblem breathes; tap it for a guided three-breath practice before beginning.
- **Sound the Om**: tap the Om in testimonials for a soft synthesized Om drone (136.1 Hz) with ripples. Secret: type `o` `m` anywhere on the page.
- **Living yantra**: on `/journey`, a sacred-geometry sketch grows from your name, intention and style ratings. It can be saved as an SVG.
- **Ink-bleed reveals** on gallery images, an ember glow that follows the cursor in the hero, and a mantra ticker that surges with scroll speed.
- **Light a diya** in the footer (remembered on your device).

All motion respects `prefers-reduced-motion`.

## Editing content

Everything lives in **`src/data/site.ts`**: contact details, products and prices, gallery items, process steps, teachings, testimonials and offerings.

- **Gallery**: add `public/images/gallery/<slug>.webp` (≈1200px wide) and `<slug>-sm.webp` (≈520px wide), then add an entry to `gallery`.
- **Instant checkout**: paste a Stripe/Square payment link into a product's `checkoutUrl`. Without it, the button opens a pre-filled order email.
- **Journey form delivery**: set `PUBLIC_FORM_ENDPOINT` in Vercel (e.g. a Formspree or Basin form URL) to receive submissions directly. Without it, the form opens a pre-filled email to the studio.

## Fonts

The original site uses Imperia (Wiescher Design) and Museo Slab (exljbris). These are commercial fonts, so they are not committed here. The rebuild uses the open-licensed **Cinzel Decorative / Cinzel** and **Roboto Slab** from Google Fonts as close matches. If you hold web licenses for the originals, add the files under `public/fonts/` and update `--f-display` / `--f-body` in `src/styles/global.css`.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Deploy (Vercel)

Import this repo at [vercel.com/new](https://vercel.com/new). Vercel detects Astro automatically, with no settings needed.
Every push to `main` deploys to production, and other branches get preview URLs. Then point the `satmanavyogitattoos.com` domain at the project under **Settings → Domains**.
