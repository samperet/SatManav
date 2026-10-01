# Sat Manav Tattoos — website

A rebuild of [satmanavyogitattoos.com](https://satmanavyogitattoos.com) as a fast static site (Astro), deployed on Vercel.
It keeps the original crimson, ink and parchment style, lotus emblem, mantra ticker and the original site copy.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Hero, intro, artist, teachings (collapsible), gallery, store, testimonials, additional offerings |
| `/journey` | Intake form (intention + style ratings) |
| `/gallery` | Full gallery with lightbox (keyboard + swipe) |
| `/shop`, `/shop/[slug]` | Prints & aftercare with order-by-email or payment-link checkout |

Old WooCommerce URLs (`/product/...`) redirect to `/shop/...` via `vercel.json`.

## Editing content

Everything lives in **`src/data/site.ts`**: contact details, products and prices, gallery items, teachings, testimonials and offerings.

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
