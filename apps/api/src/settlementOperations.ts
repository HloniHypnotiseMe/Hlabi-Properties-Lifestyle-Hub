import type {SupplierSettlement,SettlementStatus,SupplierPayoutProvider} from './settlementDomain.js';
import type {SettlementRepository} from './settlementRepository.js';
import type {SettlementPayoutAttemptRepository} from './settlementPayoutAttemptRepository.js';

export type SettlementOperation='RETRY'|'HOLD'|'RELEASE'|'RECONCILE';
const retryDelayMs=(attempt:number)=>Math.min(24*60*60*1000,Math.max(60*1000,2**Math.min(attempt,10)*60*1000));

export async function processSettlement(settlement:SupplierSettlement,repository:SettlementRepository,provider:SupplierPayoutProvider,attempts?:SettlementPayoutAttemptRepository){
  if(settlement.status!=='ELIGIBLE'&&settlement.status!=='FAILED') throw new Error(settlement.status==='HELD'?'SETTLEMENT_HELD':'SETTLEMENT_NOT_PROCESSABLE');
  if(settlement.nextRetryAt&&new Date(settlement.nextRetryAt).getTime()>Date.now()) throw new Error('SETTLEMENT_RETRY_BACKOFF');
  const attempt=(settlement.payoutAttempts??0)+1;
  const idempotencyKey=settlement.payoutIdempotencyKey??`settlement-payout-${settlement.id}`;
  const nextRetryAt=new Date(Date.now()+retryDelayMs(attempt)).toISOString();
  const attemptRecord=attempts?await attempts.create({settlementId:settlement.id,attemptNo:attempt,idempotencyKey,provider:provider.name,status:'PROCESSING'}):null;
  await repository.recordPayoutAttempt(settlement.id,nextRetryAt);
  if(settlement.status==='FAILED') await repository.updateStatus(settlement.id,'PROCESSING');
  else if(settlement.status==='ELIGIBLE') await repository.updateStatus(settlement.id,'PROCESSING');
  const current=await repository.getById(settlement.id);
  if(!current) throw new Error('SETTLEMENT_NOT_FOUND');
  const result=await provider.initiatePayout({settlementId:current.id,supplierId:current.supplierId,amountMinor:current.netAmountMinor,currency:current.currency,reference:`SETTLEMENT-${current.id}`,idempotencyKey});
  const status:SettlementStatus=result.status==='PAID'?'PAID':result.status==='FAILED'?'FAILED':'PROCESSING';
  if(attemptRecord) await attempts!.update(attemptRecord.id,status,result.payoutReference,result.failureReason);
  return repository.updateStatus(current.id,status,result.payoutReference,result.failureReason);
}

export async function retryFailedSettlement(id:string,repository:SettlementRepository,provider:SupplierPayoutProvider,attempts?:SettlementPayoutAttemptRepository){
  const settlement=await repository.getById(id);
  if(!settlement) throw new Error('SETTLEMENT_NOT_FOUND');
  if(settlement.status!=='FAILED') throw new Error('SETTLEMENT_NOT_FAILED');
  return processSettlement(settlement,repository,provider,attempts);
}

export async function holdSettlement(id:string,repository:SettlementRepository){
  const settlement=await repository.getById(id);
  if(!settlement) throw new Error('SETTLEMENT_NOT_FOUND');
  return repository.updateStatus(id,'HELD');
}

export async function releaseSettlement(id:string,repository:SettlementRepository,process=false,provider?:SupplierPayoutProvider,attempts?:SettlementPayoutAttemptRepository){
  const settlement=await repository.getById(id);
  if(!settlement) throw new Error('SETTLEMENT_NOT_FOUND');
  if(settlement.status!=='HELD') throw new Error('SETTLEMENT_NOT_HELD');
  const released=await repository.updateStatus(id,'ELIGIBLE');
  if(process&&provider&&released) return processSettlement(released,repository,provider,attempts);
  return released;
}

export async function reconcileSettlements(repository:SettlementRepository,provider:SupplierPayoutProvider,attempts?:SettlementPayoutAttemptRepository){
  const settlements=await repository.listAll();
  const actionable=settlements.filter(x=>(x.status==='ELIGIBLE'||x.status==='FAILED')&&(!x.nextRetryAt||new Date(x.nextRetryAt).getTime()<=Date.now()));
  const results:any[]=[];
  for(const settlement of settlements.filter(x=>x.status==='PROCESSING')) results.push({id:settlement.id,status:'PROCESSING',action:'AWAITING_PROVIDER_CONFIRMATION'});
  for(const settlement of actionable){
    try{results.push(await processSettlement(settlement,repository,provider,attempts));}
    catch(error:any){results.push({id:settlement.id,status:'ERROR',error:String(error?.message??error)});}
  }
  return results;
}
