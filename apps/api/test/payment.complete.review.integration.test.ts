import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { RequestHandler } from 'express';
import { MemoryHomeownerRepository } from '../src/repository.js';
import { MemoryJobRepository } from '../src/jobRepository.js';
import { MemoryBillingRepository } from '../src/billingRepository.js';
import { MemoryReputationRepository } from '../src/reputationRepository.js';
import { registerReputationRoutes } from '../src/reputationRoutes.js';

const OWNER='demo-homeowner';
const PROPERTY='demo-property-1';

function appFor(jobs:MemoryJobRepository,billing:MemoryBillingRepository,reputation:MemoryReputationRepository){
  const app=express(); app.use(express.json());
  const auth:RequestHandler=(_req,res,next)=>{res.locals.principal={userId:OWNER,role:'HOMEOWNER'};next();};
  registerReputationRoutes(app,auth,reputation,new MemoryHomeownerRepository(),jobs,billing);
  return app;
}

test('Pay → Complete → Review is server-gated end to end',async()=>{
  const jobs=new MemoryJobRepository(); const billing=new MemoryBillingRepository(); const reputation=new MemoryReputationRepository();
  jobs.seedQuote({id:'quote-1',ownerId:OWNER,propertyId:PROPERTY,supplierId:'supplier-1'});
  const job=await jobs.createJobFromQuote({quoteId:'quote-1',ownerId:OWNER,details:{quoteRequestId:'request-1'}});
  assert.ok(job);
  const app=appFor(jobs,billing,reputation); const server=app.listen(0);
  await new Promise<void>(resolve=>server.once('listening',resolve));
  const address=server.address(); const base=`http://127.0.0.1:${typeof address==='object'&&address?address.port:0}`;
  try{
    let r=await fetch(`${base}/api/v1/homeowner/reputation/reviews`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({propertyId:PROPERTY,jobId:job!.id,rating:5,comment:'Great work'})});
    assert.equal(r.status,409); assert.equal((await r.json()).error,'JOB_NOT_COMPLETED');

    const paid=await billing.createTransaction({ownerId:OWNER,propertyId:PROPERTY,jobId:job!.id,provider:'test',reference:'JOB-'+job!.id,amountMinor:10000,currency:'ZAR',status:'SUCCEEDED',idempotencyKey:'JOB-'+job!.id});
    assert.equal(paid.status,'SUCCEEDED');

    r=await fetch(`${base}/api/v1/homeowner/reputation/reviews`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({propertyId:PROPERTY,jobId:job!.id,rating:5})});
    assert.equal(r.status,409); assert.equal((await r.json()).error,'JOB_NOT_COMPLETED');

    assert.equal((await jobs.updateJobStatus(job!.id,OWNER,'SCHEDULED',new Date().toISOString()))?.status,'SCHEDULED');
    assert.equal((await jobs.updateJobStatus(job!.id,OWNER,'IN_PROGRESS'))?.status,'IN_PROGRESS');
    assert.equal((await jobs.updateJobStatus(job!.id,OWNER,'AWAITING_EVIDENCE'))?.status,'AWAITING_EVIDENCE');
    assert.equal((await jobs.updateJobStatus(job!.id,OWNER,'COMPLETED'))?.status,'COMPLETED');

    r=await fetch(`${base}/api/v1/homeowner/reputation/reviews`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({propertyId:PROPERTY,jobId:job!.id,rating:5,comment:'Great work'})});
    assert.equal(r.status,201); const review=await r.json(); assert.equal(review.jobId,job!.id); assert.equal(review.status,'PENDING');
  } finally { server.close(); }
});
