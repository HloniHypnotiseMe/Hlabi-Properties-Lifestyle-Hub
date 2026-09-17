import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import type { AcceleratorProfile, AcceleratorStage, AcceleratorStatus } from './franchiseAcceleratorDomain.js';

export interface FranchiseAcceleratorRepository {
  get(userId: string): Promise<AcceleratorProfile | null>;
  create(userId: string): Promise<AcceleratorProfile>;
  update(userId: string, patch: Partial<Pick<AcceleratorProfile,'stage'|'status'|'checklist'|'territory'|'officeName'|'franchiseOpportunityId'|'notes'>>): Promise<AcceleratorProfile | null>;
}

export class MemoryFranchiseAcceleratorRepository implements FranchiseAcceleratorRepository {
  private items = new Map<string, AcceleratorProfile>();
  async get(userId: string) { return this.items.get(userId) ?? null; }
  async create(userId: string) { const now=new Date().toISOString(); const item:AcceleratorProfile={id:randomUUID(),userId,stage:'ACADEMY',status:'IN_PROGRESS',checklist:{},createdAt:now,updatedAt:now}; this.items.set(userId,item); return item; }
  async update(userId:string,patch:Partial<Pick<AcceleratorProfile,'stage'|'status'|'checklist'|'territory'|'officeName'|'franchiseOpportunityId'|'notes'>>){const item=await this.get(userId);if(!item)return null;Object.assign(item,patch,{updatedAt:new Date().toISOString()});return item;}
}

const map=(r:any):AcceleratorProfile=>({id:r.id,userId:r.user_id,stage:r.stage,status:r.status,checklist:r.checklist??{},territory:r.territory??undefined,officeName:r.office_name??undefined,franchiseOpportunityId:r.franchise_opportunity_id??undefined,notes:r.notes??undefined,createdAt:r.created_at.toISOString(),updatedAt:r.updated_at.toISOString()});
export class PostgresFranchiseAcceleratorRepository implements FranchiseAcceleratorRepository {
  constructor(private readonly pool:Pool){}
  async get(userId:string){const {rows}=await this.pool.query('SELECT * FROM franchise_accelerator_profiles WHERE user_id=$1',[userId]);return rows[0]?map(rows[0]):null;}
  async create(userId:string){const id=randomUUID();const {rows}=await this.pool.query("INSERT INTO franchise_accelerator_profiles (id,user_id,stage,status,checklist) VALUES ($1,$2,'ACADEMY','IN_PROGRESS','{}'::jsonb) ON CONFLICT(user_id) DO UPDATE SET updated_at=NOW() RETURNING *",[id,userId]);return map(rows[0]);}
  async update(userId:string,patch:Partial<Pick<AcceleratorProfile,'stage'|'status'|'checklist'|'territory'|'officeName'|'franchiseOpportunityId'|'notes'>>){const fields:string[]=[];const values:any[]=[];let i=1;const cols:any={stage:'stage',status:'status',checklist:'checklist',territory:'territory',officeName:'office_name',franchiseOpportunityId:'franchise_opportunity_id',notes:'notes'};for(const [k,v] of Object.entries(patch)){if(cols[k]){fields.push(`${cols[k]}=$${i++}`);values.push(v??null);}}if(!fields.length)return this.get(userId);values.push(userId);const {rows}=await this.pool.query(`UPDATE franchise_accelerator_profiles SET ${fields.join(',')},updated_at=NOW() WHERE user_id=$${i} RETURNING *`,values);return rows[0]?map(rows[0]):null;}
}
