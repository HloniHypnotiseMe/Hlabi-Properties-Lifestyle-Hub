import type {SupplierSettlement,SettlementStatus,SupplierPayoutProvider} from './settlementDomain.js';
import type {SettlementRepository} from './settlementRepository.js';

export type SettlementOperation='RETRY'|'HOLD'|'RELEASE'|'RECONCILE';

export async function processSettlement(settlement:SupplierSettlement,repository:SettlementRepository,provider:SupplierPayoutProvider){
  if(settlement.status!=='ELIGIBLE'&&settlement.status!=='FAILED') throw new Error(settlement.status==='HELD'?'SETTLEMENT_HELD':'SETTLEMENT_NOT_PROCESSABLE');
  if(settlement.status==='FAILED') await repository.updateStatus(settlement.id,'PROCESSING');
  else if(settlement.status==='ELIGIBLE') await repository.updateStatus(settlement.id,'PROCESSING');
  const current=await repository.getById(settlement.id);
  if(!current) throw new Error('SETTLEMENT_NOT_FOUND');
  const result=await provider.initiatePayout({settlementId:current.id,supplierId:current.supplierId,amountMinor:current.netAmountMinor,currency:current.currency,reference:`SETTLEMENT-${current.id}`});
  const status:SettlementStatus=result.status==='PAID'?'PAID':result.status==='FAILED'?'FAILED':'PROCESSING';
  return repository.updateStatus(current.id,status,result.payoutReference,result.failureReason);
}

export async function retryFailedSettlement(id:string,repository:SettlementRepository,provider:SupplierPayoutProvider){
  const settlement=await repository.getById(id);
  if(!settlement) throw new Error('SETTLEMENT_NOT_FOUND');
  if(settlement.status!=='FAILED') throw new Error('SETTLEMENT_NOT_FAILED');
  return processSettlement(settlement,repository,provider);
}

export async function holdSettlement(id:string,repository:SettlementRepository){
  const settlement=await repository.getById(id);
  if(!settlement) throw new Error('SETTLEMENT_NOT_FOUND');
  return repository.updateStatus(id,'HELD');
}

export async function releaseSettlement(id:string,repository:SettlementRepository,process=false,provider?:SupplierPayoutProvider){
  const settlement=await repository.getById(id);
  if(!settlement) throw new Error('SETTLEMENT_NOT_FOUND');
  if(settlement.status!=='HELD') throw new Error('SETTLEMENT_NOT_HELD');
  const released=await repository.updateStatus(id,'ELIGIBLE');
  if(process&&provider&&released) return processSettlement(released,repository,provider);
  return released;
}

export async function reconcileSettlements(repository:SettlementRepository,provider:SupplierPayoutProvider){
  const settlements=await repository.listAll();
  const actionable=settlements.filter(x=>x.status==='ELIGIBLE'||x.status==='FAILED');
  const results:any[]=[];
  for(const settlement of settlements.filter(x=>x.status==='PROCESSING')) results.push({id:settlement.id,status:'PROCESSING',action:'AWAITING_PROVIDER_CONFIRMATION'});
  for(const settlement of actionable){
    try{results.push(await processSettlement(settlement,repository,provider));}
    catch(error:any){results.push({id:settlement.id,status:'ERROR',error:String(error?.message??error)});}
  }
  return results;
}
