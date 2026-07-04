#!/usr/bin/env node
/**
 * Manage D1-backed news posts (list / add / edit / delete). No
 * dependencies — shells out to `wrangler d1 execute`. Every query goes
 * through a temp .sql file rather than an inline --command string, so
 * post content never has to be shell-escaped.
 *
 *   node scripts/news.js list
 *   node scripts/news.js add --title "..." --tag "Announcement" --excerpt "..." --image "/assets/images/news/foo.jpg" --alt "..." [--date YYYY-MM-DD]
 *   node scripts/news.js add                                  (interactive prompts for any flag left out)
 *   node scripts/news.js edit <id> --title "..." [--tag ...] [--date ...] [--excerpt ...] [--image ...] [--alt ...]
 *   node scripts/news.js delete <id>
 *
 * Add --local --persist-to <path> to any command to target your local dev
 * database (matching whatever you pass to `wrangler dev`) instead of the
 * live one.
 */
const readline = require('readline');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// asCommand: true for fixed queries with no (or only numeric-validated)
// interpolation — needed because `wrangler d1 execute --remote --file=`
// reports execution stats instead of actual row data, unlike --command.
// Queries carrying arbitrary user text (INSERT/UPDATE) stay file-based
// instead, so that content never has to be shell-escaped.
function runD1(sql, { local, persistTo }, { asCommand = false } = {}) {
  const args = ['wrangler', 'd1', 'execute', 'dokimos-db', local ? '--local' : '--remote', '--json'];
  if (local && persistTo) args.push('--persist-to', persistTo);

  let tmpFile = null;
  if (asCommand) {
    // shell: true doesn't auto-quote args (they're joined with plain
    // spaces), so a multi-word SQL string needs explicit quoting here or
    // the shell/yargs sees each word as a separate argument. Safe to wrap
    // in double quotes verbatim: asCommand is only ever used for the fixed
    // list/lookup queries below, which never contain a `"` character.
    args.push('--command', `"${sql}"`);
  } else {
    tmpFile = path.join(os.tmpdir(), `dokimos-news-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`);
    fs.writeFileSync(tmpFile, sql, 'utf8');
    args.push(`--file=${tmpFile}`);
  }

  try {
    // shell: true is required on Windows to spawn the npx.cmd shim at all
    // (Node refuses to exec .cmd files directly as of Node 18+). Safe here:
    // asCommand queries are fixed/numeric-only, and file-based queries
    // never put post content in a shell argument at all.
    const output = execFileSync('npx', args, { shell: true, encoding: 'utf8' });
    // --remote prints upload-progress lines before the JSON result; --local
    // doesn't. Either way the JSON payload itself always starts at the
    // first '[', so slice from there rather than assuming clean output.
    const jsonStart = output.indexOf('[');
    const parsed = JSON.parse(output.slice(jsonStart));
    return parsed[0].results;
  } finally {
    if (tmpFile) fs.unlinkSync(tmpFile);
  }
}

function parseFlags(argv) {
  const flags = { local: false };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--local') { flags.local = true; continue; }
    if (a === '--persist-to') { flags.persistTo = argv[++i]; continue; }
    if (a.startsWith('--')) { flags[a.slice(2)] = argv[++i]; continue; }
    positional.push(a);
  }
  return { flags, positional };
}

async function promptForMissing(flags, fields) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));
  for (const [key, label] of fields) {
    if (flags[key] === undefined) flags[key] = await ask(label);
  }
  rl.close();
  return flags;
}

function requireFields(flags, keys) {
  const missing = keys.filter((k) => !String(flags[k] || '').trim());
  if (missing.length) {
    console.error(`Missing required field(s): ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function cmdList(argv) {
  const { flags } = parseFlags(argv);
  const rows = runD1(
    'SELECT id, title, tag, published_date FROM news_posts ORDER BY published_date DESC, id DESC;',
    flags,
    { asCommand: true }
  );
  if (!rows.length) {
    console.log('No posts yet.');
    return;
  }
  rows.forEach((r) => console.log(`#${r.id}  [${r.tag}]  ${r.published_date}  ${r.title}`));
}

async function cmdAdd(argv) {
  let { flags } = parseFlags(argv);
  const isNonInteractive = ['title', 'tag', 'excerpt', 'image', 'alt'].some((k) => flags[k] !== undefined);
  if (!isNonInteractive) {
    flags = await promptForMissing(flags, [
      ['title', 'Title: '],
      ['tag', 'Tag (e.g. Announcement, Project, Firm News): '],
      ['date', `Date [YYYY-MM-DD, default ${todayIso()}]: `],
      ['excerpt', 'Excerpt (1-2 sentences): '],
      ['image', 'Image path (e.g. /assets/images/news/my-post.jpg): '],
      ['alt', 'Image alt text: '],
    ]);
  }
  requireFields(flags, ['title', 'tag', 'excerpt', 'image', 'alt']);

  const publishedDate = String(flags.date || '').trim() || todayIso();
  const createdAt = new Date().toISOString();
  const sql = `INSERT INTO news_posts (title, tag, published_date, excerpt, image, image_alt, created_at)
VALUES ('${sqlEscape(flags.title)}', '${sqlEscape(flags.tag)}', '${sqlEscape(publishedDate)}', '${sqlEscape(flags.excerpt)}', '${sqlEscape(flags.image)}', '${sqlEscape(flags.alt)}', '${sqlEscape(createdAt)}');`;
  runD1(sql, flags);
  console.log('Post added.');
}

async function cmdEdit(argv) {
  const { flags, positional } = parseFlags(argv);
  const id = Number(positional[0]);
  if (!Number.isInteger(id)) {
    console.error('Usage: node scripts/news.js edit <id> [--title ...] [--tag ...] [--date ...] [--excerpt ...] [--image ...] [--alt ...]');
    process.exit(1);
  }

  const existingRows = runD1(`SELECT * FROM news_posts WHERE id = ${id};`, flags, { asCommand: true });
  if (!existingRows.length) {
    console.error(`No post with id ${id}.`);
    process.exit(1);
  }
  const existing = existingRows[0];

  const merged = {
    title: flags.title !== undefined ? flags.title : existing.title,
    tag: flags.tag !== undefined ? flags.tag : existing.tag,
    published_date: flags.date !== undefined ? flags.date : existing.published_date,
    excerpt: flags.excerpt !== undefined ? flags.excerpt : existing.excerpt,
    image: flags.image !== undefined ? flags.image : existing.image,
    image_alt: flags.alt !== undefined ? flags.alt : existing.image_alt,
  };

  const sql = `UPDATE news_posts SET
  title = '${sqlEscape(merged.title)}',
  tag = '${sqlEscape(merged.tag)}',
  published_date = '${sqlEscape(merged.published_date)}',
  excerpt = '${sqlEscape(merged.excerpt)}',
  image = '${sqlEscape(merged.image)}',
  image_alt = '${sqlEscape(merged.image_alt)}'
WHERE id = ${id};`;
  runD1(sql, flags);
  console.log(`Updated post #${id}.`);
}

async function cmdDelete(argv) {
  const { flags, positional } = parseFlags(argv);
  const id = Number(positional[0]);
  if (!Number.isInteger(id)) {
    console.error('Usage: node scripts/news.js delete <id>');
    process.exit(1);
  }
  runD1(`DELETE FROM news_posts WHERE id = ${id};`, flags);
  console.log(`Deleted post #${id} (if it existed).`);
}

(async () => {
  const [command, ...rest] = process.argv.slice(2);
  const commands = { list: cmdList, add: cmdAdd, edit: cmdEdit, delete: cmdDelete };
  if (!commands[command]) {
    console.error('Usage: node scripts/news.js <list|add|edit|delete> [...]');
    process.exit(1);
  }
  await commands[command](rest);
})();
