CREATE TABLE IF NOT EXISTS news_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  tag TEXT NOT NULL,
  published_date TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  image TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  created_at TEXT NOT NULL
);
