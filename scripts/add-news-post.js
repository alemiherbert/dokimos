#!/usr/bin/env node
/**
 * Adds a news post to the D1 `news_posts` table. No dependencies — shells
 * out to `wrangler d1 execute`. Two ways to run it:
 *
 *   node scripts/add-news-post.js
 *     Interactive — prompts for each field.
 *
 *   node scripts/add-news-post.js --title "..." --tag "..." --excerpt "..." --image "/assets/images/news/foo.jpg" --alt "..." [--date YYYY-MM-DD]
 *     Non-interactive — pass every field as a flag. --date defaults to today.
 *
 * Add --local to write to your local dev DB instead of the live one (pass
 * --persist-to <path> too, matching whatever you use for `wrangler dev`).
 */
const readline = require('readline');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

function parseArgs(argv) {
  const args = { local: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--local') { args.local = true; continue; }
    if (a === '--persist-to') { args.persistTo = argv[++i]; continue; }
    if (a === '--title') { args.title = argv[++i]; continue; }
    if (a === '--tag') { args.tag = argv[++i]; continue; }
    if (a === '--date') { args.date = argv[++i]; continue; }
    if (a === '--excerpt') { args.excerpt = argv[++i]; continue; }
    if (a === '--image') { args.image = argv[++i]; continue; }
    if (a === '--alt') { args.alt = argv[++i]; continue; }
  }
  return args;
}

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function promptForMissing(args) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

  if (args.title === undefined) args.title = await ask('Title: ');
  if (args.tag === undefined) args.tag = await ask('Tag (e.g. Announcement, Project, Firm News): ');
  if (args.date === undefined) args.date = await ask(`Date [YYYY-MM-DD, default ${todayIso()}]: `);
  if (args.excerpt === undefined) args.excerpt = await ask('Excerpt (1-2 sentences): ');
  if (args.image === undefined) args.image = await ask('Image path (e.g. /assets/images/news/my-post.jpg): ');
  if (args.alt === undefined) args.alt = await ask('Image alt text: ');

  rl.close();
  return args;
}

(async () => {
  let args = parseArgs(process.argv.slice(2));
  const isNonInteractive = args.title !== undefined || args.tag !== undefined
    || args.excerpt !== undefined || args.image !== undefined || args.alt !== undefined;

  console.log(args.local ? 'Adding a news post to the LOCAL dev database.\n' : 'Adding a news post to the LIVE (remote) database.\n');

  if (!isNonInteractive) {
    args = await promptForMissing(args);
  }

  const title = (args.title || '').trim();
  const tag = (args.tag || '').trim();
  const publishedDate = (args.date || '').trim() || todayIso();
  const excerpt = (args.excerpt || '').trim();
  const image = (args.image || '').trim();
  const imageAlt = (args.alt || '').trim();

  if (!title || !tag || !excerpt || !image || !imageAlt) {
    console.error('Title, tag, excerpt, image, and alt text are all required. Aborted — nothing was inserted.');
    process.exit(1);
  }

  const createdAt = new Date().toISOString();
  const sql = `INSERT INTO news_posts (title, tag, published_date, excerpt, image, image_alt, created_at)
VALUES ('${sqlEscape(title)}', '${sqlEscape(tag)}', '${sqlEscape(publishedDate)}', '${sqlEscape(excerpt)}', '${sqlEscape(image)}', '${sqlEscape(imageAlt)}', '${sqlEscape(createdAt)}');`;

  const tmpFile = path.join(os.tmpdir(), `dokimos-news-post-${Date.now()}.sql`);
  fs.writeFileSync(tmpFile, sql, 'utf8');

  const wranglerArgs = ['wrangler', 'd1', 'execute', 'dokimos-db', args.local ? '--local' : '--remote'];
  if (args.local && args.persistTo) wranglerArgs.push('--persist-to', args.persistTo);
  wranglerArgs.push(`--file=${tmpFile}`);

  try {
    console.log('Running: npx ' + wranglerArgs.join(' ') + '\n');
    // shell: true is required on Windows to spawn the npx.cmd shim at all
    // (Node refuses to exec .cmd files directly as of Node 18+). Safe here:
    // every argument is either a fixed flag or a path we generated
    // ourselves (os.tmpdir() + Date.now(), or the user's own --persist-to
    // value) — no untrusted post content ever reaches the shell.
    execFileSync('npx', wranglerArgs, { stdio: 'inherit', shell: true });
    console.log('\nDone — post added.');
  } finally {
    fs.unlinkSync(tmpFile);
  }
})();
