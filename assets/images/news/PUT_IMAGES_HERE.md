# News post images

`content.json` → `news.posts[].image` expects one file per post, roughly **1280×800px (16:10)** or larger:

- placeholder-1.jpg
- placeholder-2.jpg
- placeholder-3.jpg
- placeholder-4.jpg

The whole `news` section in `content.json` (titles, dates, tags, excerpts, images) is placeholder content — replace it with real posts whenever you have them. To add/remove a post, add/remove an entry in the `news.posts` array and drop in a matching image — no HTML/CSS/JS editing required.

Until real photos are added, the site shows clearly-labeled placeholders in their place — nothing breaks.
