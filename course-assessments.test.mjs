import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assessments } from './course-assessment-data.mjs';
import { assessmentResponse, summarizeAssessments } from './course-assessments.mjs';

// A small D1 contract double: production SQL is also validated with SQLite.
export class Database {
  passes = new Map(); certificates = new Map();
  prepare(sql) {
    let args = []; const db = this;
    return {
      bind(...values) { args = values; return this; },
      async run() {
        if (sql.includes('INSERT INTO course_assessments')) {
          const [user, id, version, score, passed, time] = args;
          const key = `${user}:${id}:${version}`, old = db.passes.get(key);
          db.passes.set(key, { user, assessment_id: id, version, score: Math.max(old?.score || 0, score), passed: Math.max(old?.passed || 0, passed), time });
        } else if (sql.includes('INSERT INTO course_certificates')) {
          const [user, level, id, full_name, tracks, issued_at] = args;
          const key = `${user}:${level}`, old = db.certificates.get(key);
          db.certificates.set(key, old ? { ...old, tracks } : { user, level, id, full_name, tracks, issued_at });
        }
      },
      async all() { return { results: [...db.passes.values()].filter(r => r.user === args[0] && r.version === args[1]) }; },
      async first() { return db.certificates.get(`${args[0]}:${args[1]}`); },
    };
  }
}

export async function runTests() {
  const html = await readFile(new URL('./video-editing-course.html', import.meta.url), 'utf8');
  const lessonIds = [...html.matchAll(/<article class="lesson" id="([^"]+)" data-track="([^"]+)"/g)];
  assert.equal(lessonIds.length, 78);
  const covered = assessments.flatMap(a => a.lessons);
  assert.equal(new Set(covered).size, lessonIds.length);
  for (const lesson of lessonIds) assert(covered.includes(lesson[1]), `Missing quiz for ${lesson[1]}`);
  for (const a of assessments) {
    assert.equal(a.questions.length, 3);
    for (const q of a.questions) {
      assert.equal(q.options.length, new Set(q.options).size);
      assert(q.options[q.answer]);
    }
  }
  assert.equal(summarizeAssessments([]).eligible.length, 0);
  const rows = track => assessments.filter(a => a.track === track).map(a => ({ assessment_id: a.id, passed: 1, score: 100 }));
  assert.equal(summarizeAssessments(rows('fcp')).eligible.length, 0, 'General prerequisites are required');
  const fcpRows = [...rows('general'), ...rows('fcp')];
  assert.deepEqual(summarizeAssessments(fcpRows).eligible.at(-1), { level: 3, tracks: ['fcp'] });
  assert.deepEqual(summarizeAssessments([...fcpRows, ...rows('resolve')]).eligible.at(-1), { level: 3, tracks: ['fcp', 'resolve'] });
  const lowerResolve = rows('resolve').filter(r => assessments.find(a => a.id === r.assessment_id).level === 1);
  const partial = summarizeAssessments([...fcpRows, ...lowerResolve]);
  assert.deepEqual(partial.eligible[0].tracks, ['fcp', 'resolve']);
  assert.deepEqual(partial.eligible.at(-1).tracks, ['fcp']);
  const db = new Database(), user = { id: 'learner-1' }, learner = { full_name: 'Registered Learner' };
  const invoke = async (body, who = user) => {
    const request = new Request('https://test.invalid/api/course-assessments', body ? { method: 'POST', body: JSON.stringify(body) } : {});
    const response = await assessmentResponse(request, db, who, learner, req => req.json(), (data, status = 200) => Response.json(data, { status }));
    return { status: response.status, data: await response.json() };
  };
  const initial = await invoke();
  assert(!JSON.stringify(initial.data.assessments).includes('"answer":'), 'Answer keys must not leave the server');
  assert.equal((await invoke({ action: 'certificate', level: 3, name: 'Forged', tracks: ['fcp'] })).status, 403);
  const first = assessments[0];
  assert.equal((await invoke({ id: first.id, answers: [] })).status, 422);
  let attempt = await invoke({ id: first.id, answers: first.questions.map(q => q.options[1]) });
  assert.equal(attempt.data.result.passed, false);
  assert.equal(Object.keys(attempt.data.done).length, 0);
  attempt = await invoke({ id: first.id, answers: first.questions.map(q => q.options[q.answer]) });
  assert.equal(attempt.data.result.passed, true);
  assert(first.lessons.every(id => attempt.data.done[id]));
  await invoke({ id: first.id, answers: first.questions.map(q => q.options[1]) });
  assert.equal((await invoke()).data.scores[first.id].passed, true, 'A later retry must retain a pass');
  for (const a of assessments.filter(a => ['general', 'fcp'].includes(a.track))) await invoke({ id: a.id, answers: a.questions.map(q => q.options[q.answer]) });
  const cert1 = (await invoke({ action: 'certificate', level: 3, name: 'Forged', tracks: ['resolve'] })).data.certificate;
  assert.equal(cert1.name, learner.full_name);
  assert.equal(JSON.stringify(cert1.tracks), '["fcp"]');
  assert.equal((await invoke(null, { id: 'learner-2' })).data.eligible.length, 0, 'Passes must be isolated by learner');
  for (const a of assessments.filter(a => a.track === 'resolve')) await invoke({ id: a.id, answers: a.questions.map(q => q.options[q.answer]) });
  const cert2 = (await invoke({ action: 'certificate', level: 3 })).data.certificate;
  assert.equal(cert2.id, cert1.id, 'Second track belongs on the same level certificate');
  assert.equal(JSON.stringify(cert2.tracks), '["fcp","resolve"]');
  assert.equal(cert2.date, cert1.date);
  return 'Passed: 78 lessons covered, 99 quiz questions, grading, prerequisites, partial tracks, name lock, learner isolation and combined certificate persistence.';
}
