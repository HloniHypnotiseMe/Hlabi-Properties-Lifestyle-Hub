import type { Pool } from 'pg';
import type { MessageStatus, NotificationMessage } from './messagingDomain.js';
import type { MessagingRepository } from './messagingRepository.js';

export class PostgresMessagingRepository implements MessagingRepository {
  constructor(private readonly pool: Pool) {}
  async create(input: Omit<NotificationMessage, 'id' | 'createdAt' | 'status'>) {
    const result = await this.pool.query(`INSERT INTO notification_messages (id,owner_id,property_id,channel,recipient,template,payload,status,idempotency_key) VALUES (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,'QUEUED',$7) ON CONFLICT (owner_id,idempotency_key) DO UPDATE SET id=notification_messages.id RETURNING *`, [input.ownerId,input.propertyId??null,input.channel,input.recipient,input.template,input.payload,input.idempotencyKey]);
    return this.map(result.rows[0]);
  }
  async getForOwner(id:string, ownerId:string){const r=await this.pool.query('SELECT * FROM notification_messages WHERE id=$1 AND owner_id=$2',[id,ownerId]);return r.rows[0]?this.map(r.rows[0]):null;}
  async listForOwner(ownerId:string, propertyId?:string){const r=await this.pool.query(`SELECT * FROM notification_messages WHERE owner_id=$1 ${propertyId?'AND property_id=$2':''} ORDER BY created_at DESC`,propertyId?[ownerId,propertyId]:[ownerId]);return r.rows.map((row)=>this.map(row));}
  async updateStatus(id:string,status:MessageStatus,details:{providerMessageId?:string;errorCode?:string}={}){const r=await this.pool.query(`UPDATE notification_messages SET status=$2,provider_message_id=COALESCE($3,provider_message_id),error_code=$4,sent_at=CASE WHEN $2='SENT' THEN NOW() ELSE sent_at END,failed_at=CASE WHEN $2='FAILED' THEN NOW() ELSE failed_at END WHERE id=$1 RETURNING *`,[id,status,details.providerMessageId??null,details.errorCode??null]);return r.rows[0]?this.map(r.rows[0]):null;}
  private map(row:any):NotificationMessage{return {id:row.id,ownerId:row.owner_id,propertyId:row.property_id??undefined,channel:row.channel,recipient:row.recipient,template:row.template,payload:row.payload,status:row.status,providerMessageId:row.provider_message_id??undefined,idempotencyKey:row.idempotency_key,createdAt:new Date(row.created_at).toISOString(),sentAt:row.sent_at?new Date(row.sent_at).toISOString():undefined,failedAt:row.failed_at?new Date(row.failed_at).toISOString():undefined,errorCode:row.error_code??undefined};}
}
