import { assessments } from './course-assessment-data.mjs';

export const trackLabels = { fcp: 'FCP', premiere: 'Premiere Pro', resolve: 'DaVinci Resolve' };
const version = 1;
const labels = { general: 'General editing', ...trackLabels };

export async function ensureAssessments(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS course_assessments (
    user_id TEXT NOT NULL, assessment_id TEXT NOT NULL, version INTEGER NOT NULL,
    score INTEGER NOT NULL, passed INTEGER NOT NULL, updated_at TEXT NOT NULL,
    PRIMARY KEY (user_id, assessment_id, version))`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS course_certificates (
    user_id TEXT NOT NULL, level INTEGER NOT NULL, id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL, tracks TEXT NOT NULL, issued_at TEXT NOT NULL,
    PRIMARY KEY (user_id, level))`).run();
}

export function summarizeAssessments(rows) {
  const scores = Object.fromEntries(rows.map(row => [row.assessment_id, row]));
  const passed = assessments.filter(a => scores[a.id]?.passed === 1);
  const done = Object.fromEntries(passed.flatMap(a => a.lessons.map(id => [id, 1])));
  const eligible = [];
  for (let level = 1; level <= 3; level++) {
    const general = assessments.filter(a => a.track === 'general' && a.level <= level);
    const generalPassed = general.every(a => scores[a.id]?.passed === 1);
    const tracks = Object.keys(trackLabels).filter(track => {
      const required = assessments.filter(a => a.track === track && a.level <= level);
      return generalPassed && required.length > 0 && required.every(a => scores[a.id]?.passed === 1);
    });
    if (tracks.length) eligible.push({ level, tracks });
  }
  return { done, eligible, scores: Object.fromEntries(rows.map(r => [r.assessment_id, { score: r.score, passed: r.passed === 1 }])) };
}

function publicAssessment(a) {
  return { id: a.id, module: a.module, level: a.level, track: a.track, title: a.title,
    label: labels[a.track], lessons: a.lessons,
    questions: a.questions.map(q => {
      const options = [...q.options];
      for (let i = options.length - 1; i > 0; i--) {
        const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
        [options[i], options[j]] = [options[j], options[i]];
      }
      return { prompt: q.prompt, options };
    }) };
}

export async function assessmentResponse(request, db, user, learner, readJson, json) {
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405);
  await ensureAssessments(db);
  let result;
  if (request.method === 'POST') {
    let input;
    try { input = await readJson(request); } catch { return json({ error: 'Invalid quiz submission.' }, 400); }
    if (input?.action === 'certificate') {
      const { results } = await db.prepare('SELECT assessment_id, score, passed FROM course_assessments WHERE user_id = ? AND version = ?').bind(user.id, version).all();
      const eligible = summarizeAssessments(results).eligible.find(e => e.level === input.level);
      if (!eligible) return json({ error: 'Pass the general modules and one software track through this level first.' }, 403);
      const now = new Date().toISOString();
      const id = 'AWB-VE' + eligible.level + '-' + crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase();
      const tracks = JSON.stringify(eligible.tracks);
      await db.prepare(`INSERT INTO course_certificates (user_id, level, id, full_name, tracks, issued_at)
        VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, level) DO UPDATE SET tracks = excluded.tracks`)
        .bind(user.id, eligible.level, id, learner.full_name, tracks, now).run();
      const cert = await db.prepare('SELECT id, level, full_name, tracks, issued_at FROM course_certificates WHERE user_id = ? AND level = ?').bind(user.id, eligible.level).first();
      return json({ certificate: { id: cert.id, level: cert.level, name: cert.full_name,
        tracks: JSON.parse(cert.tracks), date: new Date(cert.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) } });
    }
    const assessment = assessments.find(a => a.id === input?.id);
    if (!assessment || !Array.isArray(input.answers) || input.answers.length !== assessment.questions.length
      || !input.answers.every((answer, i) => typeof answer === 'string' && assessment.questions[i].options.includes(answer))) {
      return json({ error: 'Answer every question before submitting.' }, 422);
    }
    const correct = assessment.questions.filter((q, i) => input.answers[i] === q.options[q.answer]).length;
    const score = Math.round(correct / assessment.questions.length * 100);
    const passed = score >= 80;
    await db.prepare(`INSERT INTO course_assessments (user_id, assessment_id, version, score, passed, updated_at)
      VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, assessment_id, version) DO UPDATE SET
      score = MAX(course_assessments.score, excluded.score), passed = MAX(course_assessments.passed, excluded.passed), updated_at = excluded.updated_at`)
      .bind(user.id, assessment.id, version, score, passed ? 1 : 0, new Date().toISOString()).run();
    result = { score, passed, correct, total: assessment.questions.length,
      review: passed ? [] : assessment.questions.filter((q, i) => input.answers[i] !== q.options[q.answer]).map(q => q.prompt) };
  }
  const { results } = await db.prepare('SELECT assessment_id, score, passed FROM course_assessments WHERE user_id = ? AND version = ?').bind(user.id, version).all();
  const summaryOnly = request.method === 'GET' && new URL(request.url).searchParams.get('summary') === '1';
  return json({ name: learner.full_name,
    assessments: summaryOnly ? assessments.map(({ id, module, level, track, lessons }) => ({ id, module, level, track, lessons })) : assessments.map(publicAssessment),
    ...summarizeAssessments(results), result });
}
