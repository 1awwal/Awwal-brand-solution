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

async function authenticatedLearner(token) {
  if (!token || token.length > 3800 || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return null;
  const response = await fetch(supabaseUrl + '/auth/v1/user', {
    headers: { apikey: supabaseKey, Authorization: 'Bearer ' + token },
    redirect: 'error',
    signal: AbortSignal.timeout(5000),
  });
  if ([400, 401, 403, 404].includes(response.status)) return null;
  if (!response.ok) throw new Error('Learner authentication unavailable');
  const user = await response.json();
  return user.id && user.role === 'authenticated' && !user.is_anonymous ? user : null;
}

export async function courseSession(request, url) {
  if (request.headers.get('Origin') !== url.origin) {
    return new Response(null, { status: 403, headers: privateHeaders });
  }
  if (request.method === 'DELETE') {
    return new Response(null, { status: 204, headers: { ...privateHeaders, 'Set-Cookie': cookie('', 0) } });
  }
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { ...privateHeaders, Allow: 'POST, DELETE' } });
  }
  const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
  try {
    const learner = await authenticatedLearner(token);
    if (!learner) return new Response(null, { status: 401, headers: privateHeaders });
    const profileUrl = new URL('/rest/v1/profiles', supabaseUrl);
    profileUrl.search = new URLSearchParams({ select: 'full_name', id: 'eq.' + learner.id, limit: '1' });
    const profileResponse = await fetch(profileUrl, {
      headers: { apikey: supabaseKey, Authorization: 'Bearer ' + token },
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    });
    if (!profileResponse.ok) throw new Error('Learner profile unavailable');
    const [profile] = await profileResponse.json();
    if (!profile?.full_name?.trim()) return new Response(null, { status: 422, headers: privateHeaders });
    return new Response(null, { status: 204, headers: { ...privateHeaders, 'Set-Cookie': cookie(token, 3600) } });
  } catch {
    return new Response(null, { status: 503, headers: privateHeaders });
  }
}

export async function coursePage(request, url) {
  const page = pages.get(url.pathname);
  if (!page) return null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { ...privateHeaders, Allow: 'GET, HEAD' } });
  }
  const token = request.headers.get('Cookie')?.match(/(?:^|;\s*)__Host-awwal-course-session=([^;]+)/)?.[1];
  try {
    if (await authenticatedLearner(token)) {
      return new Response(request.method === 'HEAD' ? null : page, {
        headers: { ...privateHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  } catch {
    return new Response(request.method === 'HEAD' ? null : 'Course sign-in is temporarily unavailable. Please try again shortly.', {
      status: 503, headers: privateHeaders,
    });
  }
  const login = new URL('/my-courses', url);
  login.searchParams.set('next', url.pathname + url.search);
  return new Response(null, { status: 302, headers: { ...privateHeaders, Location: login.href } });
}
