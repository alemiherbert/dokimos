# Hero carousel images

The hero is a 3-slide carousel — `index.html`'s `#hero-media` markup
expects these exact files (currently `.webp`), each a wide landscape shot
roughly **2400×1350px (16:9)** or larger, exported as high-quality JPG or
WebP. They sit behind a dark gradient and large white type, so avoid busy
top-left/top-right corners and very bright skies.

- **infrastructure.webp** — water, road, or energy infrastructure (treatment plant, road under construction, solar/hydro)
- **buildings.webp** — architectural or structural engineering detail (facility exterior, reinforcement, formwork)
- **advisory.webp** — construction site supervision, planning, or project delivery in progress

Until real photos are added, the site shows clearly-labeled placeholders in
their place — nothing breaks. To add/remove a slide, edit the `.hero-slide`
divs inside `#hero-media` in `index.html` (each carries `data-headline`,
`data-subheadline`, and `data-href` attributes the carousel JS reads) and
add/remove a matching `.carousel-bar` button in `#carousel-bars`.
