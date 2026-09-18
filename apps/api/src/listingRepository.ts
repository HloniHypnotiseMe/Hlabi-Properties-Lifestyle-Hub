import type { Pool } from 'pg';
import type { ListingRecord, ListingStatus } from './listingDomain.js';

export interface ListingRepository {
  getForSeller(propertyId:string,sellerId:string):Promise<ListingRecord|null>;
  create(input:Omit<ListingRecord,'id'|'createdAt'|'updatedAt'>):Promise<ListingRecord>;
  updateForSeller(propertyId:string,sellerId:string,input:Partial<Pick<ListingRecord,'title'|'description'|'askingPriceCents'|'bedrooms'|'bathrooms'|'features'|'status'>>):Promise<ListingRecord|null>;
  listPublic(filters:{area?:string;maxPriceCents?:number;propertyType?:string}):Promise<ListingRecord[]>;
}

export class MemoryListingRepository implements ListingRepository {
  private readonly listings=new Map<string,ListingRecord>();
  async getForSeller(propertyId:string,sellerId:string){return [...this.listings.values()].find(x=>x.propertyId===propertyId&&x.sellerId===sellerId&&x.status!=='WITHDRAWN')??null;}
  async create(input:Omit<ListingRecord,'id'|'createdAt'|'updatedAt'>){const now=new Date().toISOString();const item={...input,id:`listing-${crypto.randomUUID()}`,createdAt:now,updatedAt:now};this.listings.set(item.id,item);return item;}
  async updateForSeller(propertyId:string,sellerId:string,input:Partial<Pick<ListingRecord,'title'|'description'|'askingPriceCents'|'bedrooms'|'bathrooms'|'features'|'status'>>){const item=await this.getForSeller(propertyId,sellerId);if(!item)return null;const updated={...item,...input,updatedAt:new Date().toISOString(),publishedAt:input.status==='LISTED'?(item.publishedAt??new Date().toISOString()):item.publishedAt};this.listings.set(item.id,updated);return updated;}
  async listPublic(filters:{area?:string;maxPriceCents?:number;propertyType?:string}){return [...this.listings.values()].filter(x=>x.status==='LISTED').filter(x=>filters.maxPriceCents===undefined||x.askingPriceCents===undefined||x.askingPriceCents<=filters.maxPriceCents);}
}

export class PostgresListingRepository implements ListingRepository {
  constructor(private readonly pool:Pool){}
  private map(r:any):ListingRecord{return{id:r.id,propertyId:r.property_id,sellerId:r.seller_id,status:r.status,title:r.title,description:r.description,askingPriceCents:r.asking_price_cents==null?undefined:Number(r.asking_price_cents),bedrooms:r.bedrooms==null?undefined:r.bedrooms,bathrooms:r.bathrooms==null?undefined:Number(r.bathrooms),features:r.features??[],createdAt:r.created_at.toISOString(),updatedAt:r.updated_at.toISOString(),publishedAt:r.published_at?.toISOString()};}
  async getForSeller(propertyId:string,sellerId:string){const q=await this.pool.query('SELECT * FROM property_listings WHERE property_id=$1 AND seller_id=$2 AND status<>$3 LIMIT 1',[propertyId,sellerId,'WITHDRAWN']);return q.rows[0]?this.map(q.rows[0]):null;}
  async create(input:Omit<ListingRecord,'id'|'createdAt'|'updatedAt'>){const q=await this.pool.query(`INSERT INTO property_listings(property_id,seller_id,status,title,description,asking_price_cents,bedrooms,bathrooms,features,published_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,[input.propertyId,input.sellerId,input.status,input.title,input.description,input.askingPriceCents??null,input.bedrooms??null,input.bathrooms??null,input.features,input.publishedAt??null]);return this.map(q.rows[0]);}
  async updateForSeller(propertyId:string,sellerId:string,input:Partial<Pick<ListingRecord,'title'|'description'|'askingPriceCents'|'bedrooms'|'bathrooms'|'features'|'status'>>){const current=await this.getForSeller(propertyId,sellerId);if(!current)return null;const next={...current,...input};const publishedAt=next.status==='LISTED'?(current.publishedAt??new Date().toISOString()):current.publishedAt;const q=await this.pool.query(`UPDATE property_listings SET status=$3,title=$4,description=$5,asking_price_cents=$6,bedrooms=$7,bathrooms=$8,features=$9,published_at=$10 WHERE property_id=$1 AND seller_id=$2 RETURNING *`,[propertyId,sellerId,next.status,next.title,next.description,next.askingPriceCents??null,next.bedrooms??null,next.bathrooms??null,next.features,publishedAt??null]);return q.rows[0]?this.map(q.rows[0]):null;}
  async listPublic(filters:{area?:string;maxPriceCents?:number;propertyType?:string}){const params:any[]=[];const where=['l.status=\'LISTED\''];if(filters.maxPriceCents!==undefined){params.push(filters.maxPriceCents);where.push(`l.asking_price_cents <= $${params.length}`);}if(filters.area){params.push(`%${filters.area}%`);where.push(`(p.address->>'suburb' ILIKE $${params.length} OR p.address->>'city' ILIKE $${params.length})`);}if(filters.propertyType){params.push(filters.propertyType);where.push(`p.property_type = $${params.length}`);}const q=await this.pool.query(`SELECT l.* FROM property_listings l JOIN properties p ON p.id=l.property_id WHERE ${where.join(' AND ')} ORDER BY l.published_at DESC NULLS LAST`,params);return q.rows.map(r=>this.map(r));}
}
