# Project images

`work/index.html`'s `.project-card` markup expects one file per project,
roughly **1200×1600px (3:4 portrait)** or larger, matching the filenames
already referenced there:

- kyoga-water-treatment.jpg
- rwizi-irrigation.jpg
- nile-corridor-road.jpg
- kampala-drainage-retrofit.jpg
- karamoja-solar.jpg
- semliki-hydro.jpg

To add a **new** project: copy a `.project-card` block in `work/index.html`
as a template and drop a matching image file here. **Featured** projects
(currently Kyoga, Nile Corridor, Kampala Bypass, Karamoja Solar) are
hand-duplicated into `index.html`'s `#featured-work` section too — there's
no shared data source, so update both files if you change one, and note
the CSS at `#featured-work .projects-grid .project-card:nth-child(4)`
depends on card order (see the comment above that section in `index.html`).

Until real photos are added, the site shows clearly-labeled placeholders in their place — nothing breaks.
