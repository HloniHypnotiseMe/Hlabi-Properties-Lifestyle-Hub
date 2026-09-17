import type { AiProviderAdapter } from './aiProvider.js';
import type { AcademyRepository } from './academyRepository.js';

export interface AcademyTutorRequest {
  userId: string;
  enrollmentId: string;
  moduleIndex: number;
  question: string;
}

export async function generateAcademyTutorResponse(
  input: AcademyTutorRequest,
  academyRepository: AcademyRepository,
  aiProvider: AiProviderAdapter,
  model: string,
) {
  const enrollment = await academyRepository.getEnrollment(input.enrollmentId, input.userId);
  if (!enrollment) throw new Error('ENROLLMENT_NOT_FOUND');
  const course = await academyRepository.getCourse(enrollment.courseId);
  if (!course || input.moduleIndex < 0 || input.moduleIndex >= course.modules.length) throw new Error('MODULE_NOT_FOUND');
  if (!input.question.trim()) throw new Error('QUESTION_REQUIRED');

  const result = await aiProvider.generate({
    provider: 'OLLAMA',
    model,
    temperature: 0.2,
    maxTokens: 700,
    system: 'You are the Hlabi Academy tutor. Teach property-professional fundamentals clearly and conservatively. Do not claim that Academy completion grants a legal qualification, registration, licence, designation or regulatory approval. When a question depends on current South African law, regulation, professional rules or an external qualification provider, say that the learner should verify the current authoritative source. Never invent legislation, accreditation, exam results or employment promises.',
    prompt: `Course: ${course.title}\nModule ${input.moduleIndex + 1}: ${course.modules[input.moduleIndex]}\nLearner question: ${input.question.trim()}\nProvide a concise teaching response, one practical example, and one question to check understanding.`,
  });
  return { enrollment, course, moduleIndex: input.moduleIndex, answer: result.text, provider: result.provider, model: result.model };
}
