import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {requireAuthentication,DevelopmentAuthenticationProvider} from '../src/authentication.js';
import {registerTransactionRoutes} from '../src/transactionRoutes.js';
import {MemoryTransactionInterestRepository} from '../src/transactionInterestRepository.js';
import {MemoryTransactionRepository} from '../src/transactionRepository.js';
import {MemoryAgentRepository} from '../src/agentRepository.js';
import {MemoryTransactionDocumentsRepository} from '../src/transactionDocumentsRepository.js';
import {MemoryTransactionAuditRepository} from '../src/transactionAuditRepository.js';
import {MemoryAgentPropertyAccessRepository} from '../src/agentPropertyAccessRepository.js';
import {FileSystemTransactionDocumentStorage} from '../src/transactionDocumentStorage.js';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';

const seller='seller-integration';const buyer='buyer-integration';const agent='agent-integration';

async function harness(){
 const app=express();app.use(express.json({limit:'12mb'}));
 const interest=new MemoryTransactionInterestRepository();const tx=new MemoryTransactionRepository();const agents=new MemoryAgentRepository();const docs=new MemoryTransactionDocumentsRepository();const audit=new MemoryTransactionAuditRepository();const access=new MemoryAgentPropertyAccessRepository();const root=await mkdtemp(join(tmpdir(),'hlabi-tx-api-'));const storage=new FileSystemTransactionDocumentStorage(root);
 registerTransactionRoutes(app,requireAuthentication(new DevelopmentAuthenticationProvider()),interest,tx,agents,docs,audit,access,storage);
 const server=await new Promise<any>(resolve=>{const s=app.listen(0,()=>resolve(s));});
 const base='http://127.0.0.1:'+server.address().port;
 const request=async(path:string,options:any={})=>fetch(base+path,{...options,headers:{'Content-Type':'application/json','x-hlabi-user-id':options.userId??seller,'x-hlabi-role':options.role??'SELLER',...(options.headers??{})}});
 return {interest,agents,access,server,request,root};
}
test('transaction API completes accepted-offer to document verification and completion',async()=>{
 const h=await harness();try{
  const offer=await h.interest.createOffer({leadId:'lead-1',listingId:'listing-1',propertyId:'property-1',buyerId:buyer,amountCents:1500000,conditions:[],status:'ACCEPTED',sellerId:seller} as any);
  let r=await h.request('/api/v1/seller/offers/'+offer.id+'/accept-transaction',{method:'POST',body:JSON.stringify({confirm:true})});assert.equal(r.status,201);const created=await r.json();assert.equal(created.status,'OPEN');assert.equal(created.milestones.length,7);assert.equal(created.documents.length,6);
  r=await h.request('/api/v1/seller/offers/'+offer.id+'/accept-transaction',{method:'POST',body:JSON.stringify({confirm:true}));assert.equal(r.status,200);const same=await r.json();assert.equal(same.id,created.id);
  const staff=await h.agents.createStaff({ownerId:seller,userId:agent,name:'Integration Agent',role:'AGENT',status:'ACTIVE'} as any);
  await h.access.grant({agentId:staff.id,ownerId:seller,propertyId:'property-1',grantedBy:seller});
  r=await h.request('/api/v1/transactions/'+created.id+'/agent',{method:'POST',body:JSON.stringify({agentId:staff.id})});assert.equal(r.status,200);
  const bytes=Buffer.from('verified identity evidence');r=await h.request('/api/v1/transactions/'+created.id+'/documents/upload',{method:'POST',body:JSON.stringify({kind:'IDENTITY',label:'Identity documents',fileName:'identity.txt',contentType:'text/plain',contentBase64:bytes.toString('base64')})});assert.equal(r.status,200);const doc=await r.json();assert.equal(doc.status,'SUBMITTED');assert.ok(doc.storageKey);
  r=await h.request('/api/v1/transactions/'+created.id+'/documents/'+doc.id+'/download',{method:'GET'});assert.equal(r.status,200);assert.equal(await r.text(),'verified identity evidence');
  r=await h.request('/api/v1/transactions/'+created.id+'/documents/'+doc.id+'/status',{method:'POST',role:'AGENT',userId:staff.id,body:JSON.stringify({status:'VERIFIED'})});assert.equal(r.status,200);const verified=await r.json();assert.equal(verified.status,'VERIFIED');assert.equal(verified.verifiedBy,staff.id);
  r=await h.request('/api/v1/transactions/'+created.id+'/status',{method:'POST',role:'SELLER',userId:seller,body:JSON.stringify({status:'CONDITIONAL',confirm:true})});assert.equal(r.status,200);
  r=await h.request('/api/v1/transactions/'+created.id+'/status',{method:'POST',role:'SELLER',userId:seller,body:JSON.stringify({status:'IN_TRANSFER',confirm:true})});assert.equal(r.status,200);
  r=await h.request('/api/v1/transactions/'+created.id+'/status',{method:'POST',role:'SELLER',userId:seller,body:JSON.stringify({status:'COMPLETED',confirm:true})});assert.equal(r.status,200);assert.equal((await r.json()).status,'COMPLETED');
  const events=await h.request('/api/v1/transactions/'+created.id,{method:'GET'});assert.equal(events.status,200);const detail=await events.json();assert.ok(detail.audit.some((x:any)=>x.eventType==='DOCUMENT_UPLOADED'));assert.ok(detail.audit.some((x:any)=>x.eventType==='DOCUMENT_DOWNLOADED'));assert.ok(detail.audit.some((x:any)=>x.eventType==='DOCUMENT_STATUS_CHANGED'));assert.ok(detail.audit.some((x:any)=>x.eventType==='TRANSACTION_STATUS_CHANGED'));
 }finally{h.server.close();await rm(h.root,{recursive:true,force:true});}
});
test('transaction API blocks unrelated actors and unassigned agents',async()=>{
 const h=await harness();try{
  const offer=await h.interest.createOffer({leadId:'lead-2',listingId:'listing-2',propertyId:'property-2',buyerId:buyer,amountCents:100,conditions:[],status:'ACCEPTED',sellerId:seller} as any);
  const r=await h.request('/api/v1/seller/offers/'+offer.id+'/accept-transaction',{method:'POST',body:JSON.stringify({confirm:true})});const item=await r.json();
  let denied=await h.request('/api/v1/transactions/'+item.id,{method:'GET',role:'BUYER',userId:'other-buyer'});assert.equal(denied.status,404);
  const agent2=await h.agents.createStaff({ownerId:seller,userId:'agent-2',name:'Other Agent',role:'AGENT',status:'ACTIVE'} as any);
  denied=await h.request('/api/v1/transactions/'+item.id+'/documents/upload',{method:'POST',role:'AGENT',userId:agent2.id,body:JSON.stringify({kind:'IDENTITY',label:'Identity documents',fileName:'x.txt',contentType:'text/plain',contentBase64:Buffer.from('x').toString('base64')})});assert.equal(denied.status,404);
 }finally{h.server.close();await rm(h.root,{recursive:true,force:true});}
});
