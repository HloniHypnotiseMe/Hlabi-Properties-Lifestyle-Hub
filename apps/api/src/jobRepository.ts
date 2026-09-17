import type { Pool } from 'pg';
import type { JobEvidence, ServiceJob, ServiceJobStatus } from './jobDomain.js';

export interface JobRepository {
  createJobFromQuote(input: { quoteId: string; ownerId: string; details?: Record<string, unknown> }): Promise<ServiceJob | null>;
  getJobForOwner(jobId: string, ownerId: string): Promise<ServiceJob | null>;
  listJobsForOwner(ownerId: string, propertyId?: string): Promise<ServiceJob[]>;
  updateJobStatus(jobId: string, ownerId: string, status: ServiceJobStatus, scheduledFor?: string): Promise<ServiceJob | null>;
  addEvidence(input: Omit<JobEvidence, 'id' | 'createdAt'>): Promise<JobEvidence>;
  listEvidenceForOwner(jobId: string, ownerId: string): Promise<JobEvidence[]>;
}

const allowedTransitions: Record<ServiceJobStatus, ServiceJobStatus[]> = {
  REQUESTED: ['SCHEDULED', 'CANCELLED'], SCHEDULED: ['IN_PROGRESS', 'CANCELLED'], IN_PROGRESS: ['AWAITING_EVIDENCE', 'CANCELLED'], AWAITING_EVIDENCE: ['COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: [],
};
export function canTransitionJobStatus(from: ServiceJobStatus, to: ServiceJobStatus): boolean { return from === to || allowedTransitions[from].includes(to); }

export class MemoryJobRepository implements JobRepository {
  private readonly jobs = new Map<string, ServiceJob>(); private readonly evidence = new Map<string, JobEvidence>(); private readonly quotes = new Map<string, { id:string; ownerId:string; propertyId:string; supplierId:string; status:string }>();
  seedQuote(q:{id:string;ownerId:string;propertyId:string;supplierId:string;status?:string}) { this.quotes.set(q.id,{...q,status:q.status??'SUBMITTED'}); }
  async createJobFromQuote(input:{quoteId:string;ownerId:string;details?:Record<string,unknown>}) { const q=this.quotes.get(input.quoteId); if(!q||q.ownerId!==input.ownerId||q.status!=='SUBMITTED'||[...this.jobs.values()].some(j=>j.quoteId===input.quoteId)) return null; const now=new Date().toISOString(); const job:ServiceJob={id:`job-${crypto.randomUUID()}`,propertyId:q.propertyId,ownerId:q.ownerId,supplierId:q.supplierId,quoteId:q.id,status:'REQUESTED',details:input.details??{},createdAt:now,updatedAt:now}; q.status='ACCEPTED'; this.jobs.set(job.id,job); return job; }
  async getJobForOwner(jobId:string,ownerId:string){const j=this.jobs.get(jobId);return j?.ownerId===ownerId?j:null;}
  async listJobsForOwner(ownerId:string,propertyId?:string){return[...this.jobs.values()].filter(j=>j.ownerId===ownerId&&(!propertyId||j.propertyId===propertyId));}
  async updateJobStatus(jobId:string,ownerId:string,status:ServiceJobStatus,scheduledFor?:string){const j=await this.getJobForOwner(jobId,ownerId);if(!j||!canTransitionJobStatus(j.status,status))return null;const now=new Date().toISOString();const u={...j,status,scheduledFor:scheduledFor??j.scheduledFor,startedAt:status==='IN_PROGRESS'&&!j.startedAt?now:j.startedAt,completedAt:status==='COMPLETED'?now:j.completedAt,updatedAt:now};this.jobs.set(jobId,u);return u;}
  async addEvidence(input:Omit<JobEvidence,'id'|'createdAt'>){const e={...input,id:`evidence-${crypto.randomUUID()}`,createdAt:new Date().toISOString()};this.evidence.set(e.id,e);return e;}
  async listEvidenceForOwner(jobId:string,ownerId:string){const j=await this.getJobForOwner(jobId,ownerId);return j?[...this.evidence.values()].filter(e=>e.jobId===jobId&&e.ownerId===ownerId):[];}
}

export class PostgresJobRepository implements JobRepository {
  constructor(private readonly pool:Pool){}
  async createJobFromQuote(input:{quoteId:string;ownerId:string;details?:Record<string,unknown>}){const r=await this.pool.query(`WITH accepted AS (UPDATE supplier_quotes SET status='ACCEPTED',updated_at=now() WHERE id=$1 AND owner_id=$2 AND status='SUBMITTED' AND NOT EXISTS (SELECT 1 FROM service_jobs WHERE quote_id=$1) RETURNING property_id,owner_id,supplier_id,id) INSERT INTO service_jobs(property_id,owner_id,supplier_id,quote_id,status,details) SELECT property_id,owner_id,supplier_id,id,'REQUESTED',$3 FROM accepted RETURNING *`,[input.quoteId,input.ownerId,input.details??{}]);return r.rows[0]?this.mapJob(r.rows[0]):null;}
  async getJobForOwner(jobId:string,ownerId:string){const r=await this.pool.query('SELECT * FROM service_jobs WHERE id=$1 AND owner_id=$2',[jobId,ownerId]);return r.rows[0]?this.mapJob(r.rows[0]):null;}
  async listJobsForOwner(ownerId:string,propertyId?:string){const r=await this.pool.query('SELECT * FROM service_jobs WHERE owner_id=$1 AND ($2::uuid IS NULL OR property_id=$2) ORDER BY created_at DESC',[ownerId,propertyId??null]);return r.rows.map(x=>this.mapJob(x));}
  async updateJobStatus(jobId:string,ownerId:string,status:ServiceJobStatus,scheduledFor?:string){const current=await this.getJobForOwner(jobId,ownerId);if(!current||!canTransitionJobStatus(current.status,status))return null;const r=await this.pool.query(`UPDATE service_jobs SET status=$1,scheduled_for=COALESCE($2::timestamptz,scheduled_for),started_at=CASE WHEN $1='IN_PROGRESS' AND started_at IS NULL THEN now() ELSE started_at END,completed_at=CASE WHEN $1='COMPLETED' THEN now() ELSE completed_at END WHERE id=$3 AND owner_id=$4 RETURNING *`,[status,scheduledFor??null,jobId,ownerId]);return r.rows[0]?this.mapJob(r.rows[0]):null;}
  async addEvidence(input:Omit<JobEvidence,'id'|'createdAt'>){const r=await this.pool.query(`INSERT INTO job_evidence(job_id,owner_id,property_id,evidence_type,storage_key,metadata,captured_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[input.jobId,input.ownerId,input.propertyId,input.evidenceType,input.storageKey,input.metadata,input.capturedAt]);return this.mapEvidence(r.rows[0]);}
  async listEvidenceForOwner(jobId:string,ownerId:string){const r=await this.pool.query('SELECT e.* FROM job_evidence e JOIN service_jobs j ON j.id=e.job_id WHERE e.job_id=$1 AND e.owner_id=$2 AND j.owner_id=$2 ORDER BY e.captured_at',[jobId,ownerId]);return r.rows.map(x=>this.mapEvidence(x));}
  private mapJob(r:any):ServiceJob{return{id:r.id,propertyId:r.property_id,ownerId:r.owner_id,supplierId:r.supplier_id??undefined,quoteId:r.quote_id??undefined,status:r.status,details:r.details,scheduledFor:r.scheduled_for?.toISOString(),startedAt:r.started_at?.toISOString(),completedAt:r.completed_at?.toISOString(),createdAt:r.created_at.toISOString(),updatedAt:r.updated_at.toISOString()};}
  private mapEvidence(r:any):JobEvidence{return{id:r.id,jobId:r.job_id,ownerId:r.owner_id,propertyId:r.property_id,evidenceType:r.evidence_type,storageKey:r.storage_key,metadata:r.metadata,capturedAt:r.captured_at.toISOString(),createdAt:r.created_at.toISOString()};}
}
