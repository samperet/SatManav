# Sat Manav Tattoos — website

A rebuild of [satmanavyogitattoos.com](https://satmanavyogitattoos.com) as a fast static site (Astro), deployed on Vercel.
It keeps the original crimson, ink and parchment style, lotus emblem, mantra ticker and the original site copy.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Hero, intro, artist, teachings (collapsible), gallery, testimonials, additional offerings |
| `/journey` | Two-step lead form: email first, then details + inspirational photos |
| `/api/lead` | Serverless function that emails each submission to Shug |
| `/gallery` | Full gallery with lightbox (keyboard + swipe) |

Old shop URLs (`/shop`, `/product/...`) redirect to the homepage via `vercel.json`.

## Editing content

Everything lives in **`src/data/site.ts`**: contact details, gallery items, teachings, testimonials and offerings.

- **Gallery**: add `public/images/gallery/<slug>.webp` (≈1200px wide) and `<slug>-sm.webp` (≈520px wide), then add an entry to `gallery`.

## Journey form & lead emails

The form captures leads in two steps:

1. **Email only.** As soon as a visitor enters their email, Shug gets a `New lead: …` email, so the contact is captured even if they stop there.
2. **Details.** The rest of the form appears: name, phone, intention, style ratings, message and up to 8 inspirational photos. Submitting sends a `Journey details: …` email with the photos attached.

Both emails go to `satmanavyogi@gmail.com` with **Reply-To set to the visitor**, so hitting Reply answers them directly. Photos are resized in the browser before upload to stay within Vercel's 4.5 MB request limit.

Emails are sent with [Resend](https://resend.com). Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | API key from resend.com (required) |
| `LEAD_TO_EMAIL` | Optional; defaults to `satmanavyogi@gmail.com` |
| `LEAD_FROM_EMAIL` | Optional; defaults to `Sat Manav Website <onboarding@resend.dev>` |

Resend's test sender (`onboarding@resend.dev`) can only deliver to the email address that owns the Resend account, so **create the Resend account with satmanavyogi@gmail.com**. For a branded sender, verify `satmanavyogitattoos.com` in Resend and set `LEAD_FROM_EMAIL` to e.g. `Sat Manav Tattoos <journey@satmanavyogitattoos.com>`.

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
