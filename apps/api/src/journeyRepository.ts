import { randomUUID } from 'node:crypto';
import type { BuyerJourney, InvestorJourney, SellerJourney } from './journeyDomain.js';

export interface JourneyRepository {
  upsertBuyer(input: Omit<BuyerJourney,'id'|'createdAt'|'updatedAt'>): Promise<BuyerJourney>;
  getBuyer(userId: string): Promise<BuyerJourney | null>;
  upsertSeller(input: Omit<SellerJourney,'id'|'createdAt'|'updatedAt'>): Promise<SellerJourney>;
  getSeller(propertyId: string, userId: string): Promise<SellerJourney | null>;
  upsertInvestor(input: Omit<InvestorJourney,'id'|'createdAt'|'updatedAt'>): Promise<InvestorJourney>;
  getInvestor(userId: string): Promise<InvestorJourney | null>;
}

export class MemoryJourneyRepository implements JourneyRepository {
  private buyers = new Map<string, BuyerJourney>(); private sellers = new Map<string, SellerJourney>(); private investors = new Map<string, InvestorJourney>();
  async upsertBuyer(input: Omit<BuyerJourney,'id'|'createdAt'|'updatedAt'>) { const old=this.buyers.get(input.userId); const now=new Date().toISOString(); const item={...input,id:old?.id??randomUUID(),createdAt:old?.createdAt??now,updatedAt:now}; this.buyers.set(input.userId,item); return item; }
  async getBuyer(userId:string){return this.buyers.get(userId)??null;}
  async upsertSeller(input: Omit<SellerJourney,'id'|'createdAt'|'updatedAt'>) { const key=`${input.userId}:${input.propertyId}`; const old=this.sellers.get(key); const now=new Date().toISOString(); const item={...input,id:old?.id??randomUUID(),createdAt:old?.createdAt??now,updatedAt:now}; this.sellers.set(key,item); return item; }
  async getSeller(propertyId:string,userId:string){return this.sellers.get(`${userId}:${propertyId}`)??null;}
  async upsertInvestor(input: Omit<InvestorJourney,'id'|'createdAt'|'updatedAt'>) { const old=this.investors.get(input.userId); const now=new Date().toISOString(); const item={...input,id:old?.id??randomUUID(),createdAt:old?.createdAt??now,updatedAt:now}; this.investors.set(input.userId,item); return item; }
  async getInvestor(userId:string){return this.investors.get(userId)??null;}
}
