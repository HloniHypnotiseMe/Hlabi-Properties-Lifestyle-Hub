import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import type { ReputationReview, ReputationSummary } from './reputationDomain.js';

export interface ReputationRepository {
  createReview(input: Omit<ReputationReview,'id'|'createdAt'|'updatedAt'>): Promise<ReputationReview>;
  listReviewsForProperty(propertyId:string, ownerId:string): Promise<ReputationReview[]>;
  getSummary(propertyId:string, ownerId:string): Promise<ReputationSummary>;
  getSummaryForSupplier(supplierId:string): Promise<{supplierId:string;reviewCount:number;averageRating:number|null;latestReviewAt?:string}>;
}

export class MemoryReputationRepository implements ReputationRepository {
  private reviews: ReputationReview[] = [];
  async createReview(input: Omit<ReputationReview,'id'|'createdAt'|'updatedAt'>) { const now=new Date().toISOString(); const item={...input,id:randomUUID(),createdAt:now,updatedAt:now}; this.reviews.push(item); return item; }
  async listReviewsForProperty(propertyId:string,ownerId:string) { return this.reviews.filter(r=>r.propertyId===propertyId&&r.ownerId===ownerId); }
  async getSummaryForSupplier(supplierId:string) { const reviews=this.reviews.filter(r=>r.supplierId===supplierId&&r.status==='PUBLISHED'); const average=reviews.length?Math.round((reviews.reduce((s,r)=>s+r.rating,0)/reviews.length)*100)/100:null; return {supplierId,reviewCount:reviews.length,averageRating:average,latestReviewAt:reviews.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0]?.createdAt}; }
  async getSummary(propertyId:string,ownerId:string) { const reviews=(await this.listReviewsForProperty(propertyId,ownerId)).filter(r=>r.status==='PUBLISHED'); const average=reviews.length?Math.round((reviews.reduce((s,r)=>s+r.rating,0)/reviews.length)*100)/100:null; return {propertyId,reviewCount:reviews.length,averageRating:average,latestReviewAt:reviews.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0]?.createdAt}; }
}


export class PostgresReputationRepository implements ReputationRepository {
  constructor(private readonly pool:Pool) {}
  async createReview(input:Omit<ReputationReview,'id'|'createdAt'|'updatedAt'>) {
    const r=await this.pool.query(`INSERT INTO reputation_reviews (owner_id,property_id,job_id,supplier_id,agent_id,rating,title,comment,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,[input.ownerId,input.propertyId,input.jobId??null,input.supplierId??null,input.agentId??null,input.rating,input.title??null,input.comment??null,input.status]);
    return this.map(r.rows[0]);
  }
  async listReviewsForProperty(propertyId:string,ownerId:string) {
    const r=await this.pool.query(`SELECT * FROM reputation_reviews WHERE property_id=$1 AND owner_id=$2 ORDER BY created_at DESC`,[propertyId,ownerId]); return r.rows.map(x=>this.map(x));
  }
  async getSummary(propertyId:string,ownerId:string) {
    const r=await this.pool.query(`SELECT count(*)::int AS review_count, AVG(rating) AS average_rating, MAX(created_at) AS latest_review_at FROM reputation_reviews WHERE property_id=$1 AND owner_id=$2 AND status='PUBLISHED'`,[propertyId,ownerId]);
    const x=r.rows[0]; return {propertyId,reviewCount:x.review_count,averageRating:x.average_rating===null?null:Number(x.average_rating),latestReviewAt:x.latest_review_at?.toISOString()};
  }
  async getSummaryForSupplier(supplierId:string) {
    const r=await this.pool.query(`SELECT count(*)::int AS review_count, AVG(rating) AS average_rating, MAX(created_at) AS latest_review_at FROM reputation_reviews WHERE supplier_id=$1 AND status='PUBLISHED'`,[supplierId]);
    const x=r.rows[0]; return {supplierId,reviewCount:x.review_count,averageRating:x.average_rating===null?null:Number(x.average_rating),latestReviewAt:x.latest_review_at?.toISOString()};
  }
  private map(r:any):ReputationReview { return {id:r.id,ownerId:r.owner_id,propertyId:r.property_id,jobId:r.job_id??undefined,supplierId:r.supplier_id??undefined,agentId:r.agent_id??undefined,rating:r.rating,title:r.title??undefined,comment:r.comment??undefined,status:r.status,createdAt:r.created_at.toISOString(),updatedAt:r.updated_at.toISOString()}; }
}
