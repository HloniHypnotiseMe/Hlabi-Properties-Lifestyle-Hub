import test from 'node:test';
import assert from 'node:assert/strict';
import { ACADEMY_LESSONS } from '../src/academyLessonDomain.js';
import { ACADEMY_READINESS_EXAM_QUESTIONS, READINESS_EXAM_MAX_SCORE, publicReadinessExamQuestion } from '../src/academyReadinessExamQuestionBank.js';
import { ACADEMY_READINESS_EXAM } from '../src/academyReadinessExam.js';

const expectedAssessmentIds = [
  'module-0-knowledge',
  'module-1-simulation',
  'module-2-knowledge',
  'module-3-simulation',
  'module-4-knowledge',
  'module-5-simulation',
];

test('Foundation has six sequential lessons with one assessment per module', () => {
  assert.equal(ACADEMY_LESSONS.length, 6);
  assert.deepEqual(ACADEMY_LESSONS.map(l => l.moduleIndex), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(ACADEMY_LESSONS.map(l => l.assessmentId), expectedAssessmentIds);
  for (const lesson of ACADEMY_LESSONS) {
    assert.ok(lesson.assets.some(a => a.kind === 'TEXT' && a.required), `${lesson.id} must require the authoritative text asset`);
  }
});

test('Readiness examination question bank is complete and totals 100 points', () => {
  assert.equal(ACADEMY_READINESS_EXAM_QUESTIONS.length, 11);
  assert.equal(READINESS_EXAM_MAX_SCORE, 100);
  assert.ok(ACADEMY_READINESS_EXAM_QUESTIONS.every(q => q.competencyIds.length > 0));
  assert.ok(ACADEMY_READINESS_EXAM_QUESTIONS.every(q => q.kind === 'SIMULATION' || q.correctAnswer));
});

test('Public readiness questions never expose answer keys', () => {
  for (const question of ACADEMY_READINESS_EXAM_QUESTIONS) {
    const safe = publicReadinessExamQuestion(question) as Record<string, unknown>;
    assert.equal('correctAnswer' in safe, false);
  }
});

test('Readiness exam policy is 180 minutes with a 70 percent pass mark', () => {
  assert.equal(ACADEMY_READINESS_EXAM.durationMinutes, 180);
  assert.equal(ACADEMY_READINESS_EXAM.passingScore, 70);
});
