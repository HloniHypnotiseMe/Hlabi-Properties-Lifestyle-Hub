import type { AcademyAssessment, AcademyAssessmentAttempt } from './academyAssessmentDomain.js';
import { ACADEMY_READINESS_BLUEPRINT } from './academyReadiness.js';

export type AcademyCompetencyStatus = 'NOT_STARTED' | 'LEARNING' | 'EVIDENCE_PENDING' | 'DEMONSTRATED';

export interface AcademyCompetencyReadiness {
  id: string;
  domain: string;
  title: string;
  status: AcademyCompetencyStatus;
  coverage: number;
  supportingModules: number[];
  evidence: { assessmentAttempts: number; passedAttempts: number; reviewedAttempts: number };
}

export function buildAcademyReadinessDiagnostic(completedModules:number, assessments:AcademyAssessment[], attempts:AcademyAssessmentAttempt[]) {
  const competencies = ACADEMY_READINESS_BLUEPRINT.competencies.map(c => {
    const mappings = ACADEMY_READINESS_BLUEPRINT.moduleMapping.filter(m => m.competencies.includes(c.id));
    const moduleIndexes = mappings.map(m => m.moduleIndex);
    const relevantAssessments = assessments.filter(a => moduleIndexes.includes(a.moduleIndex));
    const relevantAttempts = attempts.filter(a => relevantAssessments.some(x => x.id === a.assessmentId));
    const passedAttempts = relevantAttempts.filter(a => a.status === 'PASSED');
    const reviewedAttempts = relevantAttempts.filter(a => a.status === 'PASSED' || a.status === 'FAILED');
    const completedRelevantModules = moduleIndexes.filter(i => i < completedModules).length;
    const coverage = moduleIndexes.length ? Math.round(completedRelevantModules / moduleIndexes.length * 100) : 0;
    const hasPending = relevantAttempts.some(a => a.status === 'NEEDS_REVIEW' || a.status === 'SUBMITTED');
    const demonstrated = passedAttempts.length > 0 && coverage >= 50;
    const status: AcademyCompetencyStatus = demonstrated ? 'DEMONSTRATED' : hasPending ? 'EVIDENCE_PENDING' : completedRelevantModules > 0 ? 'LEARNING' : 'NOT_STARTED';
    return { id:c.id, domain:c.domain, title:c.title, status, coverage, supportingModules:moduleIndexes, evidence:{assessmentAttempts:relevantAttempts.length,passedAttempts:passedAttempts.length,reviewedAttempts:reviewedAttempts.length} };
  });
  const demonstrated = competencies.filter(c => c.status === 'DEMONSTRATED').length;
  const pending = competencies.filter(c => c.status === 'EVIDENCE_PENDING').length;
  const overallCoverage = Math.round(competencies.reduce((sum,c) => sum + c.coverage, 0) / Math.max(1, competencies.length));
  const nextActions = competencies.filter(c => c.status !== 'DEMONSTRATED').slice(0,3).map(c => c.status === 'EVIDENCE_PENDING' ? `Await reviewer evidence for ${c.title}` : `Complete learning and evidence for ${c.title}`);
  return {
    schema:'hlabi.academy.readiness-diagnostic.v1',
    blueprintVersion:ACADEMY_READINESS_BLUEPRINT.version,
    overallCoverage,
    competencyCount:competencies.length,
    demonstratedCount:demonstrated,
    pendingCount:pending,
    competencies,
    nextActions,
    disclaimer:'This diagnostic measures Hlabi curriculum coverage and internal evidence. It is not a prediction of, guarantee of, or substitute for any statutory examination, qualification, designation, registration or regulatory decision.'
  };
}
