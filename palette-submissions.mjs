import {listCourseLearners} from './course-access.mjs';

const PUBLIC_ORIGIN = 'https://awwalbrands.com';
const PORTAL_ORIGIN = 'https://portal.awwalbrands.com';
const STATUS = new Set(['pending', 'approved', 'rejected']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const json = (data, status = 200, origin = '') => Response.json(data, {
  status,
  headers: {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
  },
});

async function readInput(request) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new Error('Use JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('A submission is required.');
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 8192) {
      await reader.cancel();
      throw new Error('The submission is too large.');
    }
    chunks.push(value);
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(buffer));
}

export function validatePalette(input) {
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Invalid palette.');
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const author = typeof input.author === 'string' ? input.author.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  if (name.length < 2 || name.length > 70) throw new Error('Use 2–70 characters for your palette name.');
  if (author.length < 2 || author.length > 80) throw new Error('Use 2–80 characters for your name.');
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new Error('Enter a valid email address.');
  if (input.website || input.consent !== true || !UUID.test(input.requestKey || '')) throw new Error('Please complete the submission form.');
  if (!Array.isArray(input.colors) || input.colors.length < 2 || input.colors.length > 6) throw new Error('Add 2–6 hex color codes.');
  const colors = input.colors.map(value => {
    if (typeof value !== 'string' || !/^#?[0-9a-f]{6}$/i.test(value.trim())) throw new Error('Use six-digit hex codes such as #1428A0.');
    return value.trim().replace(/^#/, '').toUpperCase();
  });
  if (new Set(colors).size !== colors.length) throw new Error('Use a different color in every swatch.');
  return { name, author, email, colors, consent: true };
}

async function ensureTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS palette_submissions (
    id TEXT PRIMARY KEY, request_key TEXT NOT NULL UNIQUE, payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
    revision INTEGER NOT NULL DEFAULT 0, received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TEXT, reviewed_by TEXT
  )`).run();
}

function pageCursor(url) {
  const value = url.searchParams.get('before');
  if (value === null || value === '') return null;
  if (!/^[1-9]\d{0,14}$/.test(value)) throw new Error('Invalid page cursor.');
  return Number(value);
}

function publicPalette(row) {
  const data = JSON.parse(row.payload);
  return { id: row.id, name: data.name, author: data.author, colors: data.colors };
}

// The fixed portal configuration contains its public Supabase anon key only.
// User identity and the current admin role are verified server-side on every request.
export async function authenticateAdmin(request, transport = fetch) {
  const authorization = request.headers.get('Authorization') || '';
  if (!/^Bearer [\w.-]+$/.test(authorization)) return null;
  const configResponse = await transport(PORTAL_ORIGIN + '/apply/config.js', { signal: AbortSignal.timeout(8000) });
  if (!configResponse.ok) throw new Error('Authentication temporarily unavailable.');
  const text = await configResponse.text();
  const match = text.match(/^\s*window\.AWWAL_CONFIG\s*=\s*(\{[\s\S]*\});?\s*$/);
  if (!match) throw new Error('Authentication configuration unavailable.');
  const config = JSON.parse(match[1]);
  if (config.url !== 'https://zigoknvymvgoxmpgixzz.supabase.co' || !config.key) throw new Error('Invalid authentication configuration.');
  const headers = { Authorization: authorization, apikey: config.key };
  const userResponse = await transport(config.url + '/auth/v1/user', { headers, signal: AbortSignal.timeout(8000) });
  if (!userResponse.ok) return null;
  const user = await userResponse.json();
  if (!UUID.test(user.id || '')) return null;
  const profileResponse = await transport(config.url + '/rest/v1/profiles?select=id,role&id=eq.' + encodeURIComponent(user.id), {
    headers, signal: AbortSignal.timeout(8000),
  });
  if (!profileResponse.ok) return null;
  const profiles = await profileResponse.json();
  return profiles.length === 1 && profiles[0].id === user.id && profiles[0].role === 'admin' ? user.id : null;
}

export async function paletteApi(request, env, transport = fetch) {
  const url = new URL(request.url);
  const isPublic = url.pathname === '/api/community-palettes';
  const isAdmin = url.pathname.startsWith('/api/admin/');
  const isList = url.pathname === '/api/admin/palette-submissions';
  const isCourseLearners = url.pathname === '/api/admin/course-learners';
  const isEnquiries = url.pathname === '/api/admin/website-enquiries';
  const reviewId = url.pathname.match(/^\/api\/admin\/palette-submissions\/([0-9a-f-]{36})$/i)?.[1];
  if (!isPublic && !isList && !isEnquiries && !isCourseLearners && !reviewId) return null;
  const origin = request.headers.get('Origin') || '';
  const cors = isAdmin && origin === PORTAL_ORIGIN ? PORTAL_ORIGIN : '';
  if (isAdmin && origin && origin !== PORTAL_ORIGIN) return json({ error: 'Origin not allowed.' }, 403);
  if (request.method === 'OPTIONS' && isAdmin && cors) {
    return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': cors, 'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '600', Vary: 'Origin',
    } });
  }
  if (!env.ENQUIRIES) return json({ error: 'Website inbox temporarily unavailable.' }, 503, cors);
  try {
    let admin = null;
    if (isAdmin) {
      admin = await authenticateAdmin(request, transport);
      if (!admin) return json({ error: 'An active portal admin session is required.' }, 403, cors);
    }
    if (isCourseLearners) {
      if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405, cors);
      let before;
      try { before = pageCursor(url); } catch (error) { return json({ error: error.message }, 400, cors); }
      return json(await listCourseLearners(env.ENQUIRIES, before), 200, cors);
    }
    if (isEnquiries) {
      if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405, cors);
      const before = pageCursor(url);
      const query = 'SELECT rowid AS sequence,id,payload,received_at FROM enquiries' + (before ? ' WHERE rowid < ?' : '') + ' ORDER BY rowid DESC LIMIT 51';
      const result = await (before ? env.ENQUIRIES.prepare(query).bind(before) : env.ENQUIRIES.prepare(query)).all();
      const rows = result.results || [];
      const page = rows.slice(0, 50);
      return json({ items: page.map(row => ({ id: row.id, receivedAt: row.received_at, ...JSON.parse(row.payload) })),
        nextCursor: rows.length > 50 ? String(page.at(-1).sequence) : null }, 200, cors);
    }
    await ensureTable(env.ENQUIRIES);
    if (isPublic && request.method === 'POST') {
      if (origin !== PUBLIC_ORIGIN) return json({ error: 'Submit your palette from the Awwal website.' }, 403);
      let input, data;
      try { input = await readInput(request); data = validatePalette(input); }
      catch (error) { return json({ error: error.message }, 422); }
      const payload = JSON.stringify(data);
      const existing = await env.ENQUIRIES.prepare('SELECT id,payload FROM palette_submissions WHERE request_key=?').bind(input.requestKey).first();
      if (existing) return existing.payload === payload
        ? json({ received: true, reference: existing.id }, 200)
        : json({ error: 'This reference was already used. Refresh and submit a new palette.' }, 409);
      const bucket = Math.floor(Date.now() / 3600000);
      const address = request.headers.get('CF-Connecting-IP') || 'unknown';
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('palette:' + address + ':' + bucket));
      const hash = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
      const rate = await env.ENQUIRIES.prepare('INSERT INTO enquiry_rate(bucket,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(hash, (bucket + 2) * 3600).first();
      if (!rate || rate.attempts > 10) return json({ error: 'Too many submissions. Please try again later.' }, 429);
      const id = crypto.randomUUID();
      // Unique request keys keep retries and concurrent delivery from creating duplicate submissions.
      await env.ENQUIRIES.prepare('INSERT INTO palette_submissions(id,request_key,payload) VALUES (?,?,?) ON CONFLICT(request_key) DO NOTHING').bind(id, input.requestKey, payload).run();
      const saved = await env.ENQUIRIES.prepare('SELECT id,payload FROM palette_submissions WHERE request_key=?').bind(input.requestKey).first();
      if (!saved || saved.payload !== payload) return json({ error: 'This reference was already used.' }, 409);
      return json({ received: true, reference: saved.id }, 201);
    }
    if ((isPublic || isList) && request.method === 'GET') {
      const status = isPublic ? 'approved' : (url.searchParams.get('status') || 'pending');
      if (!STATUS.has(status) && status !== 'all') return json({ error: 'Invalid status filter.' }, 400, cors);
      const before = pageCursor(url);
      const terms = [], values = [];
      if (status !== 'all') { terms.push('status=?'); values.push(status); }
      if (before) { terms.push('rowid < ?'); values.push(before); }
      const query = 'SELECT rowid AS sequence,* FROM palette_submissions' + (terms.length ? ' WHERE ' + terms.join(' AND ') : '') + ' ORDER BY rowid DESC LIMIT 51';
      const result = await env.ENQUIRIES.prepare(query).bind(...values).all();
      const rows = result.results || [], page = rows.slice(0, 50);
      return json({ items: page.map(row => isPublic ? publicPalette(row) : ({
        ...publicPalette(row), email: JSON.parse(row.payload).email, status: row.status,
        revision: row.revision, receivedAt: row.received_at, reviewedAt: row.reviewed_at,
      })), nextCursor: rows.length > 50 ? String(page.at(-1).sequence) : null }, 200, cors);
    }
    if (reviewId && request.method === 'PATCH') {
      let input;
      try { input = await readInput(request); } catch { return json({ error: 'Invalid review.' }, 422, cors); }
      if (!['approved', 'rejected'].includes(input?.status) || !Number.isSafeInteger(input.revision) || input.revision < 0) {
        return json({ error: 'Choose Approve or Reject for the current submission revision.' }, 422, cors);
      }
      const row = await env.ENQUIRIES.prepare("UPDATE palette_submissions SET status=?,revision=revision+1,reviewed_at=CURRENT_TIMESTAMP,reviewed_by=? WHERE id=? AND revision=? RETURNING id").bind(input.status, admin, reviewId, input.revision).first();
      if (!row) return json({ error: 'This submission changed. Refresh before reviewing it again.' }, 409, cors);
      return json({ updated: true }, 200, cors);
    }
    return json({ error: 'Method not allowed.' }, 405, cors);
  } catch (error) {
    console.error('Website inbox request failed', error.name);
    return json({ error: 'Website inbox temporarily unavailable. Please try again.' }, 503, cors);
  }
}
