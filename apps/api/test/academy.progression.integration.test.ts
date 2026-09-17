import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { registerAcademyRoutes } from '../src/academyRoutes.js';
import { registerAcademyReadinessExamRoutes } from '../src/academyReadinessExamRoutes.js';
import { MemoryAcademyRepository } from '../src/academyRepository.js';
import { MemoryAcademyAssessmentRepository } from '../src/academyAssessmentRepository.js';
import { MemoryAcademyReadinessExamRepository } from '../src/academyReadinessExamRepository.js';
import { ACADEMY_LESSONS } from '../src/academyLessonDomain.js';
import { ACADEMY_READINESS_EXAM_QUESTIONS } from '../src/academyReadinessExamQuestionBank.js';
import type { RequestHandler } from 'express';

const USER='academy-test-user';
const COURSE='hlabi-property-professional-foundation';

function appFor(academy:MemoryAcademyRepository, assessments:MemoryAcademyAssessmentRepository, exams:MemoryAcademyReadinessExamRepository){
  const app=express(); app.use(express.json());
  const auth:RequestHandler=(_req,res,next)=>{res.locals.principal={userId:USER,role:'AGENT'};next();};
  registerAcademyRoutes(app,auth,academy,assessments);
  registerAcademyReadinessExamRoutes(app,auth,academy,exams);
  return app;
}

async function enrolled(){
  const academy=new MemoryAcademyRepository(); const assessments=new MemoryAcademyAssessmentRepository(); const exams=new MemoryAcademyReadinessExamRepository();
  const enrollment=await academy.enroll({userId:USER,courseId:COURSE});
  const server=appFor(academy,assessments,exams).listen(0);
  await new Promise<void>(resolve=>server.once('listening',resolve));
  const address=server.address(); const port=typeof address==='object'&&address?address.port:0;
  return {academy,assessments,exams,enrollment,base:`http://127.0.0.1:${port}`,server};
}

const post=(base:string,path:string,body:unknown)=>fetch(`${base}${path}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});

test('progression requires lesson content and a passed assessment',async()=>{
  const {academy,assessments,enrollment,base,server}=await enrolled();
  try {
    let r=await post(base,`/api/v1/academy/enrollments/${enrollment.id}/progress`,{moduleIndex:0,eventType:'COMPLETE',payload:{}});
    assert.equal(r.status,409); assert.equal((await r.json()).error,'LEARNING_CONTENT_REQUIRED');
    await academy.recordLessonActivity({enrollmentId:enrollment.id,userId:USER,lessonId:ACADEMY_LESSONS[0].id,moduleIndex:0,assetId:ACADEMY_LESSONS[0].assets[0].id,assetKind:'TEXT',eventType:'COMPLETED'});
    r=await post(base,`/api/v1/academy/enrollments/${enrollment.id}/progress`,{moduleIndex:0,eventType:'COMPLETE',payload:{}});
    assert.equal(r.status,409); assert.equal((await r.json()).error,'ASSESSMENT_PASS_REQUIRED');
    await assessments.createAttempt({assessmentId:'module-0-knowledge',enrollmentId:enrollment.id,userId:USER,answers:{q1:'Person acquiring the property',q2:'A contemporaneous client record'},score:100,maxScore:20,status:'PASSED'});
    r=await post(base,`/api/v1/academy/enrollments/${enrollment.id}/progress`,{moduleIndex:0,eventType:'COMPLETE',payload:{}});
    assert.equal(r.status,201); assert.equal((await r.json()).enrollment.completedModules,1);
    r=await fetch(`${base}/api/v1/academy/enrollments/${enrollment.id}/lessons/1`);
    assert.equal(r.status,200); assert.equal((await r.json()).moduleIndex,1);
  } finally { server.close(); }
});

test('failed assessment does not unlock next module, but a later passed retry does',async()=>{
  const {academy,assessments,enrollment,base,server}=await enrolled();
  try {
    await academy.recordLessonActivity({enrollmentId:enrollment.id,userId:USER,lessonId:ACADEMY_LESSONS[0].id,moduleIndex:0,assetId:ACADEMY_LESSONS[0].assets[0].id,assetKind:'TEXT',eventType:'COMPLETED'});
    await assessments.createAttempt({assessmentId:'module-0-knowledge',enrollmentId:enrollment.id,userId:USER,answers:{q1:'wrong',q2:'wrong'},score:0,maxScore:20,status:'FAILED'});
    let r=await post(base,`/api/v1/academy/enrollments/${enrollment.id}/progress`,{moduleIndex:0,eventType:'COMPLETE',payload:{}});
    assert.equal(r.status,409); assert.equal((await r.json()).error,'ASSESSMENT_PASS_REQUIRED');
    await assessments.createAttempt({assessmentId:'module-0-knowledge',enrollmentId:enrollment.id,userId:USER,answers:{q1:'Person acquiring the property',q2:'A contemporaneous client record'},score:100,maxScore:20,status:'PASSED'});
    r=await post(base,`/api/v1/academy/enrollments/${enrollment.id}/progress`,{moduleIndex:0,eventType:'COMPLETE',payload:{}});
    assert.equal(r.status,201);
  } finally { server.close(); }
});

test('readiness examination is locked until all six modules are completed',async()=>{
  const {academy,enrollment,base,server}=await enrolled();
  try {
    let r=await post(base,`/api/v1/academy/enrollments/${enrollment.id}/readiness-exam/start`,{});
    assert.equal(r.status,409); assert.equal((await r.json()).error,'FOUNDATION_COMPLETION_REQUIRED');
    await academy.updateEnrollment(enrollment.id,USER,'COMPLETED',100,6,true);
    r=await post(base,`/api/v1/academy/enrollments/${enrollment.id}/readiness-exam/start`,{});
    assert.equal(r.status,201); const body=await r.json();
    assert.equal(body.questions.length,ACADEMY_READINESS_EXAM_QUESTIONS.length);
    assert.ok(body.questions.every((q:any)=>!('correctAnswer' in q)));
  } finally { server.close(); }
});

test('readiness submission requires every question and is sent for human review',async()=>{
  const {academy,exams,enrollment,base,server}=await enrolled();
  try {
    await academy.updateEnrollment(enrollment.id,USER,'COMPLETED',100,6,true);
    let r=await post(base,`/api/v1/academy/enrollments/${enrollment.id}/readiness-exam/start`,{}); const started=await r.json();
    r=await post(base,`/api/v1/academy/enrollments/${enrollment.id}/readiness-exam/${started.attempt.id}/submit`,{answers:{}});
    assert.equal(r.status,400);
    const answers=Object.fromEntries(ACADEMY_READINESS_EXAM_QUESTIONS.map(q=>[q.id,q.options?.[0]??'Applied response documented for review.']));
    r=await post(base,`/api/v1/academy/enrollments/${enrollment.id}/readiness-exam/${started.attempt.id}/submit`,{answers});
    assert.equal(r.status,200); const submitted=await r.json(); assert.equal(submitted.attempt.status,'NEEDS_REVIEW'); assert.equal((await exams.listPendingReview()).length,1);
  } finally { server.close(); }
});

test('readiness submission rejects an expired attempt',async()=>{
  const {academy,exams,enrollment,base,server}=await enrolled();
  try {
    await academy.updateEnrollment(enrollment.id,USER,'COMPLETED',100,6,true);
    const attempt=await exams.create({enrollmentId:enrollment.id,userId:USER,examVersion:'2026-09-17',status:'IN_PROGRESS',answers:{},score:null,maxScore:100});
    const stored=(exams as any).attempts as Map<string,any>; stored.set(attempt.id,{...attempt,startedAt:new Date(Date.now()-181*60*1000).toISOString()});
    const answers=Object.fromEntries(ACADEMY_READINESS_EXAM_QUESTIONS.map(q=>[q.id,'response']));
    const r=await post(base,`/api/v1/academy/enrollments/${enrollment.id}/readiness-exam/${attempt.id}/submit`,{answers});
    assert.equal(r.status,409); assert.equal((await r.json()).error,'EXAM_TIME_EXPIRED');
  } finally { server.close(); }
});
