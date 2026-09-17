import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import type { ReputationRepository } from './reputationRepository.js';
import type { ReputationReview, ReputationSummary } from './reputationDomain.js';

const mapReview=(r:any):ReputationReview=>({id:r.id,ownerId:r.owner_id,propertyId:r.property_id,jobId:r.job_id??undefined,supplierId:r.supplier_id??undefined,agentId:r.agent_id??undefined,rating:r.rating,title:r.title??undefined,comment:r.comment??undefined,status:r.status,createdAt:r.created_at.toISOString(),updatedAt:r.updated_at.toISOString()});
export class PostgresReputationRepository implements ReputationRepository {
 constructor(private readonly pool:Pool){}
 async createReview(input:Omit<ReputationReview,'id'|'createdAt'|'updatedAt'>){const id=randomUUID();const {rows}=await this.pool.query(`INSERT INTO reputation_reviews(id,owner_id,property_id,job_id,supplier_id,agent_id,rating,title,comment,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,[id,input.ownerId,input.propertyId,input.jobId??null,input.supplierId??null,input.agentId??null,input.rating,input.title??null,input.comment??null,input.status]);return mapReview(rows[0]);}
 async listReviewsForProperty(propertyId:string,ownerId:string){const {rows}=await this.pool.query('SELECT * FROM reputation_reviews WHERE property_id=$1 AND owner_id=$2 ORDER BY created_at DESC',[propertyId,ownerId]);return rows.map(mapReview);}
 async getSummary(propertyId:string,ownerId:string){const {rows}=await this.pool.query(`SELECT COUNT(*)::int AS review_count, AVG(rating)::float AS average_rating, MAX(created_at) AS latest_review_at FROM reputation_reviews WHERE property_id=$1 AND owner_id=$2 AND status='PUBLISHED'`,[propertyId,ownerId]);const r=rows[0];return {propertyId,reviewCount:r.review_count,averageRating:r.average_rating===null?null:Math.round(r.average_rating*100)/100,latestReviewAt:r.latest_review_at?.toISOString()};}
}
