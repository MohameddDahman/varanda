# VARANDA — website

Bilingual (English / العربية) portfolio site for **VARANDA — uPVC window & door systems. Made for life.**

Built with **Next.js 16** (App Router, static generation), **GSAP 3.15** (ScrollTrigger, SplitText, Flip, CustomEase), **Lenis** smooth scrolling, **React Three Fiber** for the 3D profile section, and **Convex** for contact requests.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /en or /ar
npm run build      # production build (all pages are pre-rendered)
npm run lint
```

`/` redirects to `/en` or `/ar` from the visitor's browser language; switching language is remembered in a `lang` cookie.

## What's on the site

| Route | Page |
| --- | --- |
| `/[lang]` | Home — sliding-door hero, opening-systems rail, projects, process, warranty |
| `/[lang]/systems` and `/systems/[slug]` | Windows & doors · Glass · Roller shutters · Fly screens · Hardware |
| `/[lang]/projects` and `/projects/[slug]` | Filterable project index (grid/list) and project pages with a photo viewer |
| `/[lang]/why-upvc` | Benefits with live demos and the 3D cross-section |
| `/[lang]/about` | Story, process, installation, warranty |
| `/[lang]/contact` | Direct lines (call, WhatsApp, email), site-visit request form (Convex), service-area map |

Signature motion: every navigation closes and reopens a pair of sliding glass doors (`src/components/transition`), with the destination printed on the glass in both languages. The first visit in a session plays the logo intro on the doors.

## Editing content

All words, in both languages, live in `src/content/`:

- `site.ts` — tagline, navigation, service areas (with rough coordinates for the contact-page map) and **contact details**. The contact details are currently **samples** (`contact.sample: true`): the contact page shows them with a "Sample details" tag and no working links, and the footer leaves them out. Put in the real values and set `sample: false` — that switches on the call / WhatsApp / email links, the footer details and the "Get directions" button (once `mapsUrl` is set). Anything set to `null` is hidden.
- `company.ts` — about text, the 6 process steps, warranty, uPVC benefits, 3D section callouts.
- `systems.ts` — the five product lines and the colour finishes.
- `projects.ts` — projects (title, type, year, location, text, photos).
- `photos.ts` — every photo with its English and Arabic alt text.

Photos are in `src/assets/photos/` (already cropped, graded and stripped of GPS data). To add a project: drop the graded photo there, register it in `photos.ts`, then add an entry to `projects.ts` — the page, sitemap and filters pick it up automatically.

Originals from the client's Drive and profile are kept in `_source/` (git-ignored, not deployed).

## Connecting Convex

The contact form posts to a server action (`src/app/[lang]/contact/actions.ts`) that validates the request and stores it with the `inquiries:create` mutation. Until Convex is connected the form validates normally and then explains that online requests aren't switched on yet; once real contact details are in (`sample: false`), it also offers to send the same request on WhatsApp, pre-filled, so the site can go live before Convex is set up.

1. `npx convex dev` — log in, create the project. This writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local` and regenerates `convex/_generated/` (the committed copy was hand-written to match).
2. Restart `npm run dev` and send a test request — it appears in the Convex dashboard under **inquiries**.
3. For production: `npx convex deploy`, then add `NEXT_PUBLIC_CONVEX_URL` (production URL) to the hosting environment.

There is intentionally no public query: submitted contact details can only be read in the Convex dashboard.

## Deploying

Deployed on Vercel as the `varanda` project, connected to this GitHub repo: every push to `main` deploys to production (currently https://varanda-kappa.vercel.app).

At launch, set `NEXT_PUBLIC_SITE_URL` to the real domain (e.g. `https://your-domain.com`) so canonical links, the sitemap and share images use it. Until it is set the site tells search engines not to index it (a `noindex` tag and no sitemap in `robots.txt`), so the preview with sample details stays out of search results. Add `NEXT_PUBLIC_CONVEX_URL` once Convex is connected.

## Before launch — needed from the client

- Phone / WhatsApp, email, address, opening hours and Google Maps link → `src/content/site.ts`, replacing the sample values, then set `contact.sample` to `false`. (Neither the company profile nor the Drive folder contains any contact details.)
- The logo as vector files (SVG/AI/PDF). The current mark and wordmark are a careful redraw from the company profile (`src/components/brand/Logo.tsx`).
- Confirm project names, areas and systems used in `src/content/projects.ts` (grouped from the Drive photos by date).
- Confirm the garden-fencing work belongs on the site (it's in the Drive but not in the profile).
- Higher-resolution photos of the four projects shown in the profile (Fifth Settlement, Sheikh Zayed, October) — the profile only contains low-resolution copies. A professional shoot of 2–3 finished projects would lift the site the most.
- A native Arabic review of the copy.

## Notes for developers

- Next 16: `cacheComponents` is intentionally **off** — every page is static, and keeping hidden routes mounted would interfere with the scroll scenes and the door transition.
- Styles: `src/app/globals.css`. Brand tokens are in `@theme`; component styles sit in `@layer components` so Tailwind utilities can override them.
- Motion respects `prefers-reduced-motion`: no smooth scrolling, pins or door transitions, and every animated section has a readable static state.
- `?pin=transform` (dev only) switches ScrollTrigger pins to transforms for screenshot tools.
