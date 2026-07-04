# Dokimos Consulting — Website

A 5-page static site (Home, Work, People, News, Contact) plus a custom 404
page. No build step, no framework, no npm install. Every page's content is
real, static HTML — `js/main.js` only adds interactive behavior (dark-mode
toggle, mobile nav, hero carousel, work filters, contact form submission,
scroll-reveal animations, cookie banner, broken-image fallback). To update
the site, edit the relevant page's HTML directly.

## Pages & clean URLs

```
/               → index.html       (Home — hero, stats, mission, practice
                                     areas, process, featured work, trust)
/work           → work/index.html  (full project grid + filters)
/people         → people/index.html
/news           → news/index.html
/contact        → contact/index.html
404 (any path)  → 404.html
```

Each page is a real folder with its own `index.html`. Static web servers
(including the Cloudflare Worker this site deploys to and the local
preview commands below) serve `index.html` automatically when a folder URL
is requested. Internal links use the no-trailing-slash form (`/work`, not
`/work/`) — this is plain multi-page HTML, not a JavaScript router: no
history-API fallback or `_redirects` config is needed, and every page works
if opened directly. `404.html` at the project root is served automatically
for any unmatched path.

All 6 pages independently maintain identical copies of the shared
`<header>`/`<footer>`/mobile-nav markup and the theme-detection `<head>`
script (see "Dark mode" below) — there's no templating layer, so a change
to shared chrome (e.g. adding a nav item) means editing all 6 files. Each
page references the same `css/style.css` and `js/main.js` with
root-relative paths (`/css/style.css`, `/js/main.js`, `/logo.svg`) so they
resolve correctly no matter how deep the page's folder is.

There used to be a separate About page — its mission/values/practice-area
content now lives directly on Home (the `#about`, `#services`, and
`#approach` sections in `index.html`), and About's old nav slot is now
**News**.

## Updating content

There's no JSON file or build step in between — open the page's HTML file
and edit the markup directly. Each content block uses plain, repeated CSS
classes (`.project-card`, `.person-card`, `.news-card`, `.value-card`,
etc.), so adding a new one is almost always "copy an existing block, change
the text and image path."

- **Change text anywhere** — find it in the relevant `.html` file and edit
  it directly.
- **Add a new project** — copy a `.project-card` block in `work/index.html`
  as a template, edit its fields, and drop a matching image into
  `assets/images/projects/` (see the `PUT_IMAGES_HERE.md` note in that
  folder). To also feature it on Home, copy the same block into
  `index.html`'s `#featured-work` `.projects-grid` — **there's no shared
  data source anymore, so featured projects are hand-duplicated between the
  two files and can drift if you only update one.** That teaser shows 3
  cards on desktop/tablet and 4 on narrow (mobile) screens via
  `#featured-work .projects-grid .project-card:nth-child(4)` in
  `css/style.css` — card **order** matters for that rule (see the HTML
  comment above the grid in `index.html`), so keep exactly 4 cards there.
- **Add/remove a hero slide (Home)** — edit the `.hero-slide` divs inside
  `#hero-media` in `index.html` (each carries `data-headline`,
  `data-subheadline`, and `data-href` attributes the carousel JS reads) and
  add/remove a matching `.carousel-bar` button in `#carousel-bars`. Slide 0's
  data attributes must match the initial static `#hero-headline`/
  `#hero-subheadline` content, since that's what's visible before any JS runs.
- **Add/remove a team member (People)** — copy/remove a `.person-card`
  block in `people/index.html`. This whole page is placeholder content —
  see `assets/images/people/PUT_IMAGES_HERE.md`.
- **Add/remove a news post (News)** — copy/remove a `.news-card` block in
  `news/index.html`. Also placeholder content — see
  `assets/images/news/PUT_IMAGES_HERE.md`.
- **Add/remove a client/partner logo (Home)** — copy/remove a `.trust-logo`
  block in `index.html`'s `#trust` section.
- **Edit practice areas / capabilities (Home)** — the `.pillar-card` blocks
  in `index.html`'s `#services` section (each has an inline SVG icon —
  copy an existing one's `<svg>` if you're not replacing the icon).
- **Edit the process steps (Home)** — the `.step-card` blocks in
  `index.html`'s `#approach` section.
- **Change a stat, mission copy, or values (Home)** — the `.stat-value`/
  `.stat-label` pairs in `#stats-bar`, and the `.value-card` blocks in
  `#about`, both in `index.html`.
- **Edit the cookie banner text** — the `.cookie-banner-text`/button labels
  inside `#cookie-banner`, duplicated in all 6 HTML files.
- **Add/remove a nav item, or edit the footer/contact details** — these
  appear in the header `<nav>`, the mobile nav drawer, and the footer of
  **every** page, so update all 6 files together.

HTML comments mark content that's still placeholder-first (the People
roster, News posts, sample "Concept" projects, and the `#trust` logo
tiles) — search each page for `<!-- PLACEHOLDER CONTENT` and replace with
real people/posts/projects/photos/figures before treating the site as final.

### Images

Every image is loaded by its `src`/`data-path`. If a file doesn't exist
yet, the site automatically shows a clearly-labeled placeholder instead of
a broken image — so you can publish structure now and drop in real
photography later with zero code changes.

Each `assets/images/<folder>/PUT_IMAGES_HERE.md` file lists the exact
filenames and recommended dimensions expected. General guidance for crisp,
sharp results:

- Export at **2x the display size** (e.g. a 1200px-wide hero slot → export
  at 2400px wide) so the image stays sharp on retina/high-DPI screens.
- Use JPG (quality ~80) or WebP for photos — both are supported.
- Keep individual files under ~400KB where possible; resize before
  uploading rather than relying on the browser to scale huge originals.

## Dark mode

Every color on the site is a CSS custom property defined once in
`css/style.css` under `:root` (light) and `html[data-theme="dark"]` (dark)
— there's no per-component dark-mode styling to maintain. The toggle button
is static markup in every page's `<header>`; `setupThemeToggle()` in
`js/main.js` flips `<html data-theme>` and saves the choice to
`localStorage['theme']`.

Every page has a tiny inline `<script>` at the very top of `<head>` (before
any CSS loads) that reads `localStorage` — or falls back to the visitor's
OS-level `prefers-color-scheme` if they haven't chosen yet — and sets
`data-theme` immediately, so there's no flash of the wrong theme on load.
If you add a new page, copy that snippet into its `<head>` too.

To adjust the dark palette, edit the variables inside
`html[data-theme="dark"] { ... }` in `css/style.css` — everything else
(buttons, cards, forms, the image-placeholder stripes) reads from those
same variables and updates automatically.

## Cookie banner

A small consent banner (static markup in `#cookie-banner`, duplicated on
every page) slides up from the bottom on first visit and doesn't reappear
once the visitor clicks Accept or Decline (`setupCookieBanner()` in
`js/main.js` stores the choice in `localStorage['cookieConsent']`). It's
currently cosmetic — this site doesn't set any tracking cookies itself —
so wire it up to your actual analytics/consent logic if you add any later.

## Cache-busting js/main.js and css/style.css

`_headers` caches `/js/*` and `/css/*` for 24 hours (`max-age=86400`) with
no build step to auto-hash filenames. Every page loads them as
`/js/main.js?v=2` / `/css/style.css?v=2` — **whenever you edit
`js/main.js` or `css/style.css`, bump that `?v=N` query string in all 6
HTML files**, or returning visitors' browsers will keep serving the old
cached copy for up to 24 hours after you deploy (this exact bug shipped
once already: a stale cached `main.js` kept trying to `fetch()` the
now-deleted `content.json`). The number itself is arbitrary — it only
needs to change, not follow any particular scheme.

## Local preview

Root-relative asset paths (`/css/style.css`, `/js/main.js`, `/logo.svg`)
won't resolve over `file://...` — opening `index.html` directly will look
broken (no styles, no behavior). Serve the folder over local HTTP instead.

Recommended — this repo's own dev server (Python stdlib only, no
dependencies), which matches the deployed Worker's unmatched-path →
`404.html` behavior and auto-refreshes the browser tab whenever a file
changes:

```
python serve.py 8080
```

Or, without live reload:

```
npx serve .
```

or

```
python -m http.server 8080
```

Then visit `http://localhost:8080` — try `/work`, `/people`, `/news`,
`/contact`, and a nonexistent path (to see `404.html`) too.

## Deploying to Cloudflare

The site is deployed as a **Cloudflare Worker with Static Assets**
(`workers.dev` URL: `dokimos.alemiherbert.workers.dev`), connected to this
repo via **Workers & Pages → Connect to Git** in the Cloudflare dashboard.
`wrangler.toml` at the project root defines the deployment:

- `[assets]` serves every file in this folder as-is (`directory = "./"`),
  with `not_found_handling = "404-page"` so unmatched paths serve
  `404.html`, matching local preview via `serve.py`.
- `main = "worker/index.js"` is a small Worker script that intercepts
  `POST /api/contact` (the contact form backend) and `GET /news`/`/news/`
  (D1-backed news posts, see below) — every other request falls through to
  the static assets untouched. `run_worker_first = true` in `wrangler.toml`
  is required for this: without it, Cloudflare serves any request matching
  a real static file (like `/news/` → `news/index.html`) directly, without
  ever invoking the Worker script at all.

Every future content update (editing HTML, adding project images) just
needs a new commit/push to `master` — Cloudflare redeploys automatically.
No build command is needed.

## News posts (D1-backed)

News posts live in the D1 `news_posts` table (schema in
`migrations/0002_create_news_posts.sql`), not in `news/index.html`. On
every request to `/news`, `worker/index.js` fetches posts from D1 and
injects them into the page server-side (via `HTMLRewriter`, replacing the
`.news-grid` contents) — the response the browser gets is still plain
HTML with the real posts already in it, no client-side fetch/render step.
If the table is empty (or the query fails), the page's static placeholder
cards show through untouched, so the page never looks broken.

Manage posts with `scripts/news.js` (no dependencies, shells out to
`wrangler d1 execute`):

```
node scripts/news.js list
node scripts/news.js add                                     (interactive prompts)
node scripts/news.js add --title "..." --tag "Announcement" --excerpt "..." --image "/assets/images/news/foo.jpg" --alt "..." [--date YYYY-MM-DD]
node scripts/news.js edit <id> --title "..." [--tag ...] [--date ...] [--excerpt ...] [--image ...] [--alt ...]
node scripts/news.js delete <id>
```

`edit` only changes the fields you pass — everything else keeps its
current value. Use `list` to find a post's id. Add `--local --persist-to
<path>` (matching whatever you pass to `wrangler dev`) to any command to
target your local dev database instead of the live one.

## Contact form backend (D1 + email notification)

The contact form (`/contact`) posts JSON to `/api/contact`, handled by
`worker/index.js`, which:

1. Validates the submission and inserts it into a Cloudflare **D1**
   database (table `contact_submissions`, schema in
   `migrations/0001_create_contact_submissions.sql`) so nothing is lost
   even if email delivery fails.
2. Sends a notification email via the **Resend** API (resend.com) to
   whatever address is set in `CONTACT_RECIPIENT` (`wrangler.toml`
   `[vars]`, currently `info.charis.systems@gmail.com`).

### One-time setup (requires Cloudflare/Wrangler login)

The production database (`dokimos-db`) and its `database_id` are already
set in `wrangler.toml`. To create a **new** one from scratch (e.g. for a
separate environment):

```
npx wrangler login
npx wrangler d1 create <your-db-name>
```

Copy the `database_id` from the output into `wrangler.toml`'s
`[[d1_databases]]` block, then apply the schema:

```
npx wrangler d1 execute <your-db-name> --remote --file=migrations/0001_create_contact_submissions.sql
```

Sign up at resend.com, create an API key, and set it as a Worker secret
(never commit it — `.dev.vars` is gitignored):

```
npx wrangler secret put RESEND_API_KEY
```

For local testing with `wrangler dev`, copy `.dev.vars.example` to
`.dev.vars` and fill in a real key — `serve.py` cannot run the Worker/D1
locally, only static files, so use `wrangler dev` to exercise
`/api/contact` end-to-end:

```
npx wrangler dev --local --persist-to ../wrangler-persist
```

`--persist-to` points D1's local SQLite state at a folder *outside* this
project. Since `[assets] directory = "./"` covers the whole repo,
`wrangler dev`'s watcher treats every write to that state file as a source
change and reloads — without `--persist-to` pointed elsewhere, this
becomes an infinite reload loop.

Resend's `onboarding@resend.dev` sender works without any domain
verification, which is why it's used as the default `from` address in
`worker/index.js`. Once a real domain (e.g. `dokimos.co.ug`) is verified
in Resend, switch the sender to an address on that domain for better
deliverability.
