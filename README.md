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
| `RESEND_API_KEY` (or `RESEND_API`) | API key from resend.com (required) |
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

## Admin app & push notifications

`/admin` is an installable app (PWA) that sends push notifications for:

- **New lead**: someone entered their email on the Journey form
- **Journey completed**: they finished the details (with photo count)
- **New testimonial to approve**

**Set it up on a device:** sign in to `/admin`, then use the **Notifications** panel at the top.

- **iPhone / iPad (iOS 16.4+):** open `/admin` in Safari → Share → **Add to Home Screen** → open *Sat Manav* from the home screen → sign in → **Turn on notifications**. (Apple only allows web notifications for apps added to the home screen.)
- **Android / desktop Chrome or Edge:** **Install app** (or the install icon in the address bar), then **Turn on notifications**. Notifications also work in a normal browser tab.
- **Send a test** confirms it works; **Turn off** removes that device. Each device is enabled separately.

How it works: `public/admin.webmanifest` + `public/admin-sw.js` (the service worker only shows notifications and opens the dashboard; it caches nothing). Devices are stored in the `push_subscriptions` table; devices that uninstall are removed automatically. The web-push (VAPID) key pair is **generated automatically** on first use and kept in the `app_settings` table, so no configuration is needed. Set `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` only if you want to supply your own.

## Testimonials

Visitors can submit a testimonial from the homepage (name, optional private email, text, permission to publish). Submissions are saved as **pending** and Shug gets an email. Approved ones appear on the homepage within about a minute (edge-cached), ahead of the original testimonials.

## Database & photo storage (Vercel)

Everything lives on the Vercel project **sat-manav**:

- **Postgres (Neon via Vercel Storage)**: tables `pageviews`, `leads`, `testimonials`. Vercel injects `DATABASE_URL`. Tables are **created automatically** the first time the site touches the database (`src/lib/server/schema.ts`), so there is no migration step. Dashboard numbers come from one SQL query in `src/lib/server/stats.ts`.
- **Private Vercel Blob store `satmanav-photos`**: inspirational photos from the Journey form. Vercel injects `BLOB_READ_WRITE_TOKEN`. Photos are never public; the admin views them through `/api/admin/photo`, which requires the admin session.

Only the website's server functions can reach either store.

## Environment variables (Vercel)

| Variable | Set by | Needed for |
| --- | --- | --- |
| `DATABASE_URL` | Vercel, when the Neon database is connected | Visits, leads, testimonials, the dashboard |
| `BLOB_READ_WRITE_TOKEN` | Vercel (already connected) | Storing inspirational photos |
| `ADMIN_PASSWORD` | You | Signing in to `/admin` (changing it signs everyone out) |
| `RESEND_API_KEY` (or `RESEND_API`) | You | Notification emails to Shug |
| `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL` | You (optional) | Overrides (see above) |

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
