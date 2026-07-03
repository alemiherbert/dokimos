# Project images

`content.json` → `work.items[].image` expects one file per project, roughly **1200×1600px (3:4 portrait)** or larger, matching the filenames already referenced in content.json:

- kyoga-water-treatment.jpg
- rwizi-irrigation.jpg
- nile-corridor-road.jpg
- kampala-drainage-retrofit.jpg
- karamoja-solar.jpg
- semliki-hydro.jpg

To add a **new** project: add a new object to `work.items` in content.json (copy an existing entry as a template) and drop a matching image file here — no HTML/CSS/JS editing required. This same list renders in full on the **Work** page (`/work/`); any item with `"featured": true` also appears in the "Featured Work" teaser on the **Home** page.

Until real photos are added, the site shows clearly-labeled placeholders in their place — nothing breaks.
