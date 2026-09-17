import type { AcademyAssessmentAttempt } from './academyAssessmentDomain.js';
import type { AcademyEnrollment, AcademyCourse } from './academyDomain.js';

export const ACADEMY_EVIDENCE_SCHEMA = 'hlabi.academy.evidence-package.v1';

export function buildAcademyEvidencePackage(enrollment:AcademyEnrollment,course:AcademyCourse,attempts:AcademyAssessmentAttempt[]){
 const reviewed=attempts.filter(a=>a.status==='PASSED'||a.status==='FAILED');
 const pending=attempts.filter(a=>a.status==='NEEDS_REVIEW'||a.status==='SUBMITTED');
 const packageReady=enrollment.status==='COMPLETED'&&pending.length===0;
 return {schema:ACADEMY_EVIDENCE_SCHEMA,generatedAt:new Date().toISOString(),packageReady,enrollment:{id:enrollment.id,courseId:enrollment.courseId,status:enrollment.status,progressPercent:enrollment.progressPercent,completedModules:enrollment.completedModules},course:{id:course.id,title:course.title,modules:course.modules},assessmentSummary:{attemptCount:attempts.length,reviewedCount:reviewed.length,pendingCount:pending.length,passedCount:attempts.filter(a=>a.status==='PASSED').length,failedCount:attempts.filter(a=>a.status==='FAILED').length},attempts:attempts.map(({userId,...a})=>a),disclaimer:'This evidence package records learning activity and reviewer outcomes. It does not itself confer a professional designation, qualification, registration or regulatory approval.'};
}
