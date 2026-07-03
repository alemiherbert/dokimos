# People photos

`content.json` → `people.members[].photo` expects one file per person, roughly **900×1125px (4:5 portrait)** or larger:

- placeholder-1.jpg
- placeholder-2.jpg
- placeholder-3.jpg
- placeholder-4.jpg
- placeholder-5.jpg

The whole `people` section in `content.json` (names, roles, bios, photos) is placeholder content — replace it with your real team roster whenever it's ready. To add/remove a person, add/remove an entry in the `people.members` array and drop in a matching photo — no HTML/CSS/JS editing required.

Until real photos are added, the site shows clearly-labeled placeholders in their place — nothing breaks.
