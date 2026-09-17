import type { AcademyAssessment } from './academyAssessmentDomain.js';

export const ACADEMY_READINESS_EXAM_SCHEMA = 'hlabi.academy.readiness-examination.v1';
export const ACADEMY_READINESS_EXAM_VERSION = '2026-09-17';

export interface AcademyReadinessExamSection {
  id: string;
  title: string;
  competencyIds: string[];
  assessmentKinds: Array<'KNOWLEDGE' | 'SIMULATION' | 'REVIEWED_EVIDENCE'>;
  minimumPoints: number;
}

export const ACADEMY_READINESS_EXAM = {
  schema: ACADEMY_READINESS_EXAM_SCHEMA,
  version: ACADEMY_READINESS_EXAM_VERSION,
  title: 'Hlabi Property Professional Readiness Examination',
  durationMinutes: 180,
  passingScore: 70,
  sections: [
    { id: 'SECTION-A', title: 'Regulatory and Professional Foundations', competencyIds: ['LEG-01', 'ETH-01', 'CON-01', 'COM-01', 'FID-01'], assessmentKinds: ['KNOWLEDGE', 'SIMULATION'], minimumPoints: 30 },
    { id: 'SECTION-B', title: 'Applied Property Practice', competencyIds: ['APP-01', 'JUD-01', 'CON-01', 'COM-01'], assessmentKinds: ['SIMULATION', 'REVIEWED_EVIDENCE'], minimumPoints: 30 },
    { id: 'SECTION-C', title: 'Integrated Case Analysis', competencyIds: ['LEG-01', 'ETH-01', 'CON-01', 'COM-01', 'FID-01', 'APP-01', 'JUD-01'], assessmentKinds: ['SIMULATION'], minimumPoints: 40 }
  ] satisfies AcademyReadinessExamSection[],
  rules: [
    'The examination must be completed within the published time limit once started.',
    'Questions and answer keys are versioned server-side; correct answers are never returned to learners.',
    'Applied responses require authorised human review before a final result is issued.',
    'A failed attempt may be retaken only under the published retry rules and after the learner receives diagnostic feedback.',
    'The internal result is preparation evidence only and does not confer a statutory qualification, designation, registration or regulatory approval.'
  ],
  integrity: [
    'Record start and submission timestamps.',
    'Persist the exam version with every attempt.',
    'Prevent submission after the time limit.',
    'Prevent modification after submission.',
    'Keep reviewer decisions and feedback in the audit trail.'
  ]
} as const;

export function readinessExamAssessments(assessments: AcademyAssessment[]) {
  return assessments.filter(a => a.moduleIndex >= 0);
}
