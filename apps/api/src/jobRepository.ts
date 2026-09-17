import type { Pool } from 'pg';
import type { JobEvidence, ServiceJob, ServiceJobStatus } from './jobDomain.js';

export interface JobRepository {
  createJob(input: { propertyId: string; ownerId: string; supplierId: string; quoteId?: string; details?: Record<string, unknown> }): Promise<ServiceJob>;
  getJobForOwner(jobId: string, ownerId: string): Promise<ServiceJob | null>;
  listJobsForOwner(ownerId: string, propertyId?: string): Promise<ServiceJob[]>;
  updateJobStatus(jobId: string, ownerId: string, status: ServiceJobStatus, scheduledFor?: string): Promise<ServiceJob | null>;
  addEvidence(input: Omit<JobEvidence, 'id' | 'createdAt'>): Promise<JobEvidence>;
  listEvidenceForOwner(jobId: string, ownerId: string): Promise<JobEvidence[]>;
}

export class MemoryJobRepository implements JobRepository {
  private readonly jobs = new Map<string, ServiceJob>();
  private readonly evidence = new Map<string, JobEvidence>();

  async createJob(input: { propertyId: string; ownerId: string; supplierId: string; quoteId?: string; details?: Record<string, unknown> }) {
    const now = new Date().toISOString();
    const job: ServiceJob = { id: `job-${crypto.randomUUID()}`, propertyId: input.propertyId, ownerId: input.ownerId, supplierId: input.supplierId, quoteId: input.quoteId, status: 'REQUESTED', details: input.details ?? {}, createdAt: now, updatedAt: now };
    this.jobs.set(job.id, job);
    return job;
  }
  async getJobForOwner(jobId: string, ownerId: string) { const job = this.jobs.get(jobId); return job?.ownerId === ownerId ? job : null; }
  async listJobsForOwner(ownerId: string, propertyId?: string) { return [...this.jobs.values()].filter(j => j.ownerId === ownerId && (!propertyId || j.propertyId === propertyId)); }
  async updateJobStatus(jobId: string, ownerId: string, status: ServiceJobStatus, scheduledFor?: string) {
    const job = await this.getJobForOwner(jobId, ownerId); if (!job) return null;
    const now = new Date().toISOString(); const updated = { ...job, status, scheduledFor: scheduledFor ?? job.scheduledFor, startedAt: status === 'IN_PROGRESS' && !job.startedAt ? now : job.startedAt, completedAt: status === 'COMPLETED' ? now : job.completedAt, updatedAt: now };
    this.jobs.set(jobId, updated); return updated;
  }
  async addEvidence(input: Omit<JobEvidence, 'id' | 'createdAt'>) { const evidence = { ...input, id: `evidence-${crypto.randomUUID()}`, createdAt: new Date().toISOString() }; this.evidence.set(evidence.id, evidence); return evidence; }
  async listEvidenceForOwner(jobId: string, ownerId: string) { const job = await this.getJobForOwner(jobId, ownerId); return job ? [...this.evidence.values()].filter(e => e.jobId === jobId && e.ownerId === ownerId) : []; }
}

export class PostgresJobRepository implements JobRepository {
  constructor(private readonly pool: Pool) {}
  async createJob(input: { propertyId: string; ownerId: string; supplierId: string; quoteId?: string; details?: Record<string, unknown> }): Promise<ServiceJob> {
    const r = await this.pool.query(`INSERT INTO service_jobs (property_id, owner_id, supplier_id, quote_id, status, details) VALUES ($1,$2,$3,$4,'REQUESTED',$5) RETURNING *`, [input.propertyId, input.ownerId, input.supplierId, input.quoteId ?? null, input.details ?? {}]);
    return this.mapJob(r.rows[0]);
  }
  async getJobForOwner(jobId: string, ownerId: string) { const r = await this.pool.query('SELECT * FROM service_jobs WHERE id=$1 AND owner_id=$2', [jobId, ownerId]); return r.rows[0] ? this.mapJob(r.rows[0]) : null; }
  async listJobsForOwner(ownerId: string, propertyId?: string) { const r = await this.pool.query('SELECT * FROM service_jobs WHERE owner_id=$1 AND ($2::uuid IS NULL OR property_id=$2) ORDER BY created_at DESC', [ownerId, propertyId ?? null]); return r.rows.map(x => this.mapJob(x)); }
  async updateJobStatus(jobId: string, ownerId: string, status: ServiceJobStatus, scheduledFor?: string) {
    const r = await this.pool.query(`UPDATE service_jobs SET status=$1, scheduled_for=COALESCE($2::timestamptz,scheduled_for), started_at=CASE WHEN $1='IN_PROGRESS' AND started_at IS NULL THEN now() ELSE started_at END, completed_at=CASE WHEN $1='COMPLETED' THEN now() ELSE completed_at END WHERE id=$3 AND owner_id=$4 RETURNING *`, [status, scheduledFor ?? null, jobId, ownerId]);
    return r.rows[0] ? this.mapJob(r.rows[0]) : null;
  }
  async addEvidence(input: Omit<JobEvidence, 'id' | 'createdAt'>) {
    const r = await this.pool.query(`INSERT INTO job_evidence (job_id,owner_id,property_id,evidence_type,storage_key,metadata,captured_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [input.jobId,input.ownerId,input.propertyId,input.evidenceType,input.storageKey,input.metadata,input.capturedAt]);
    return this.mapEvidence(r.rows[0]);
  }
  async listEvidenceForOwner(jobId: string, ownerId: string) { const r = await this.pool.query('SELECT e.* FROM job_evidence e JOIN service_jobs j ON j.id=e.job_id WHERE e.job_id=$1 AND e.owner_id=$2 AND j.owner_id=$2 ORDER BY e.captured_at', [jobId, ownerId]); return r.rows.map(x => this.mapEvidence(x)); }
  private mapJob(r: any): ServiceJob { return { id:r.id,propertyId:r.property_id,ownerId:r.owner_id,supplierId:r.supplier_id ?? undefined,quoteId:r.quote_id ?? undefined,status:r.status,details:r.details,scheduledFor:r.scheduled_for?.toISOString(),startedAt:r.started_at?.toISOString(),completedAt:r.completed_at?.toISOString(),createdAt:r.created_at.toISOString(),updatedAt:r.updated_at.toISOString() }; }
  private mapEvidence(r: any): JobEvidence { return { id:r.id,jobId:r.job_id,ownerId:r.owner_id,propertyId:r.property_id,evidenceType:r.evidence_type,storageKey:r.storage_key,metadata:r.metadata,capturedAt:r.captured_at.toISOString(),createdAt:r.created_at.toISOString() }; }
}
