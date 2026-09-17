import type { Pool } from 'pg';
import type { HomePassport, HomePassportSection } from './homePassportDomain.js';

export interface HomePassportRepository {
  getForOwner(propertyId: string, ownerId: string): Promise<HomePassport | null>;
  create(input: Omit<HomePassport,'id'|'createdAt'|'updatedAt'>): Promise<HomePassport>;
  updateSection(propertyId: string, ownerId: string, section: HomePassportSection, value: Record<string, unknown>): Promise<HomePassport | null>;
}

export class MemoryHomePassportRepository implements HomePassportRepository {
  private readonly passports = new Map<string, HomePassport>();
  async getForOwner(propertyId:string, ownerId:string) { const p=this.passports.get(propertyId); return p?.ownerId===ownerId?p:null; }
  async create(input:Omit<HomePassport,'id'|'createdAt'|'updatedAt'>) { const now=new Date().toISOString(); const p={...input,id:`passport-${crypto.randomUUID()}`,createdAt:now,updatedAt:now}; this.passports.set(p.propertyId,p); return p; }
  async updateSection(propertyId:string, ownerId:string, section:HomePassportSection, value:Record<string,unknown>) { const p=await this.getForOwner(propertyId,ownerId); if(!p)return null; const updated={...p,data:{...p.data,[section]:value},updatedAt:new Date().toISOString()}; this.passports.set(propertyId,updated); return updated; }
}

export class PostgresHomePassportRepository implements HomePassportRepository {
  constructor(private readonly pool:Pool) {}
  async getForOwner(propertyId:string, ownerId:string) { const r=await this.pool.query('SELECT id,property_id,owner_id,status,data,created_at,updated_at FROM home_passports WHERE property_id=$1 AND owner_id=$2 AND status=\'ACTIVE\' LIMIT 1',[propertyId,ownerId]); return r.rows[0]?this.map(r.rows[0]):null; }
  async create(input:Omit<HomePassport,'id'|'createdAt'|'updatedAt'>) { const r=await this.pool.query('INSERT INTO home_passports (property_id,owner_id,status,data) VALUES ($1,$2,$3,$4) RETURNING *',[input.propertyId,input.ownerId,input.status,input.data]); return this.map(r.rows[0]); }
  async updateSection(propertyId:string, ownerId:string, section:HomePassportSection, value:Record<string,unknown>) { const r=await this.pool.query('UPDATE home_passports SET data=jsonb_set(data,$3,$4::jsonb,true),updated_at=now() WHERE property_id=$1 AND owner_id=$2 AND status=\'ACTIVE\' RETURNING *',[propertyId,ownerId,`{${section}}`,JSON.stringify(value)]); return r.rows[0]?this.map(r.rows[0]):null; }
  private map(r:any):HomePassport { return {id:r.id,propertyId:r.property_id,ownerId:r.owner_id,status:r.status,data:r.data??{},createdAt:r.created_at.toISOString(),updatedAt:r.updated_at.toISOString()}; }
}
