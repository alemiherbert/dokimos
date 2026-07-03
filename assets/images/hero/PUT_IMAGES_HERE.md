# Hero carousel images

The hero is a 3-slide carousel — `content.json` → `home.hero.slides[].image` expects these exact files, each a wide landscape shot roughly **2400×1350px (16:9)** or larger, exported as high-quality JPG or WebP. They sit behind a dark gradient and large white type, so avoid busy top-left/top-right corners and very bright skies.

- **infrastructure.jpg** — water, road, or energy infrastructure (treatment plant, road under construction, solar/hydro)
- **buildings.jpg** — architectural or structural engineering detail (facility exterior, reinforcement, formwork)
- **advisory.jpg** — construction site supervision, planning, or project delivery in progress

Until real photos are added, the site shows clearly-labeled placeholders in their place — nothing breaks. To add/remove a slide, edit the `home.hero.slides` array in `content.json` and add/remove a matching image file — no HTML/CSS/JS editing required.
