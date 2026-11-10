// Module quizzes for the courses that are not track-based (CapCut, Design with AI, Video Editing with Claude).
// Questions come from the server-only bank; answers are marked here so no answer key reaches the browser.
// Passes are stored beside the video-editing assessments, under ids prefixed with the course key.
import { quizzes } from './course-quiz-data.mjs';
import { ensureAssessments } from './course-assessments.mjs';

const version = 1;

export function gradeQuiz(quiz, answers) {
  if (!quiz || !Array.isArray(answers) || answers.length !== quiz.questions.length
    || !answers.every((answer, i) => typeof answer === 'string' && quiz.questions[i].options.includes(answer))) return null;
  const wrong = quiz.questions.flatMap((q, i) => answers[i] === q.options[q.answer] ? [] : [i]);
  const total = quiz.questions.length, correct = total - wrong.length;
  return { correct, total, need: quiz.need, score: Math.round(correct / total * 100), passed: correct >= quiz.need, wrong };
}

function publicQuiz(id, quiz) {
  return { id, need: quiz.need, questions: quiz.questions.map(q => {
    const options = [...q.options];
    for (let i = options.length - 1; i > 0; i--) {
      const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { prompt: q.prompt, options };
  }) };
}

export const courseQuizIds = course => Object.keys(quizzes).filter(id => quizzes[id].course === course);

export async function quizResponse(request, url, db, user, readJson, json) {
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405);
  const course = url.searchParams.get('course') || '';
  const ids = courseQuizIds(course);
  if (!ids.length) return json({ error: 'This course has no module quizzes.' }, 404);
  const local = id => id.slice(course.length + 1);
  await ensureAssessments(db);
  let result;
  if (request.method === 'POST') {
    let input;
    try { input = await readJson(request); } catch { return json({ error: 'Invalid quiz submission.' }, 400); }
    const id = course + ':' + (typeof input?.id === 'string' ? input.id : '');
    const graded = gradeQuiz(ids.includes(id) ? quizzes[id] : null, input?.answers);
    if (!graded) return json({ error: 'Answer every question before submitting.' }, 422);
    await db.prepare(`INSERT INTO course_assessments (user_id, assessment_id, version, score, passed, updated_at)
      VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, assessment_id, version) DO UPDATE SET
      score = MAX(course_assessments.score, excluded.score), passed = MAX(course_assessments.passed, excluded.passed), updated_at = excluded.updated_at`)
      .bind(user.id, id, version, graded.score, graded.passed ? 1 : 0, new Date().toISOString()).run();
    result = { id: local(id), ...graded };
  }
  const { results } = await db.prepare('SELECT assessment_id, score, passed FROM course_assessments WHERE user_id = ? AND version = ?').bind(user.id, version).all();
  const passed = Object.fromEntries(results.filter(r => ids.includes(r.assessment_id) && r.passed === 1).map(r => [local(r.assessment_id), r.score]));
  return json({ quizzes: request.method === 'GET' ? ids.map(id => publicQuiz(local(id), quizzes[id])) : undefined, passed, result });
}
