import type { Pool } from 'pg';
import type { RenewalPlan, RenewalTask, RenewalStatus, RenewalTaskStatus } from './renewalDomain.js';

export interface RenewalRepository {
  getPlanForOwner(propertyId: string, ownerId: string): Promise<RenewalPlan | null>;
  createPlan(input: Omit<RenewalPlan, 'id'|'createdAt'|'updatedAt'>): Promise<RenewalPlan>;
  listTasksForOwner(planId: string, ownerId: string): Promise<RenewalTask[]>;
  createTask(input: Omit<RenewalTask, 'id'|'createdAt'|'updatedAt'>): Promise<RenewalTask>;
  updateTaskStatus(taskId: string, ownerId: string, status: RenewalTaskStatus, serviceJobId?: string): Promise<RenewalTask | null>;
}

const id=()=>crypto.randomUUID();
const now=()=>new Date().toISOString();

export class MemoryRenewalRepository implements RenewalRepository {
  private plans: RenewalPlan[]=[]; private tasks: RenewalTask[]=[];
  async getPlanForOwner(propertyId:string,ownerId:string){return this.plans.find(p=>p.propertyId===propertyId&&p.ownerId===ownerId&&p.status!=='CANCELLED')??null;}
  async createPlan(input:Omit<RenewalPlan,'id'|'createdAt'|'updatedAt'>){const t=now();const p={...input,id:id(),createdAt:t,updatedAt:t};this.plans.push(p);return p;}
  async listTasksForOwner(planId:string,ownerId:string){return this.tasks.filter(t=>t.planId===planId&&t.ownerId===ownerId);}
  async createTask(input:Omit<RenewalTask,'id'|'createdAt'|'updatedAt'>){const t=now();const task={...input,id:id(),createdAt:t,updatedAt:t};this.tasks.push(task);return task;}
  async updateTaskStatus(taskId:string,ownerId:string,status:RenewalTaskStatus,serviceJobId?:string){const task=this.tasks.find(t=>t.id===taskId&&t.ownerId===ownerId);if(!task)return null;task.status=status;if(serviceJobId)task.serviceJobId=serviceJobId;task.updatedAt=now();return task;}
}

const mapPlan=(r:any):RenewalPlan=>({id:r.id,propertyId:r.property_id,ownerId:r.owner_id,status:r.status as RenewalStatus,cycleYears:5,startDate:(r.started_at??r.created_at).toISOString(),nextReviewDate:(r.next_review_at??new Date(Date.now()+5*365*86400000)).toISOString(),homeHealthAtStart:r.home_health_at_start??undefined,sourceAuditId:r.source_audit_id??undefined,createdAt:r.created_at.toISOString(),updatedAt:r.updated_at.toISOString()});
const mapTask=(r:any):RenewalTask=>({id:r.id,planId:r.plan_id,propertyId:r.property_id,ownerId:r.owner_id,title:r.title,category:r.category,priority:r.priority,status:r.status,dueDate:r.due_date?.toISOString(),serviceJobId:r.service_job_id??undefined,createdAt:r.created_at.toISOString(),updatedAt:r.updated_at.toISOString()});

export class PostgresRenewalRepository implements RenewalRepository {
  constructor(private readonly pool:Pool){}
  async getPlanForOwner(propertyId:string,ownerId:string){const r=await this.pool.query('SELECT * FROM renewal_plans WHERE property_id=$1 AND owner_id=$2 AND status<>$3 ORDER BY created_at DESC LIMIT 1',[propertyId,ownerId,'CANCELLED']);return r.rows[0]?mapPlan(r.rows[0]):null;}
  async createPlan(input:Omit<RenewalPlan,'id'|'createdAt'|'updatedAt'>){const r=await this.pool.query('INSERT INTO renewal_plans(id,property_id,owner_id,status,cycle_years,started_at,next_review_at,home_health_at_start,source_audit_id) VALUES($1,$2,$3,$4,5,$5,$6,$7,$8) RETURNING *',[id(),input.propertyId,input.ownerId,input.status,input.startDate,input.nextReviewDate,input.homeHealthAtStart??null,input.sourceAuditId??null]);return mapPlan(r.rows[0]);}
  async listTasksForOwner(planId:string,ownerId:string){const r=await this.pool.query('SELECT * FROM renewal_tasks WHERE plan_id=$1 AND owner_id=$2 ORDER BY due_date NULLS LAST, created_at',[planId,ownerId]);return r.rows.map(mapTask);}
  async createTask(input:Omit<RenewalTask,'id'|'createdAt'|'updatedAt'>){const r=await this.pool.query('INSERT INTO renewal_tasks(id,plan_id,property_id,owner_id,title,category,priority,status,due_date,service_job_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',[id(),input.planId,input.propertyId,input.ownerId,input.title,input.category,input.priority,input.status,input.dueDate??null,input.serviceJobId??null]);return mapTask(r.rows[0]);}
  async updateTaskStatus(taskId:string,ownerId:string,status:RenewalTaskStatus,serviceJobId?:string){const r=await this.pool.query('UPDATE renewal_tasks SET status=$1, service_job_id=COALESCE($2,service_job_id) WHERE id=$3 AND owner_id=$4 RETURNING *',[status,serviceJobId??null,taskId,ownerId]);return r.rows[0]?mapTask(r.rows[0]):null;}
}
