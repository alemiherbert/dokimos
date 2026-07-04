/**
 * Worker entry point: serves the static site via env.ASSETS and handles
 * the /api/contact endpoint (D1 storage + email notification via Resend).
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed' }, 405);
      }
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
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

  const createdAt = new Date().toISOString();
  const ip = request.headers.get('cf-connecting-ip') || '';

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
      await sendNotificationEmail(env, { name, email, organization, message, createdAt });
    } catch (err) {
      // The submission is already saved in D1 even if the email fails, so
      // the visitor still gets a success response rather than a false error.
      console.error('Contact notification email failed:', err);
    }
  }

  return json({ ok: true });
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
