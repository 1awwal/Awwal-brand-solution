import test from 'node:test';
import assert from 'node:assert/strict';
import { quizzes } from './course-quiz-data.mjs';
import { gradeQuiz, courseQuizIds, quizResponse } from './course-quizzes.mjs';

const json = (data, status = 200) => ({ status, data });

function fakeDb() {
  const rows = new Map();
  return {
    rows,
    prepare(sql) {
      let args = [];
      const statement = {
        bind(...values) { args = values; return statement; },
        async run() {
          if (sql.startsWith('INSERT INTO course_assessments')) {
            const [user, id, version, score, passed] = args, key = user + '|' + id + '|' + version, old = rows.get(key);
            rows.set(key, { user_id: user, assessment_id: id, score: Math.max(old?.score ?? 0, score), passed: Math.max(old?.passed ?? 0, passed) });
          }
          return {};
        },
        async all() { return { results: [...rows.values()].filter(r => r.user_id === args[0]) }; },
      };
      return statement;
    },
  };
}
const call = (db, method, course, body) => quizResponse({ method }, new URL('https://awwalbrands.com/api/course-quizzes?course=' + course), db, { id: 'u1' }, async () => body, json);

test('every course has six module quizzes with valid answer keys', () => {
  for (const course of ['capcut', 'ai-design', 'claude-video']) {
    const ids = courseQuizIds(course);
    assert.equal(ids.length, 6, course);
    for (const id of ids) {
      const quiz = quizzes[id];
      assert.equal(quiz.need, quiz.questions.length - 1);
      for (const q of quiz.questions) {
        assert.ok(q.options.length >= 3 && new Set(q.options).size === q.options.length, q.prompt);
        assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, q.prompt);
      }
    }
  }
});

test('marks answers and allows one mistake', () => {
  const quiz = quizzes['capcut:l1m1q'];
  const right = quiz.questions.map(q => q.options[q.answer]);
  assert.deepEqual(gradeQuiz(quiz, right).wrong, []);
  assert.equal(gradeQuiz(quiz, right).passed, true);
  const oneWrong = [...right]; oneWrong[0] = quiz.questions[0].options.find(o => o !== right[0]);
  assert.equal(gradeQuiz(quiz, oneWrong).passed, true);
  const twoWrong = [...oneWrong]; twoWrong[1] = quiz.questions[1].options.find(o => o !== right[1]);
  assert.deepEqual(gradeQuiz(quiz, twoWrong).wrong, [0, 1]);
  assert.equal(gradeQuiz(quiz, twoWrong).passed, false);
  assert.equal(gradeQuiz(quiz, right.slice(1)), null);
  assert.equal(gradeQuiz(quiz, right.map(() => 'not an option')), null);
});

test('GET hides answer keys; POST records a pass for that course only', async () => {
  const db = fakeDb();
  const first = await call(db, 'GET', 'capcut');
  assert.equal(first.data.quizzes.length, 6);
  assert.ok(first.data.quizzes.every(q => q.questions.every(question => !('answer' in question))));
  assert.deepEqual(first.data.passed, {});

  const quiz = quizzes['capcut:l1m1q'];
  const posted = await call(db, 'POST', 'capcut', { id: 'l1m1q', answers: quiz.questions.map(q => q.options[q.answer]) });
  assert.equal(posted.data.result.passed, true);
  assert.deepEqual(posted.data.passed, { l1m1q: 100 });
  assert.deepEqual((await call(db, 'GET', 'ai-design')).data.passed, {});

  assert.equal((await call(db, 'POST', 'capcut', { id: 'l1m1q', answers: [] })).status, 422);
  assert.equal((await call(db, 'POST', 'capcut', { id: 'module-1:general', answers: [] })).status, 422);
  assert.equal((await call(db, 'GET', 'photography')).status, 404);
});
