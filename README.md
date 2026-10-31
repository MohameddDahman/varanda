# VARANDA — website

Bilingual (English / العربية) portfolio site for **VARANDA — uPVC window & door systems. Made for life.**

Built with **Next.js 16** (App Router, static generation), **GSAP 3.15** (ScrollTrigger, SplitText, Flip, CustomEase), **Lenis** smooth scrolling and **Convex** for contact requests, projects and their photos, managed in a bilingual admin dashboard at `/admin` built for phones first. The 3D pieces use no WebGL, so they stay smooth on low-end phones. On Why uPVC, the profile section is a cut sample of the frame extruded into 3D as static SVG and scrubbed by scroll. The lock demo is a CSS 3D tilt & turn window whose sash swings on its side hinges (open) or leans in on its bottom ones (tilt).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /en or /ar
node scripts/convex-local.mjs   # the database, no Convex account needed (see below)
npm run build      # production build (all pages are pre-rendered)
npm run lint
npm run test:ui    # UI tests (see below)
```

## UI tests

`npm run test:ui` builds the site, starts it on port 3100 and runs the Playwright suite in `tests/ui/` on a desktop and a phone viewport. On Windows it uses the installed Microsoft Edge; elsewhere run `npx playwright install chromium` once.

- `pages.spec.ts` — every page in both languages: status code, `lang`/`dir`, the profile fonts actually loaded, no sideways overflow, no broken images, one `h1`, no console errors or animation warnings, and an axe accessibility scan (WCAG 2.2 AA) with zero violations.
- `layout.spec.ts` — regressions found during the build: the header blur surviving the CSS minifier, hero labels staying on their door panel, the logo not mirroring in Arabic, paragraph tracking (open in English, word-spaced in Arabic), no doubled gaps between same-colour sections, contact details linked only once real, split text readable to screen readers, opening-system cards fitting above the rail's progress line on phones, photos staying sharp when a tall frame crops them, the profile section's copy fitting short laptop screens, Arabic pages not jumping when the Arabic font arrives, phone numbers staying on one line.
- `interactions.spec.ts` — the door transition, the phone menu, the language switch, the projects filter, the wind-sound demo, the request form, the lock demo (open turns the sash on its side, tilt leans it on its bottom edge, and it closes in between), and looping animations resting while off screen.
- `admin.spec.ts` — the dashboard: locked behind the password, a request travelling from the contact form to the inbox and through its statuses, a project edit appearing on the site, a photo upload, and every screen fitting a phone and passing axe. It needs the database running and `ADMIN_PASSWORD` in `.env.local` (otherwise it skips), and cleans up after itself.

Test the live site instead with `BASE_URL=https://varanda-kappa.vercel.app npm run test:ui` (PowerShell: `$env:BASE_URL="https://varanda-kappa.vercel.app"; npm run test:ui`). `npm run test:ui:report` opens the last report; failures keep a screenshot and a trace.

`/` redirects to `/en` or `/ar` from the visitor's browser language; switching language is remembered in a `lang` cookie.

## What's on the site

| Route | Page |
| --- | --- |
| `/[lang]` | Home — sliding-door hero, opening-systems rail, projects, process, warranty |
| `/[lang]/systems` and `/systems/[slug]` | Windows & doors · Glass · Roller shutters · Fly screens · Hardware |
| `/[lang]/projects` and `/projects/[slug]` | Filterable project index (grid/list) and project pages with a photo viewer |
| `/[lang]/why-upvc` | Benefits with live demos (heat, sound, a 3D tilt & turn window and its lock) and the scroll-driven 3D profile section |
| `/[lang]/about` | Story, process, installation, warranty |
| `/[lang]/contact` | Direct lines (call, WhatsApp, email), site-visit request form (Convex), service-area map |
| `/admin` | The team's dashboard (password): site-visit requests, and the projects and photos shown on the site |

Signature motion: every navigation closes and reopens a pair of sliding glass doors (`src/components/transition`), with the destination printed on the glass in both languages. The first visit in a session plays the logo intro on the doors.

## Editing content

All words, in both languages, live in `src/content/`:

- `site.ts` — tagline, navigation and **contact details**: the people a visitor can call or message (`contact.people`: sales manager and supervisor, each with call and WhatsApp), the main line used in the footer and form fallback, and the email (none yet — the company address will be added later). Address, opening hours and `mapQuery` / `mapsUrl` are still `null`: fill them in and the contact page shows the branch with its Google map. Anything set to `null` is hidden.
- `company.ts` — about text, the 6 process steps, warranty, uPVC benefits, profile section callouts.
- `systems.ts` — the five product lines and the colour finishes.
- `projects.ts` — the built-in projects (title, type, year, location, text, photos), the photo behind the home hero (`homeHero`) and the projects featured on the home page. Once the database holds published projects, the site shows those instead, and they are edited in `/admin`; this list stays as the fallback and as what "Import the site's projects" copies in.
- `admin.ts` — every word in the dashboard.
- `photos.ts` — every photo with its English and Arabic alt text.

Photos are in `src/assets/photos/` (already cropped, enhanced, graded and stripped of GPS data); `_manifest.json` there records each one's original file and whether it was AI-upscaled. To add a project: drop the graded photo there, register it in `photos.ts`, then add an entry to `projects.ts` — the page, sitemap and filters pick it up automatically.

Originals from the client's Drive, the 2017–2025 photo archive (WeTransfer) and the profile are kept in `_source/` (git-ignored, not deployed). `_source/photo-work/process.py` re-creates every site photo from them: small photos are upscaled with Real-ESRGAN on the GPU, then each is straightened, cropped, has its shadows recovered and colour cast removed, and gets the site's grade. A photo whose subject sits off-centre can set a `focus` (CSS object-position) in `photos.ts` so wide crops keep it.

## The database and the admin dashboard

Convex stores the site-visit requests from the contact form, and the projects and photos the team manages in `/admin`. Without a database (as on Vercel today) the site still works: the contact form explains that online requests aren't switched on yet (and offers WhatsApp), the projects come from `src/content/projects.ts`, and `/admin` says it isn't set up.

**The dashboard** (`src/app/admin/`, phone-first, English and Arabic):

- **Requests** — new ones counted on the tab bar, filters by status, search, one tap to call or WhatsApp (the message is pre-written in the visitor's language), a status (new → contacted → closed) and a private team note.
- **Projects** — the site's order (move up/down), shown on the site or kept as a draft, featured on the home page (the first four), and an editor for both languages with photo uploads. Photos are resized in the browser to 2400px and lose their metadata (including a phone's GPS location) before upload. Saving updates the site at once.
- **Contact** — the people to call (name, job title, phone, WhatsApp), the main line, the email, and the branch (address, opening hours, Google Maps link). Anything left empty is hidden on the site.
- **Texts** — every English and Arabic text on the site, grouped by page, with search. Each changed text can be restored to the original. Ids, links, photos and page structure stay in code.

Sign-in is one shared password (`ADMIN_PASSWORD`) with a signed 14-day session cookie; wrong passwords are rate-limited (8 per 15 minutes per address). Browsers never talk to the database with admin rights: the Next server checks the session and calls Convex with `ADMIN_TOKEN`, which every admin function checks. Changing either secret signs everyone out.

**Local development, no Convex account needed** — `node scripts/convex-local.mjs` runs Convex's account-free local backend and keeps everything it stores under `.convex-local/` and `.convex/` (git-ignored). The first run writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local`. Then add to `.env.local` a password and a long random token, and give the database the same token:

```bash
node scripts/convex-local.mjs env set ADMIN_TOKEN <the same token>
```

Sign in at http://localhost:3000/admin, open Projects and press **Import the site's projects** to copy the 17 built-in projects and their photos in. Or, from the command line, `node scripts/seed-projects.mjs` does the same for the deployment in `.env.local` (`--env <file>` for another one, with that deployment's `NEXT_PUBLIC_CONVEX_URL` and `ADMIN_TOKEN`); projects already there are skipped.

**Connecting the client's Convex account (production)**

1. `npx convex dev` — log in and create the project (replaces the local values in `.env.local`), then `npx convex deploy` for production.
2. `npx convex env set ADMIN_TOKEN <token> --prod` — a long random value.
3. In Vercel, add `NEXT_PUBLIC_CONVEX_URL` (the production URL), `ADMIN_PASSWORD` and `ADMIN_TOKEN` (the same token), then redeploy.
4. Sign in at `/admin` and import the site's projects. Until a project is published there, the site keeps showing the built-in list.

## Deploying

Deployed on Vercel as the `varanda` project, connected to this GitHub repo: every push to `main` deploys to production, https://varandasystems.com (the old varanda-kappa.vercel.app address redirects there).

`NEXT_PUBLIC_SITE_URL` is set to https://varandasystems.com, so canonical links, the sitemap and share images use it. Without it the site tells search engines not to index it (a `noindex` tag and no sitemap in `robots.txt`), which keeps other deployments out of search results. Production also has `NEXT_PUBLIC_CONVEX_URL`, `ADMIN_PASSWORD` and `ADMIN_TOKEN` (see above).

## Search engines

Every page carries a title and description, canonical and hreflang links, the business's schema.org data (`src/lib/seo.ts`) and a share picture for link previews (`src/lib/meta.ts`); `sitemap.xml` lists every page in both languages.

- `npm run seo:check` reads the live site the way a crawler does and lists anything search engines or link previews would trip on (`scripts/seo-check.mjs`; pass another address to check a different deployment).
- `node scripts/indexnow.mjs` tells Bing, and through it DuckDuckGo and Yahoo, about every page. Run it after big content changes.
- Google only lists a new site quickly once it's verified in Search Console: use the HTML-tag method, set `GOOGLE_SITE_VERIFICATION` in Vercel to its code and redeploy, then submit `sitemap.xml` and request indexing for `/en` and `/ar`. Bing Webmaster Tools works the same way with `BING_SITE_VERIFICATION`, or imports the site from Search Console.

## Before launch — needed from the client

- The branch address, opening hours and Google Maps link → `src/content/site.ts` (`address`, `hours`, `mapQuery`, `mapsUrl`). Phones and WhatsApp are in; the company email comes later (`email`).
- Confirm project names, areas and systems used in `src/content/projects.ts` (grouped from the Drive photos and the photo archive by shoot date).
- Confirm the photos in the archive's "Finestra" folder (2015–2020) are VARANDA's own installations: most of the new projects come from it.
- Confirm the "American University site" can be named on the site (the name comes from the archive's folder label).
- Confirm the garden-fencing and pergola work belongs on the site (it's in the photos but not in the profile).
- Some installation photos show the profile maker's name on the protective film (Deceuninck on the classic-apartment and family-home photos). Confirm that's fine, or send photos with the film removed.
- Higher-resolution photos of the four projects shown in the profile (Fifth Settlement, Sheikh Zayed, October) — the profile only contains low-resolution copies. A professional shoot of 2–3 finished projects would lift the site the most.
- A native Arabic review of the copy.

## Notes for developers

- Next 16: `cacheComponents` is intentionally **off** — every page is static, and keeping hidden routes mounted would interfere with the scroll scenes and the door transition.
- Styles: `src/app/globals.css`. Brand tokens are in `@theme`; component styles sit in `@layer components` so Tailwind utilities can override them.
- Type: the company profile's fonts — **Montserrat** (English: display, text and letter-spaced labels) and **Tajawal** (Arabic), loaded with `next/font`. The profile itself is flattened images, so they were matched by eye against its lettering. Arabic text is never letter-spaced (it can break the joins between letters); it is opened up with word spacing instead.
- Logo: `src/components/brand/logo-paths.ts` holds the exact vector paths from the client's `Varanda_Logo.pdf`; `Logo.tsx` builds the mark, the wordmark and the full stacked lock-up (used in the intro and share image) from them. Brand red is the logo's `#D71920`.
- Motion respects `prefers-reduced-motion`: no smooth scrolling, pins or door transitions, and every animated section has a readable static state.
- Keeping the 3D cheap:
  - The profile section's geometry is in `src/components/why/profile-geometry.ts`. It sweeps each edge of the section into a side wall, shades it, and sorts the walls far to near, once at load. Scrolling only moves, fades or recolours a few paths. The sample sits on its own layer, so sliding it aside costs no repaint.
  - The lock demo (`LockMechanism.tsx`) only draws the faces its fixed camera can see. Its lengths are in `cqw`, so it scales with its box.
  - Measured at 60 fps on a phone with the CPU slowed 4x.
- Loops must not run off screen: an off-screen animation still costs style and layer work on every frame of every other animation on the page. Pause CSS loops with `usePauseOffscreen` (see `BenefitDemos.tsx`) and GSAP loops with a ScrollTrigger `onToggle` (see `Marquee.tsx`, `ScreenDiagram`).
- `?pin=transform` (dev only) switches ScrollTrigger pins to transforms for screenshot tools.
- Texts and contact details: `src/content` stays the source of every word. The database keeps only what the dashboard changed, as a list of content paths and values (`about.title`, `site.contact.address`).
  - `src/content/editable.ts` lists what can be edited, checks values, and writes the changes into the content objects.
  - Every `[lang]` page, layout and metadata function awaits `ensureContent()` (`src/lib/site-content.ts`, cached under the `content` tag) before it renders. The layout's `ContentSync` gives the browser the same changes, so pages hydrate cleanly.
  - New pages or metadata functions under `[lang]` must await `ensureContent()` too.
  - Read content inside components, not into module-level constants: a copy taken when the module loads won't see later changes.
- Projects reach pages only through `src/lib/site-projects.ts` (`getSiteProjects` and friends): published projects from the database, cached under the `projects` tag, which every admin save expires (`updateTag`), or the built-in list. Project pages are pre-rendered and new slugs render on their first visit (`dynamicParams`).
- Admin code: pages in `src/app/admin/` (their own root layout, outside `[lang]`), server actions in `src/app/admin/actions.ts`, session and Convex helpers in `src/lib/admin/`, Convex functions in `convex/admin/`.
- Image `sizes`: the browser picks a file by width alone, but `object-fit: cover` scales a photo to its frame's height when the photo is wider than the frame. Use `coverSizes` (fixed-shape frames) or `screenSizes` (full-screen frames) from `src/lib/sizes.ts` for cropped photos, or phones get a file half the size they need.
- The Arabic font's files are preloaded on every page (about 35KB). Without that, Arabic text first renders in the narrower fallback and the page jumps when Tajawal arrives.
