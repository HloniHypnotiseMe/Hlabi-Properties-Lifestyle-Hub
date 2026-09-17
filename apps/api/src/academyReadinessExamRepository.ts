import { randomUUID } from 'node:crypto';

export type ReadinessExamAttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'PASSED' | 'FAILED' | 'NEEDS_REVIEW';

export interface AcademyReadinessExamAttempt {
  id:string; enrollmentId:string; userId:string; examVersion:string; status:ReadinessExamAttemptStatus; answers:Record<string,string>; score:number|null; maxScore:number; startedAt:string; submittedAt:string|null; reviewedAt:string|null; reviewerId?:string; feedback?:string;
}
export interface AcademyReadinessExamRepository {
 create(input:Omit<AcademyReadinessExamAttempt,'id'|'startedAt'|'submittedAt'|'reviewedAt'>):Promise<AcademyReadinessExamAttempt>;
 get(id:string,userId:string):Promise<AcademyReadinessExamAttempt|null>;
 list(enrollmentId:string,userId:string):Promise<AcademyReadinessExamAttempt[]>;
 listPendingReview():Promise<AcademyReadinessExamAttempt[]>;
 submit(id:string,userId:string,answers:Record<string,string>,score:number|null,status:ReadinessExamAttemptStatus):Promise<AcademyReadinessExamAttempt|null>;
 review(id:string,reviewerId:string,score:number,status:'PASSED'|'FAILED',feedback:string):Promise<AcademyReadinessExamAttempt|null>;
}
export class MemoryAcademyReadinessExamRepository implements AcademyReadinessExamRepository {
 private attempts=new Map<string,AcademyReadinessExamAttempt>();
 async create(input:Omit<AcademyReadinessExamAttempt,'id'|'startedAt'|'submittedAt'|'reviewedAt'>){const a={...input,id:randomUUID(),startedAt:new Date().toISOString(),submittedAt:null,reviewedAt:null};this.attempts.set(a.id,a);return a;}
 async get(id:string,userId:string){const a=this.attempts.get(id);return a?.userId===userId?a:null;}
 async list(enrollmentId:string,userId:string){return [...this.attempts.values()].filter(a=>a.enrollmentId===enrollmentId&&a.userId===userId).sort((a,b)=>b.startedAt.localeCompare(a.startedAt));}
 async listPendingReview(){return [...this.attempts.values()].filter(a=>a.status==='NEEDS_REVIEW').sort((a,b)=>a.startedAt.localeCompare(b.startedAt));}
 async submit(id:string,userId:string,answers:Record<string,string>,score:number|null,status:ReadinessExamAttemptStatus){const a=this.attempts.get(id);if(!a||a.userId!==userId||a.status!=='IN_PROGRESS')return null;const u={...a,answers,score,status,submittedAt:new Date().toISOString()};this.attempts.set(id,u);return u;}
 async review(id:string,reviewerId:string,score:number,status:'PASSED'|'FAILED',feedback:string){const a=this.attempts.get(id);if(!a||a.status!=='NEEDS_REVIEW')return null;const u={...a,reviewerId,score,status,feedback,reviewedAt:new Date().toISOString()};this.attempts.set(id,u);return u;}
}
