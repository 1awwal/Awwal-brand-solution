import page1 from './video-editing-course.html';
import page2 from './videography-course.html';
import page3 from './photography-course.html';
import page4 from './photo-editing-course.html';
import page5 from './motion-graphics-course.html';
import page6 from './graphic-design-course.html';
import page7 from './digital-marketing-course.html';
import page8 from './web-design-course.html';

const pages = new Map([
  ['/video-editing-course', page1],
  ['/videography-course', page2],
  ['/photography-course', page3],
  ['/photo-editing-course', page4],
  ['/motion-graphics-course', page5],
  ['/graphic-design-course', page6],
  ['/digital-marketing-course', page7],
  ['/web-design-course', page8],
]);

const supabaseUrl = 'https://sfaejrunzvsgmovqkrnm.supabase.co';
const supabaseKey = 'sb_publishable_Jpo-7sKpJ2OUtYmJk3GhGQ_AXVzvB00'; // Publishable key for the learner accounts project.
const cookieName = '__Host-awwal-course-session';
const cookie = (value, age) =>
  `${cookieName}=${value}; Max-Age=${age}; Path=/; Secure; HttpOnly; SameSite=Lax`;
const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex',
  'X-Content-Type-Options': 'nosniff',
};

const tokenFrom = request => request.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
const authHeaders = token => ({ apikey: supabaseKey, Authorization: 'Bearer ' + token });
const empty = (status, headers = {}) => new Response(null, { status, headers: { ...privateHeaders, ...headers } });
const json = (data, status = 200, headers = {}) => Response.json(data, {
  status, headers: { ...privateHeaders, ...headers },
});

async function authenticatedLearner(token) {
  if (!token || token.length > 3800 || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return null;
  const response = await fetch(supabaseUrl + '/auth/v1/user', {
    headers: authHeaders(token),
    redirect: 'error',
    signal: AbortSignal.timeout(5000),
  });
  if ([400, 401, 403, 404].includes(response.status)) return null;
  if (!response.ok) throw new Error('Learner authentication unavailable');
  const user = await response.json();
  return user.id && user.role === 'authenticated' && !user.is_anonymous ? user : null;
}

async function ensureLearners(db) {
  await db.prepare('CREATE TABLE IF NOT EXISTS course_learners ('
    + 'sequence INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL UNIQUE, '
    + 'full_name TEXT NOT NULL, phone TEXT NOT NULL, registered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)').run();
}

function findLearner(db, userId) {
  return db.prepare('SELECT full_name FROM course_learners WHERE user_id = ?').bind(userId).first();
}

export async function listCourseLearners(db, before) {
  await ensureLearners(db);
  const query = 'SELECT sequence, full_name, phone, registered_at FROM course_learners'
    + (before ? ' WHERE sequence < ?' : '') + ' ORDER BY sequence DESC LIMIT 51';
  const { results } = await (before ? db.prepare(query).bind(before) : db.prepare(query)).all();
  const page = results.slice(0, 50);
  return {
    items: page.map(row => ({ id: row.sequence, name: row.full_name, phone: row.phone, receivedAt: row.registered_at })),
    nextCursor: results.length > 50 ? String(page.at(-1).sequence) : null,
  };
}

export async function courseSession(request, url, db, readJson) {
  if (request.headers.get('Origin') !== url.origin) return empty(403);
  if (request.method === 'DELETE') return empty(204, { 'Set-Cookie': cookie('', 0) });
  if (request.method !== 'POST') return empty(405, { Allow: 'POST, DELETE' });
  if (!db) return empty(503);
  try {
    const user = await authenticatedLearner(tokenFrom(request));
    if (!user) return empty(401);
    await ensureLearners(db);
    let learner = await findLearner(db, user.id);
    if (!learner) {
      if (!request.body) return json({ registrationRequired: true }, 422);
      let input;
      try { input = await readJson(request); } catch { return json({ error: 'Check your name and phone number.' }, 422); }
      const name = typeof input?.name === 'string' ? input.name.trim() : '';
      const phone = typeof input?.phone === 'string' ? input.phone.trim().replace(/[\s().-]/g, '') : '';
      if (!name || name.length > 100 || /[\u0000-\u001f\u007f]/.test(name)) {
        return json({ error: 'Enter your full name exactly as it should appear on certificates.' }, 422);
      }
      if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
        return json({ error: 'Enter a valid phone number with its country code, such as +966.' }, 422);
      }
      await db.prepare('INSERT INTO course_learners (user_id, full_name, phone) VALUES (?, ?, ?) ON CONFLICT(user_id) DO NOTHING')
        .bind(user.id, name, phone).run();
      learner = await findLearner(db, user.id);
    }
    return json({ name: learner.full_name }, 200, { 'Set-Cookie': cookie(tokenFrom(request), 3600) });
  } catch {
    return empty(503);
  }
}

export async function deleteCourseAccount(request, url, db) {
  if (request.headers.get('Origin') !== url.origin) return empty(403);
  if (request.method !== 'POST') return empty(405, { Allow: 'POST' });
  if (!db) return empty(503);
  try {
    const token = tokenFrom(request);
    const user = await authenticatedLearner(token);
    if (!user) return empty(401);
    await ensureLearners(db);
    const response = await fetch(supabaseUrl + '/functions/v1/delete-account', {
      method: 'POST', headers: authHeaders(token), redirect: 'error', signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return empty(503);
    await db.prepare('DELETE FROM course_learners WHERE user_id = ?').bind(user.id).run();
    return empty(204, { 'Set-Cookie': cookie('', 0) });
  } catch {
    return empty(503);
  }
}

const attributeEntities = { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' };

function personalizeCourse(page, name) {
  const escapedName = name.replace(/[&"<>]/g, character => attributeEntities[character]);
  return page
    .replace(/<input id="cert-name"[^>]*>/, () => '<input id="cert-name" type="text" readonly value="' + escapedName + '">')
    .replace('Enter your name to generate a certificate you can download and share.',
      'Your registered name is used on every certificate and cannot be changed.')
    .replace('course.js?v=20261113', 'course.js?v=locked-certificate-name-1');
}

export async function coursePage(request, url, db) {
  const page = pages.get(url.pathname);
  if (!page) return null;
  if (request.method !== 'GET' && request.method !== 'HEAD') return empty(405, { Allow: 'GET, HEAD' });
  const token = request.headers.get('Cookie')?.match(/(?:^|;\s*)__Host-awwal-course-session=([^;]+)/)?.[1];
  try {
    const user = await authenticatedLearner(token);
    if (user) {
      if (!db) throw new Error('Learner database unavailable');
      const learner = await findLearner(db, user.id);
      if (learner) {
        return new Response(request.method === 'HEAD' ? null : personalizeCourse(page, learner.full_name), {
          headers: { ...privateHeaders, 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    }
  } catch {
    return new Response(request.method === 'HEAD' ? null : 'Course access is temporarily unavailable. Please try again shortly.', {
      status: 503, headers: privateHeaders,
    });
  }
  const login = new URL('/my-courses', url);
  login.searchParams.set('next', url.pathname + url.search);
  return empty(302, { Location: login.href });
}
