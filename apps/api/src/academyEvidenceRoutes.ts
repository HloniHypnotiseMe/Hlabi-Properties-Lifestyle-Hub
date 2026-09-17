import type { Express, RequestHandler } from 'express';
import { authenticatedPrincipal } from './authentication.js';
import type { AcademyRepository } from './academyRepository.js';
import type { AcademyAssessmentRepository } from './academyAssessmentRepository.js';
import type { AcademyReadinessExamRepository } from './academyReadinessExamRepository.js';
import { buildAcademyEvidencePackage } from './academyEvidence.js';

export function registerAcademyEvidenceRoutes(app:Express,authenticated:RequestHandler,academyRepo:AcademyRepository,assessmentRepo:AcademyAssessmentRepository,readinessRepo:AcademyReadinessExamRepository){
  app.get('/api/v1/academy/enrollments/:enrollmentId/evidence',authenticated,async(req,res)=>{
    const p=authenticatedPrincipal(res);
    const enrollment=await academyRepo.getEnrollment(req.params.enrollmentId,p.userId);
    if(!enrollment)return res.status(404).json({error:'ENROLLMENT_NOT_FOUND'});
    const course=await academyRepo.getCourse(enrollment.courseId);
    if(!course)return res.status(404).json({error:'COURSE_NOT_FOUND'});
    const attempts=await assessmentRepo.listAttempts(enrollment.id,p.userId);
    const lessonActivities=await academyRepo.listLessonActivities(enrollment.id,p.userId);
    const readinessAttempts=await readinessRepo.list(enrollment.id,p.userId);
    const base=buildAcademyEvidencePackage(enrollment,course,attempts);
    const pendingReadiness=readinessAttempts.filter(a=>a.status==='IN_PROGRESS'||a.status==='NEEDS_REVIEW'||a.status==='SUBMITTED');
    const readinessReviewed=readinessAttempts.filter(a=>a.status==='PASSED'||a.status==='FAILED');
    return res.json({...base,learningActivity:{count:lessonActivities.length,events:lessonActivities},readinessExamination:{attemptCount:readinessAttempts.length,reviewedCount:readinessReviewed.length,pendingCount:pendingReadiness.length,passedCount:readinessAttempts.filter(a=>a.status==='PASSED').length,failedCount:readinessAttempts.filter(a=>a.status==='FAILED').length,attempts:readinessAttempts.map(({userId,...a})=>a)},packageReady:base.packageReady&&pendingReadiness.length===0,disclaimer:'This evidence package records learning activity, assessment outcomes and readiness-exam reviewer outcomes. It does not itself confer a professional designation, qualification, registration or regulatory approval.'});
  });
}
