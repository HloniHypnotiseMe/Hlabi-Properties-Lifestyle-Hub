import type {Express,RequestHandler} from 'express';
import {z} from 'zod';
import {authenticatedPrincipal} from './authentication.js';
import type {TransactionInterestRepository} from './transactionInterestRepository.js';
import type {TransactionRepository} from './transactionRepository.js';
import {canTransitionTransactionStatus,transactionStatuses,transactionMilestoneStatuses} from './transactionDomain.js';
import type {AgentRepository} from './agentRepository.js';
import type {TransactionDocumentsRepository} from './transactionDocumentsRepository.js';
import {transactionDocumentKinds,transactionDocumentStatuses} from './transactionDocumentsDomain.js';
import type {TransactionAuditRepository} from './transactionAuditRepository.js';
import {canActorAccessTransaction} from './transactionAuthorization.js';
import type {AgentPropertyAccessRepository} from './agentPropertyAccessRepository.js';

const initialDocuments=[['OFFER_ACCEPTANCE','Offer acceptance'],['IDENTITY','Identity documents'],['FINANCE','Finance / proof of funds'],['COMPLIANCE','Compliance documents'],['TRANSFER','Transfer / registration documents'],['OTHER','Other transaction documents']] as const;

export function registerTransactionRoutes(app:Express,auth:RequestHandler,interest:TransactionInterestRepository,tx:TransactionRepository,agents:AgentRepository,documents:TransactionDocumentsRepository,audit:TransactionAuditRepository,propertyAccess:AgentPropertyAccessRepository){
 const actorAllowed=(p:any,item:any)=>canActorAccessTransaction(p,item);
 const seedDocuments=async(transactionId:string)=>{for(const [kind,label] of initialDocuments){if(!(await documents.list(transactionId)).some(x=>x.kind===kind))await documents.create({transactionId,kind,status:'REQUIRED',label});}};
 const record=async(transactionId:string,actorId:string,eventType:string,payload:Record<string,unknown>={})=>audit.append({transactionId,actorId,eventType,payload});
 app.post('/api/v1/seller/offers/:offerId/accept-transaction',auth,async(req,res)=>{
  const p=authenticatedPrincipal(res);if(p.role!=='SELLER')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});if(req.body?.confirm!==true)return res.status(400).json({error:'CONFIRMATION_REQUIRED'});
  const offer=(await interest.listOffersForSeller(p.userId)).find(x=>x.id===req.params.offerId);if(!offer)return res.status(404).json({error:'OFFER_NOT_FOUND'});if(offer.status!=='ACCEPTED')return res.status(409).json({error:'OFFER_NOT_ACCEPTED'});
  const existing=await tx.getByOffer(offer.id);if(existing){await seedDocuments(existing.id);return res.json({...existing,milestones:await tx.listMilestones(existing.id),documents:await documents.list(existing.id)})}
  const item=await tx.create({offerId:offer.id,listingId:offer.listingId,propertyId:offer.propertyId,buyerId:offer.buyerId,sellerId:p.userId,status:'OPEN'});await seedDocuments(item.id);await record(item.id,p.userId,'TRANSACTION_CREATED',{offerId:offer.id});
  return res.status(201).json({...item,milestones:await tx.listMilestones(item.id),documents:await documents.list(item.id)});
 });
 app.get('/api/v1/transactions',auth,async(req,res)=>{const p=authenticatedPrincipal(res);if(!['BUYER','SELLER','AGENT','ADMIN'].includes(p.role))return res.status(403).json({error:'ROLE_NOT_ALLOWED'});return res.json(await tx.listForUser(p.userId))});
 app.get('/api/v1/transactions/:id',auth,async(req,res)=>{const p=authenticatedPrincipal(res);const item=await tx.get(req.params.id);if(!item||!actorAllowed(p,item))return res.status(404).json({error:'TRANSACTION_NOT_FOUND'});await seedDocuments(item.id);return res.json({...item,milestones:await tx.listMilestones(item.id),documents:await documents.list(item.id),audit:await audit.list(item.id)})});
 app.post('/api/v1/transactions/:id/agent',auth,async(req,res)=>{
  const p=authenticatedPrincipal(res);if(p.role!=='SELLER'&&p.role!=='ADMIN')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});const item=await tx.get(req.params.id);if(!item||p.role==='SELLER'&&item.sellerId!==p.userId)return res.status(404).json({error:'TRANSACTION_NOT_FOUND'});
  if(typeof req.body?.agentId!=='string')return res.status(400).json({error:'AGENT_REQUIRED'});
  const staff=await agents.getStaffForOwner(req.body.agentId,item.sellerId);if(!staff||staff.status!=='ACTIVE')return res.status(400).json({error:'INVALID_AGENT'});const access=await propertyAccess.getActive(req.body.agentId,item.sellerId,item.propertyId);if(!access)return res.status(403).json({error:'AGENT_PROPERTY_ACCESS_REQUIRED'});
  const updated=await tx.update(item.id,{agentId:req.body.agentId});if(updated)await record(item.id,p.userId,'AGENT_ASSIGNED',{agentId:req.body.agentId});return res.json(updated);
 });
 app.post('/api/v1/transactions/:id/status',auth,async(req,res)=>{
  const p=authenticatedPrincipal(res);const item=await tx.get(req.params.id);if(!item||!actorAllowed(p,item))return res.status(404).json({error:'TRANSACTION_NOT_FOUND'});if(req.body?.confirm!==true)return res.status(400).json({error:'CONFIRMATION_REQUIRED'});
  if(!transactionStatuses.includes(req.body?.status))return res.status(400).json({error:'INVALID_STATUS'});if(!canTransitionTransactionStatus(item.status,req.body.status))return res.status(409).json({error:'INVALID_STATUS_TRANSITION',from:item.status,to:req.body.status});
  const updated=await tx.update(item.id,{status:req.body.status,completedAt:req.body.status==='COMPLETED'?new Date().toISOString():undefined});if(updated)await record(item.id,p.userId,'TRANSACTION_STATUS_CHANGED',{from:item.status,to:updated.status});return res.json(updated);
 });
 app.post('/api/v1/transactions/:id/milestones/:milestoneId',auth,async(req,res)=>{
  const p=authenticatedPrincipal(res);const item=await tx.get(req.params.id);if(!item||!actorAllowed(p,item))return res.status(404).json({error:'TRANSACTION_NOT_FOUND'});
  const body=z.object({status:z.enum(transactionMilestoneStatuses),notes:z.string().max(2000).optional()}).safeParse(req.body);if(!body.success)return res.status(400).json({error:'INVALID_MILESTONE'});
  const milestone=(await tx.listMilestones(item.id)).find(x=>x.id===req.params.milestoneId);if(!milestone)return res.status(404).json({error:'MILESTONE_NOT_FOUND'});
  const updated=await tx.updateMilestone(milestone.id,body.data.status,body.data.notes);if(updated)await record(item.id,p.userId,'MILESTONE_CHANGED',{milestoneId:milestone.id,status:updated.status});return res.json(updated);
 });
 app.post('/api/v1/transactions/:id/documents',auth,async(req,res)=>{
  const p=authenticatedPrincipal(res);const item=await tx.get(req.params.id);if(!item||!actorAllowed(p,item))return res.status(404).json({error:'TRANSACTION_NOT_FOUND'});
  const body=z.object({kind:z.enum(transactionDocumentKinds),label:z.string().min(2).max(160),storageKey:z.string().min(1).max(1000),notes:z.string().max(2000).optional()}).safeParse(req.body);if(!body.success)return res.status(400).json({error:'INVALID_DOCUMENT'});
  const existing=(await documents.list(item.id)).find(x=>x.kind===body.data.kind);let doc=existing?await documents.update(existing.id,{status:'SUBMITTED',storageKey:body.data.storageKey,notes:body.data.notes,submittedBy:p.userId}):await documents.create({transactionId:item.id,kind:body.data.kind,label:body.data.label,status:'SUBMITTED',storageKey:body.data.storageKey,notes:body.data.notes,submittedBy:p.userId});
  if(doc)await record(item.id,p.userId,'DOCUMENT_SUBMITTED',{documentId:doc.id,kind:doc.kind});return res.status(existing?200:201).json(doc);
 });
 app.post('/api/v1/transactions/:id/documents/:documentId/status',auth,async(req,res)=>{
  const p=authenticatedPrincipal(res);const item=await tx.get(req.params.id);if(!item||!actorAllowed(p,item))return res.status(404).json({error:'TRANSACTION_NOT_FOUND'});
  if(p.role!=='AGENT'&&p.role!=='ADMIN')return res.status(403).json({error:'REVIEWER_REQUIRED'});if(p.role==='AGENT'&&item.agentId!==p.userId)return res.status(403).json({error:'ASSIGNED_AGENT_REQUIRED'});
  const body=z.object({status:z.enum(transactionDocumentStatuses),notes:z.string().max(2000).optional()}).safeParse(req.body);if(!body.success)return res.status(400).json({error:'INVALID_DOCUMENT_STATUS'});
  const doc=(await documents.list(item.id)).find(x=>x.id===req.params.documentId);if(!doc)return res.status(404).json({error:'DOCUMENT_NOT_FOUND'});
  if(body.data.status==='VERIFIED'&&doc.status!=='SUBMITTED')return res.status(409).json({error:'DOCUMENT_NOT_SUBMITTED'});
  const updated=await documents.update(doc.id,{status:body.data.status,notes:body.data.notes,verifiedBy:body.data.status==='VERIFIED'?p.userId:undefined,verifiedAt:body.data.status==='VERIFIED'?new Date().toISOString():undefined});if(updated)await record(item.id,p.userId,'DOCUMENT_STATUS_CHANGED',{documentId:doc.id,from:doc.status,to:updated.status});return res.json(updated);
 });
}