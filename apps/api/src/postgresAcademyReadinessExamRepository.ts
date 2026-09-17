import type { Pool } from 'pg';
import type { AcademyReadinessExamAttempt, AcademyReadinessExamRepository, ReadinessExamAttemptStatus } from './academyReadinessExamRepository.js';

const map=(r:any):AcademyReadinessExamAttempt=>({id:r.id,enrollmentId:r.enrollment_id,userId:r.user_id,examVersion:r.exam_version,status:r.status,answers:r.answers??{},score:r.score===null?null:Number(r.score),maxScore:r.max_score,startedAt:r.started_at.toISOString(),submittedAt:r.submitted_at?.toISOString()??null,reviewedAt:r.reviewed_at?.toISOString()??null,reviewerId:r.reviewer_id??undefined,feedback:r.feedback??undefined});

export class PostgresAcademyReadinessExamRepository implements AcademyReadinessExamRepository {
  constructor(private readonly pool:Pool){}
  async create(input:Omit<AcademyReadinessExamAttempt,'id'|'startedAt'|'submittedAt'|'reviewedAt'>){const {rows}=await this.pool.query('INSERT INTO academy_readiness_exam_attempts(id,enrollment_id,user_id,exam_version,status,answers,score,max_score) VALUES(gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7) RETURNING *',[input.enrollmentId,input.userId,input.examVersion,input.status,input.answers,input.score,input.maxScore]);return map(rows[0]);}
  async get(id:string,userId:string){const {rows}=await this.pool.query('SELECT * FROM academy_readiness_exam_attempts WHERE id=$1 AND user_id=$2',[id,userId]);return rows[0]?map(rows[0]):null;}
  async list(enrollmentId:string,userId:string){const {rows}=await this.pool.query('SELECT * FROM academy_readiness_exam_attempts WHERE enrollment_id=$1 AND user_id=$2 ORDER BY started_at DESC',[enrollmentId,userId]);return rows.map(map);}
  async listPendingReview(){const {rows}=await this.pool.query("SELECT * FROM academy_readiness_exam_attempts WHERE status='NEEDS_REVIEW' ORDER BY started_at ASC");return rows.map(map);}
  async submit(id:string,userId:string,answers:Record<string,string>,score:number|null,status:ReadinessExamAttemptStatus){const {rows}=await this.pool.query("UPDATE academy_readiness_exam_attempts SET answers=$3,score=$4,status=$5,submitted_at=NOW() WHERE id=$1 AND user_id=$2 AND status='IN_PROGRESS' RETURNING *",[id,userId,answers,score,status]);return rows[0]?map(rows[0]):null;}
  async review(id:string,reviewerId:string,score:number,status:'PASSED'|'FAILED',feedback:string){const {rows}=await this.pool.query("UPDATE academy_readiness_exam_attempts SET reviewer_id=$2,score=$3,status=$4,feedback=$5,reviewed_at=NOW() WHERE id=$1 AND status='NEEDS_REVIEW' RETURNING *",[id,reviewerId,score,status,feedback]);return rows[0]?map(rows[0]):null;}
}
