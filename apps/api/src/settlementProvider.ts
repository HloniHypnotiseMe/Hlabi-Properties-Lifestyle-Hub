import type {SupplierPayoutProvider} from './settlementDomain.js';

export interface PayoutProviderConfig {name:string;enabled:boolean;apiBaseUrl?:string;accountId?:string}

export class ConfiguredSupplierPayoutProvider implements SupplierPayoutProvider {
 readonly name:string;
 private readonly enabled:boolean;
 constructor(name=process.env.PAYOUT_PROVIDER??'sandbox'){
   this.name=name;
   this.enabled=process.env.PAYOUTS_ENABLED==='true';
 }
 async initiatePayout(input:{settlementId:string;supplierId:string;amountMinor:number;currency:string;reference:string;idempotencyKey?:string}){
   if(this.name.toLowerCase()==='sandbox'&&this.enabled)return {status:'PAID' as const,payoutReference:`sandbox-payout-${input.settlementId}`};
   if(this.name.toLowerCase()==='sandbox')return {status:'PROCESSING' as const};
   throw new Error('PAYOUT_PROVIDER_NOT_IMPLEMENTED');
 }
}

export function payoutProviderConfig():PayoutProviderConfig{
 const name=process.env.PAYOUT_PROVIDER??'sandbox';
 return {name,enabled:process.env.PAYOUTS_ENABLED==='true',apiBaseUrl:process.env.PAYOUT_API_BASE_URL,accountId:process.env.PAYOUT_ACCOUNT_ID};
}
