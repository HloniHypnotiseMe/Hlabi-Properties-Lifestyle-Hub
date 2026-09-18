import { randomUUID } from 'node:crypto';
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
