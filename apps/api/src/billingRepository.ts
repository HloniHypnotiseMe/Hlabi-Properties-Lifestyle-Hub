import type { Pool } from 'pg';
import type { Subscription, PaymentTransaction, SubscriptionStatus, PaymentStatus, BillingInterval } from './billingDomain.js';

const id=()=>crypto.randomUUID(); const now=()=>new Date().toISOString();
export interface BillingRepository {
  getSubscriptionForOwner(propertyId:string,ownerId:string):Promise<Subscription|null>;
  createSubscription(input:Omit<Subscription,'id'|'createdAt'|'updatedAt'>):Promise<Subscription>;
  listTransactionsForOwner(ownerId:string,propertyId?:string):Promise<PaymentTransaction[]>;
  createTransaction(input:Omit<PaymentTransaction,'id'|'createdAt'|'updatedAt'>):Promise<PaymentTransaction>;
}

export class MemoryBillingRepository implements BillingRepository {
 private subscriptions:Subscription[]=[]; private transactions:PaymentTransaction[]=[];
 async getSubscriptionForOwner(propertyId:string,ownerId:string){return this.subscriptions.find(s=>s.propertyId===propertyId&&s.ownerId===ownerId&&['PENDING','ACTIVE','PAST_DUE','PAUSED'].includes(s.status))??null;}
 async createSubscription(input:Omit<Subscription,'id'|'createdAt'|'updatedAt'>){const t=now();const s={...input,id:id(),createdAt:t,updatedAt:t};this.subscriptions.push(s);return s;}
 async listTransactionsForOwner(ownerId:string,propertyId?:string){return this.transactions.filter(t=>t.ownerId===ownerId&&(!propertyId||t.propertyId===propertyId)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
 async createTransaction(input:Omit<PaymentTransaction,'id'|'createdAt'|'updatedAt'>){const t=now();const x={...input,id:id(),createdAt:t,updatedAt:t};this.transactions.push(x);return x;}
}

const mapSubscription=(r:any):Subscription=>({id:r.id,ownerId:r.owner_id,propertyId:r.property_id,planCode:r.plan_code,status:r.status as SubscriptionStatus,currency:r.currency,amountMinor:Number(r.amount_minor),interval:r.interval as BillingInterval,provider:r.provider,providerCustomerRef:r.provider_customer_ref??undefined,providerSubscriptionRef:r.provider_subscription_ref??undefined,currentPeriodStart:r.current_period_start?.toISOString(),currentPeriodEnd:r.current_period_end?.toISOString(),createdAt:r.created_at.toISOString(),updatedAt:r.updated_at.toISOString()});
const mapTransaction=(r:any):PaymentTransaction=>({id:r.id,subscriptionId:r.subscription_id??undefined,ownerId:r.owner_id,propertyId:r.property_id??undefined,provider:r.provider,reference:r.reference,providerTransactionRef:r.provider_transaction_ref??undefined,amountMinor:Number(r.amount_minor),currency:r.currency,status:r.status as PaymentStatus,failureCode:r.failure_code??undefined,failureReason:r.failure_reason??undefined,idempotencyKey:r.idempotency_key,createdAt:r.created_at.toISOString(),updatedAt:r.updated_at.toISOString()});
export class PostgresBillingRepository implements BillingRepository {
 constructor(private readonly pool:Pool){}
 async getSubscriptionForOwner(propertyId:string,ownerId:string){const r=await this.pool.query('SELECT * FROM subscriptions WHERE property_id=$1 AND owner_id=$2 AND status IN ($3,$4,$5,$6) ORDER BY created_at DESC LIMIT 1',[propertyId,ownerId,'PENDING','ACTIVE','PAST_DUE','PAUSED']);return r.rows[0]?mapSubscription(r.rows[0]):null;}
 async createSubscription(input:Omit<Subscription,'id'|'createdAt'|'updatedAt'>){const r=await this.pool.query('INSERT INTO subscriptions(id,owner_id,property_id,plan_code,status,currency,amount_minor,interval,provider,provider_customer_ref,provider_subscription_ref,current_period_start,current_period_end) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *',[id(),input.ownerId,input.propertyId,input.planCode,input.status,input.currency,input.amountMinor,input.interval,input.provider,input.providerCustomerRef??null,input.providerSubscriptionRef??null,input.currentPeriodStart??null,input.currentPeriodEnd??null]);return mapSubscription(r.rows[0]);}
 async listTransactionsForOwner(ownerId:string,propertyId?:string){const r=await this.pool.query('SELECT * FROM payment_transactions WHERE owner_id=$1 AND ($2::uuid IS NULL OR property_id=$2) ORDER BY created_at DESC',[ownerId,propertyId??null]);return r.rows.map(mapTransaction);}
 async createTransaction(input:Omit<PaymentTransaction,'id'|'createdAt'|'updatedAt'>){const r=await this.pool.query('INSERT INTO payment_transactions(id,subscription_id,owner_id,property_id,provider,reference,provider_transaction_ref,amount_minor,currency,status,failure_code,failure_reason,idempotency_key) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *',[id(),input.subscriptionId??null,input.ownerId,input.propertyId??null,input.provider,input.reference,input.providerTransactionRef??null,input.amountMinor,input.currency,input.status,input.failureCode??null,input.failureReason??null,input.idempotencyKey]);return mapTransaction(r.rows[0]);}
}
