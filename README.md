# Dokimos Consulting — Website

A 5-page static site (Home, Work, People, News, Contact) plus a custom 404
page. No build step, no framework, no npm install. Every piece of text,
every stat, every project card, and every image path lives in
**`content.json`**, split into one namespace per page. `js/main.js` reads
that file and, based on which page you're on, renders the relevant
sections. To update the site, you almost always just edit `content.json`.

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
(including Cloudflare Pages and the local preview commands below) serve
`index.html` automatically when a folder URL is requested. Internal links
use the no-trailing-slash form (`/work`, not `/work/`) — this is plain
multi-page HTML, not a JavaScript router: no history-API fallback or
`_redirects` config is needed, and every page works if opened directly.
`404.html` at the project root is served automatically by Cloudflare Pages
for any unmatched path.

All pages share the same `<header>`/`<footer>` (rendered by `js/main.js`
from `site`/`nav`/`footer` in `content.json`) and the same `css/style.css`
and `js/main.js`, referenced with root-relative paths (`/css/style.css`,
`/js/main.js`, `/content.json`, `/logo.svg`) so they resolve correctly no
matter how deep the page's folder is.

There used to be a separate About page — its mission/values/practice-area
content now lives directly on Home (under `home.about`, `home.services`,
`home.approach`), and About's old nav slot is now **News**.

## Updating content

Open `content.json` in any text editor. Top-level keys map to pages:
`home`, `work`, `people`, `news`, `contact` — plus shared `site`, `nav`,
`footer`, and `cookieBanner` data used everywhere.

- **Change text anywhere** — edit the string value. No HTML involved.
- **Add a new project** — copy one object inside `work.items`, paste it as
  a new entry, edit its fields, and drop a matching image into
  `assets/images/projects/` (see the `PUT_IMAGES_HERE.md` note in that
  folder). It appears on the Work page automatically; add `"featured":
  true` to also show it in Home's "Featured Work" teaser. That teaser shows
  3 projects on desktop/tablet and 4 on narrow (mobile) screens, so keep at
  least 4 items flagged `featured` if you want the 4th to have something to
  show.
- **Add/remove a hero slide (Home)** — edit `home.hero.slides` (each slide
  is `image` + `imageAlt` + `headline` + `subheadline` + `href`). The
  background image, headline/subheading, and rectangular progress bars all
  advance together and resize to match however many slides are listed.
- **Add/remove a team member (People)** — edit `people.members`
  (`name` + `role` + `photo` + `bio`). This whole page is placeholder
  content — see `assets/images/people/PUT_IMAGES_HERE.md`.
- **Add/remove a news post (News)** — edit `news.posts`
  (`title` + `date` + `tag` + `excerpt` + `image`). Also placeholder
  content — see `assets/images/news/PUT_IMAGES_HERE.md`.
- **Add/remove a client/partner logo (Home)** — edit `home.trust.logos`.
- **Edit practice areas / capabilities (Home)** — `home.services.pillars`.
- **Edit the process steps (Home)** — `home.approach.steps`.
- **Change a stat, mission copy, or values (Home)** — `home.stats`,
  `home.about.lead`/`home.about.body`/`home.about.values`.
- **Edit the cookie banner text** — `cookieBanner.message` /
  `acceptLabel` / `declineLabel`.

`content.json` has a `_meta.placeholder: true` flag as a reminder that some
content (the People roster, the News posts, sample "Concept" projects,
stats, and the `home.trust.logos` tiles) is placeholder-first content
written to demonstrate structure. Replace it with real
people/posts/projects/photos/figures before treating the site as final,
and consider removing the `_meta` note once done.

### Images

Every image referenced in `content.json` is loaded by path. If a file
doesn't exist yet, the site automatically shows a clearly-labeled
placeholder instead of a broken image — so you can publish structure now
and drop in real photography later with zero code changes.

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
in the header (rendered by `renderHeader()` in `js/main.js`) flips
`<html data-theme>` and saves the choice to `localStorage['theme']`.

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

A small consent banner (`cookieBanner` in `content.json`) slides up from
the bottom on first visit and doesn't reappear once the visitor clicks
Accept or Decline (`setupCookieBanner()` in `js/main.js` stores the choice
in `localStorage['cookieConsent']`). It's currently cosmetic — this site
doesn't set any tracking cookies itself — so wire it up to your actual
analytics/consent logic if you add any later.

## Local preview

Because pages fetch `/content.json` via JavaScript, opening `index.html`
directly (`file://...`) will fail in most browsers (blocked by CORS), and
root-relative asset paths won't resolve either. Serve the folder over local
HTTP instead.

Recommended — this repo's own dev server (Python stdlib only, no
dependencies), which matches Cloudflare Pages' unmatched-path → `404.html`
behavior and auto-refreshes the browser tab whenever a file changes:

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

## Deploying to Cloudflare Pages

This is a static site with no build step, and Cloudflare Pages serves
`<folder>/index.html` at `<folder>/` automatically, plus `404.html` at the
project root for unmatched paths — no extra routing config needed.

1. Push this folder to a GitHub/GitLab repo (or use Cloudflare's direct
   upload / Wrangler CLI if you'd rather not use git).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages →
   Connect to Git**, select the repo.
3. Build settings:
   - **Build command:** _(leave blank — none needed)_
   - **Output directory:** `/`
4. Deploy. Every future content update (editing `content.json`, adding
   project images) just needs a new commit/push — Cloudflare redeploys
   automatically.

## Wiring up the contact form

The contact form currently posts to `#` (nowhere) and shows a note saying
so — `contact.formNote` / `contact.formAction` in `content.json`. Since
this is a static site, pick a form backend and paste its endpoint into
`contact.formAction`:

- **Web3Forms** (web3forms.com) — free, no signup wall, just an access key.
- **Formspree** (formspree.io) — free tier, signup required.

Once `formAction` points at a real endpoint, delete/blank out
`contact.formNote` in `content.json`.

## Known trade-off

Content is rendered client-side from `content.json` rather than baked into
static HTML at build time. This keeps updates code-free, but means each
page (except 404.html, which is static) is empty until JavaScript runs
(fine for users and for Google/Bing, which both execute JS — but relevant
if you later care about non-JS crawlers or very old browsers). If that
ever becomes a problem, the fix is moving to a static-site generator (e.g.
Astro/11ty) that pre-renders `content.json` into HTML at build time — the
content schema and the folder-per-page URL structure would carry over
largely as-is.
