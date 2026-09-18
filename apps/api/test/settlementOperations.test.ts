import test from 'node:test';
import assert from 'node:assert/strict';
import {MemorySettlementRepository} from '../src/settlementRepository.js';
import {retryFailedSettlement,holdSettlement,releaseSettlement,reconcileSettlements} from '../src/settlementOperations.js';
import type {SupplierPayoutProvider} from '../src/settlementDomain.js';

const provider:SupplierPayoutProvider={name:'test',async initiatePayout(input){return {status:'PAID',payoutReference:`payout-${input.settlementId}`}}};

async function seed(status:'ELIGIBLE'|'FAILED'|'PROCESSING'|'HELD'='ELIGIBLE'){
 const r=new MemorySettlementRepository();
 const s=await r.create({jobId:crypto.randomUUID(),quoteId:'q',supplierId:'supplier',paymentTransactionId:crypto.randomUUID(),grossAmountMinor:1000,platformFeeMinor:100,currency:'ZAR',status});
 return {r,s};
}

test('retry only processes FAILED settlements',async()=>{const {r,s}=await seed('FAILED');const out=await retryFailedSettlement(s.id,r,provider);assert.equal(out?.status,'PAID');assert.equal(out?.payoutReference,`payout-${s.id}`)});
test('hold and release are explicit operations',async()=>{const {r,s}=await seed();await holdSettlement(s.id,r);assert.equal((await r.getById(s.id))?.status,'HELD');await releaseSettlement(s.id,r);assert.equal((await r.getById(s.id))?.status,'ELIGIBLE')});
test('reconciliation does not re-submit PROCESSING payouts',async()=>{const {r}=await seed('PROCESSING');const out=await reconcileSettlements(r,provider);assert.deepEqual(out,[{id:(await r.listAll())[0].id,status:'PROCESSING',action:'AWAITING_PROVIDER_CONFIRMATION'}])});
test('supplier-scoped listAll filtering works',async()=>{const {r,s}=await seed();await r.create({jobId:crypto.randomUUID(),quoteId:'q2',supplierId:'other',paymentTransactionId:crypto.randomUUID(),grossAmountMinor:2000,platformFeeMinor:0,currency:'ZAR',status:'ELIGIBLE'});assert.equal((await r.listAll({supplierId:s.supplierId})).length,1);assert.equal((await r.listAll({status:'ELIGIBLE'})).length,2)});

test('payout attempts use a stable idempotency key and backoff',async()=>{const {r,s}=await seed('ELIGIBLE');let key='';const p2:SupplierPayoutProvider={name:'test',async initiatePayout(input){key=input.idempotencyKey??'';return {status:'FAILED',failureReason:'TEMPORARY'}}};const out=await import('../src/settlementOperations.js').then(x=>x.processSettlement(s,r,p2));assert.equal(out?.status,'FAILED');assert.equal(key,`settlement-payout-${s.id}`);const saved=await r.getById(s.id);assert.equal(saved?.payoutAttempts,1);assert.ok(saved?.nextRetryAt)});
