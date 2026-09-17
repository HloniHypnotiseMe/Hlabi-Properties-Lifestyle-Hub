import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import type { AgentPropertyAccess } from './agentPropertyAccessDomain.js';
import type { AgentPropertyAccessRepository } from './agentPropertyAccessRepository.js';

const map = (r: any): AgentPropertyAccess => ({ id:r.id, agentId:r.agent_id, ownerId:r.owner_id, propertyId:r.property_id, status:r.status, grantedBy:r.granted_by, createdAt:r.created_at.toISOString(), updatedAt:r.updated_at.toISOString() });

export class PostgresAgentPropertyAccessRepository implements AgentPropertyAccessRepository {
  constructor(private readonly pool: Pool) {}
  async grant(input: Omit<AgentPropertyAccess,'id'|'createdAt'|'updatedAt'|'status'>) {
    const id=randomUUID(); const {rows}=await this.pool.query(`INSERT INTO agent_property_access (id,agent_id,owner_id,property_id,status,granted_by) VALUES ($1,$2,$3,$4,'ACTIVE',$5) ON CONFLICT (agent_id,property_id) DO UPDATE SET owner_id=EXCLUDED.owner_id,status='ACTIVE',granted_by=EXCLUDED.granted_by,updated_at=NOW() RETURNING *`,[id,input.agentId,input.ownerId,input.propertyId,input.grantedBy]); return map(rows[0]);
  }
  async getActive(agentId:string,ownerId:string,propertyId:string){const {rows}=await this.pool.query(`SELECT * FROM agent_property_access WHERE agent_id=$1 AND owner_id=$2 AND property_id=$3 AND status='ACTIVE'`,[agentId,ownerId,propertyId]);return rows[0]?map(rows[0]):null;}
  async listForOwner(ownerId:string,propertyId?:string){const {rows}=await this.pool.query('SELECT * FROM agent_property_access WHERE owner_id=$1 AND ($2::uuid IS NULL OR property_id=$2) ORDER BY created_at DESC',[ownerId,propertyId??null]);return rows.map(map);}
  async revoke(id:string,ownerId:string){const {rows}=await this.pool.query(`UPDATE agent_property_access SET status='REVOKED',updated_at=NOW() WHERE id=$1 AND owner_id=$2 RETURNING *`,[id,ownerId]);return rows[0]?map(rows[0]):null;}
}
