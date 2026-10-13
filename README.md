# Sat Manav Tattoos — website

A rebuild of [satmanavyogitattoos.com](https://satmanavyogitattoos.com) as a fast static site (Astro), deployed on Vercel.
It keeps the original crimson, ink and parchment style, lotus emblem, mantra ticker and the original site copy.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Hero, intro, artist, teachings (collapsible), gallery, testimonials (+ submit form), additional offerings |
| `/journey` | Two-step lead form: email first, then details + inspirational photos |
| `/gallery` | Full gallery with lightbox (keyboard + swipe) |
| `/admin` | Password-protected dashboard: traffic, sources, form responses, testimonial approvals |

Server functions (Vercel): `/api/lead` (form), `/api/track` (analytics beacon), `/api/testimonial` (submit + approved list), `/api/admin/*`.

Old shop URLs (`/shop`, `/product/...`) redirect to the homepage via `vercel.json`.

## Editing content

Everything lives in **`src/data/site.ts`**: contact details, gallery items, teachings, testimonials and offerings.

- **Gallery**: add `public/images/gallery/<slug>.webp` (≈1200px wide) and `<slug>-sm.webp` (≈520px wide), then add an entry to `gallery`.

## Journey form & lead emails

The form captures leads in two steps:

1. **Email only.** As soon as a visitor enters their email, Shug gets a `New lead: …` email, so the contact is captured even if they stop there.
2. **Details.** The rest of the form appears: name, phone, intention, style ratings, message and up to 8 inspirational photos. Submitting sends a `Journey details: …` email with the photos attached.

Every lead is also saved to the database (photos in private storage) and shown in `/admin`, with where the visitor came from.

Both emails go to `satmanavyogi@gmail.com` with **Reply-To set to the visitor**, so hitting Reply answers them directly. Photos are resized in the browser before upload to stay within Vercel's 4.5 MB request limit.

Emails are sent with [Resend](https://resend.com). Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | API key from resend.com (required) |
| `LEAD_TO_EMAIL` | Optional; defaults to `satmanavyogi@gmail.com` |
| `LEAD_FROM_EMAIL` | Optional; defaults to `Sat Manav Website <onboarding@resend.dev>` |

Resend's test sender (`onboarding@resend.dev`) can only deliver to the email address that owns the Resend account, so **create the Resend account with satmanavyogi@gmail.com**. For a branded sender, verify `satmanavyogitattoos.com` in Resend and set `LEAD_FROM_EMAIL` to e.g. `Sat Manav Tattoos <journey@satmanavyogitattoos.com>`.

## Admin dashboard (`/admin`)

Sign in with `ADMIN_PASSWORD`. Pick a range (7 / 30 / 90 days, 12 months) to see:

- **Visitors, page views, leads, completed journeys, conversion**, each compared with the previous period
- **Visitors and leads per day** (hover for values, or "View as table")
- **Where traffic comes from**: Instagram, Google, Facebook, direct, campaign tags… with leads and conversion per source
- Referring sites, landing pages, top pages, countries, cities, devices, browsers, `utm_campaign`s
- **Form responses**: every lead with intention, ratings, message, photos and source; set a status (New / Contacted / Booked / Archived), search, reply by email, export CSV
- **Testimonials**: approve, edit wording, reject, unpublish or delete submissions

**Tag your links** so sources show by name: `?src=instagram` (Instagram bio), `?src=card` (business cards / QR), `?src=gbp` (Google Business Profile), or standard `utm_source` / `utm_campaign`.

**Privacy:** analytics are first-party and cookieless. No IP addresses or raw user agents are stored; visitors are counted with a hash that rotates daily. Do Not Track and Global Privacy Control are honoured.

## Testimonials

Visitors can submit a testimonial from the homepage (name, optional private email, text, permission to publish). Submissions are saved as **pending** and Shug gets an email. Approved ones appear on the homepage within about a minute (edge-cached), ahead of the original testimonials.

## Database (Supabase)

Project **satmanav** (`awzphbubjvsrctmuqhoi`, US East) in the Colloqui org. Tables `pageviews`, `leads`, `testimonials` and the private `lead-photos` bucket have row-level security on with **no public policies**: only the website's server (secret key) can read or write. Dashboard numbers come from the `admin_stats` SQL function.

## Environment variables (Vercel)

| Variable | Needed for |
| --- | --- |
| `ADMIN_PASSWORD` | Signing in to `/admin` |
| `SUPABASE_SECRET_KEY` | Saving visits, leads, testimonials; the dashboard (Supabase → Project Settings → API Keys → secret key) |
| `RESEND_API_KEY` | Notification emails to Shug |
| `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL` | Optional overrides (see above) |

The form works with either email or the database configured, and best with both.

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
