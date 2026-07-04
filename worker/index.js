/**
 * Worker entry point: serves the static site via env.ASSETS and handles
 * the /api/contact endpoint (D1 storage + email notification via Resend).
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTHS = { name: 100, email: 254, organization: 200, message: 5000 };
const DAILY_EMAIL_CAP = 40; // stays well under Resend's free-tier 100/day limit
const ALLOWED_ORIGINS = [
  'https://dokimos.alemiherbert.workers.dev',
  // Add the production custom domain here once it's live, e.g.:
  // 'https://dokimos.co.ug',
  'http://localhost:8788', // local `wrangler dev` testing only; harmless in prod since
                           // a remote attacker's browser can't spoof its own origin as localhost
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed' }, 405);
      }
      return handleContact(request, env);
    }

    if ((url.pathname === '/news' || url.pathname === '/news/') && request.method === 'GET') {
      return handleNewsPage(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

// Renders news posts from D1 into the static news page server-side, so the
// response is still plain HTML with no client-side fetch/render step. Falls
// back to the page's static placeholder cards untouched if D1 has no posts
// yet or the query fails, rather than showing an empty page.
async function handleNewsPage(request, env) {
  const assetResponse = await env.ASSETS.fetch(request);
  if (!assetResponse.ok) return assetResponse;

  let posts;
  try {
    const { results } = await env.DB.prepare(
      `SELECT title, tag, published_date, excerpt, image, image_alt
       FROM news_posts ORDER BY published_date DESC, id DESC LIMIT 24`
    ).all();
    posts = results;
  } catch (err) {
    console.error('Failed to load news posts from D1:', err);
    return noStore(assetResponse);
  }

  if (!posts || posts.length === 0) return noStore(assetResponse);

  const cardsHtml = posts.map(newsCardHtml).join('');
  const rewriter = new HTMLRewriter().on('.news-grid', {
    element(el) {
      el.setInnerContent(cardsHtml, { html: true });
    },
  });
  return noStore(rewriter.transform(assetResponse));
}

// This page's content depends on live D1 data that can change at any time
// (via scripts/news.js) without a new deployment, unlike a normal static
// asset. Cloudflare's edge otherwise caches it like any other asset
// response (CF-Cache-Status: HIT even with max-age=0), so every visitor
// keeps seeing whatever was cached the moment it was last requested after
// a deploy -- regardless of posts added/edited/deleted since. no-store
// forces both the edge and the browser to always hit this handler fresh.
function noStore(response) {
  const copy = new Response(response.body, response);
  copy.headers.set('Cache-Control', 'no-store');
  copy.headers.delete('ETag');
  return copy;
}

function newsCardHtml(post) {
  return `
    <article class="news-card" data-reveal tabindex="0">
      <div class="media-frame"><img class="js-img" data-path="${escapeHtml(post.image)}" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.image_alt)}" loading="lazy"></div>
      <div class="news-overlay">
        <span class="news-tag">${escapeHtml(post.tag)}</span>
        <h3 class="news-title">${escapeHtml(post.title)}</h3>
        <time class="news-date" datetime="${escapeHtml(post.published_date)}">${escapeHtml(formatDate(post.published_date))}</time>
        <p class="news-excerpt">${escapeHtml(post.excerpt)}</p>
      </div>
    </article>`;
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

async function handleContact(request, env) {
  const origin = request.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return json({ ok: false, error: 'Request origin not allowed.' }, 403);
  }

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';

  if (env.CONTACT_RATE_LIMITER) {
    const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: ip });
    if (!success) {
      return json({ ok: false, error: 'Too many requests. Please try again in a minute.' }, 429);
    }
  }

  let data;
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      data = Object.fromEntries((await request.formData()).entries());
    }
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  // Honeypot: real visitors never fill this hidden field. Pretend success
  // without touching D1 or sending email, so bots don't learn they were caught.
  if (String(data.website || '').trim()) {
    return json({ ok: true });
  }

  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim();
  const organization = String(data.organization || '').trim();
  const message = String(data.message || '').trim();

  if (!name || !email || !message) {
    return json({ ok: false, error: 'Name, email, and message are required.' }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'Please provide a valid email address.' }, 400);
  }
  if (
    name.length > MAX_LENGTHS.name ||
    email.length > MAX_LENGTHS.email ||
    organization.length > MAX_LENGTHS.organization ||
    message.length > MAX_LENGTHS.message
  ) {
    return json({ ok: false, error: 'One or more fields are too long.' }, 400);
  }

  const createdAt = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO contact_submissions (name, email, organization, message, created_at, ip)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(name, email, organization, message, createdAt, ip).run();
  } catch (err) {
    return json({ ok: false, error: 'Could not save your submission. Please try again.' }, 500);
  }

  if (env.RESEND_API_KEY) {
    try {
      const sentToday = await countSubmissionsSince(env, last24Hours());
      if (sentToday <= DAILY_EMAIL_CAP) {
        await sendNotificationEmail(env, { name, email, organization, message, createdAt });
      } else {
        console.warn(`Daily email cap (${DAILY_EMAIL_CAP}) reached; skipping notification for submission at ${createdAt}.`);
      }
    } catch (err) {
      // The submission is already saved in D1 even if the email fails, so
      // the visitor still gets a success response rather than a false error.
      console.error('Contact notification email failed:', err);
    }
  }

  return json({ ok: true });
}

function last24Hours() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

async function countSubmissionsSince(env, isoTimestamp) {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM contact_submissions WHERE created_at >= ?`
  ).bind(isoTimestamp).first();
  return row ? row.count : 0;
}

async function sendNotificationEmail(env, { name, email, organization, message, createdAt }) {
  const recipient = env.CONTACT_RECIPIENT;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Dokimos Website <onboarding@resend.dev>',
      to: [recipient],
      reply_to: email,
      subject: `New contact form message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        organization ? `Organization: ${organization}` : null,
        `Submitted: ${createdAt}`,
        '',
        message,
      ].filter(Boolean).join('\n'),
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend API error ${res.status}: ${await res.text()}`);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
