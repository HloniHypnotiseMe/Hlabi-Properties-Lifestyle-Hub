import { randomUUID } from 'node:crypto';

export type ReadinessExamAttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'PASSED' | 'FAILED' | 'NEEDS_REVIEW';

export interface AcademyReadinessExamAttempt {
  id: string;
  enrollmentId: string;
  userId: string;
  examVersion: string;
  status: ReadinessExamAttemptStatus;
  answers: Record<string, string>;
  score: number | null;
  maxScore: number;
  startedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewerId?: string;
  feedback?: string;
}

export interface AcademyReadinessExamRepository {
  create(input: Omit<AcademyReadinessExamAttempt, 'id' | 'startedAt' | 'submittedAt' | 'reviewedAt'>): Promise<AcademyReadinessExamAttempt>;
  get(id: string, userId: string): Promise<AcademyReadinessExamAttempt | null>;
  list(enrollmentId: string, userId: string): Promise<AcademyReadinessExamAttempt[]>;
  submit(id: string, userId: string, answers: Record<string, string>, score: number | null, status: ReadinessExamAttemptStatus): Promise<AcademyReadinessExamAttempt | null>;
  review(id: string, reviewerId: string, score: number, status: 'PASSED' | 'FAILED', feedback: string): Promise<AcademyReadinessExamAttempt | null>;
}

export class MemoryAcademyReadinessExamRepository implements AcademyReadinessExamRepository {
  private attempts = new Map<string, AcademyReadinessExamAttempt>();

  async create(input: Omit<AcademyReadinessExamAttempt, 'id' | 'startedAt' | 'submittedAt' | 'reviewedAt'>) {
    const attempt: AcademyReadinessExamAttempt = { ...input, id: randomUUID(), startedAt: new Date().toISOString(), submittedAt: null, reviewedAt: null };
    this.attempts.set(attempt.id, attempt);
    return attempt;
  }

  async get(id: string, userId: string) {
    const attempt = this.attempts.get(id);
    return attempt?.userId === userId ? attempt : null;
  }

  async list(enrollmentId: string, userId: string) {
    return [...this.attempts.values()].filter(a => a.enrollmentId === enrollmentId && a.userId === userId).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  async submit(id: string, userId: string, answers: Record<string, string>, score: number | null, status: ReadinessExamAttemptStatus) {
    const attempt = this.attempts.get(id);
    if (!attempt || attempt.userId !== userId || attempt.status !== 'IN_PROGRESS') return null;
    const updated = { ...attempt, answers, score, status, submittedAt: new Date().toISOString() };
    this.attempts.set(id, updated);
    return updated;
  }

  async review(id: string, reviewerId: string, score: number, status: 'PASSED' | 'FAILED', feedback: string) {
    const attempt = this.attempts.get(id);
    if (!attempt || attempt.status !== 'NEEDS_REVIEW') return null;
    const updated = { ...attempt, reviewerId, score, status, feedback, reviewedAt: new Date().toISOString() };
    this.attempts.set(id, updated);
    return updated;
  }
}
