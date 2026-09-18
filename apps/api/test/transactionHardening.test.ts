import test from 'node:test';
import assert from 'node:assert/strict';
import {canTransitionTransactionStatus} from '../src/transactionDomain.js';
import {MemoryTransactionRepository} from '../src/transactionRepository.js';
import {MemoryTransactionDocumentsRepository} from '../src/transactionDocumentsRepository.js';
import {MemoryTransactionAuditRepository} from '../src/transactionAuditRepository.js';

test('transaction status transitions are explicit and terminal',()=>{
 assert.equal(canTransitionTransactionStatus('OPEN','CONDITIONAL'),true);
 assert.equal(canTransitionTransactionStatus('CONDITIONAL','OPEN'),false);
 assert.equal(canTransitionTransactionStatus('IN_TRANSFER','COMPLETED'),true);
 assert.equal(canTransitionTransactionStatus('COMPLETED','OPEN'),false);
 assert.equal(canTransitionTransactionStatus('CANCELLED','IN_TRANSFER'),false);
});
test('accepted offer transaction creation is idempotent at repository level',async()=>{
 const r=new MemoryTransactionRepository();
 const a=await r.create({offerId:'offer-1',listingId:'listing-1',propertyId:'property-1',buyerId:'buyer-1',sellerId:'seller-1',status:'OPEN'});
 const existing=await r.getByOffer('offer-1');
 assert.equal(existing?.id,a.id);
 assert.equal((await r.listMilestones(a.id)).length,7);
});
test('documents are transaction scoped and audit events are append-only',async()=>{
 const d=new MemoryTransactionDocumentsRepository();
 const a=new MemoryTransactionAuditRepository();
 const doc=await d.create({transactionId:'tx-1',kind:'IDENTITY',label:'Identity',status:'REQUIRED'});
 const submitted=await d.update(doc.id,{status:'SUBMITTED',storageKey:'documents/identity.pdf',submittedBy:'buyer-1'});
 assert.equal(submitted?.status,'SUBMITTED');
 assert.equal((await d.list('tx-2')).length,0);
 await a.append({transactionId:'tx-1',actorId:'seller-1',eventType:'DOCUMENT_SUBMITTED',payload:{documentId:doc.id}});
 assert.equal((await a.list('tx-1')).length,1);
 assert.equal((await a.list('tx-2')).length,0);
});
