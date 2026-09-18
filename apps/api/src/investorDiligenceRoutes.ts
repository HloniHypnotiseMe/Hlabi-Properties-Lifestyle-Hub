import type {Express,RequestHandler} from 'express';
import {authenticatedPrincipal} from './authentication.js';
import type {ListingRepository} from './listingRepository.js';
import type {InvestorDiligenceRepository} from './investorDiligenceRepository.js';
import {calculateAcquisitionMetrics} from './investorDiligenceDomain.js';

const kinds=['PROPERTY_FACTS','OWNERSHIP','OCCUPANCY','RENTAL_INCOME','OPERATING_EXPENSES','COMPLIANCE','VALUATION','DOCUMENT'] as const;
const statuses=['MISSING','CAPTURED'] as const;

export function registerInvestorDiligenceRoutes(app:Express,auth:RequestHandler,listings:ListingRepository,diligence:InvestorDiligenceRepository){
 app.get('/api/v1/investor/diligence/:listingId',auth,async(req,res)=>{
  const p=authenticatedPrincipal(res);if(p.role!=='INVESTOR')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
  const listing=(await listings.listPublic({})).find(x=>x.id===req.params.listingId);if(!listing)return res.status(404).json({error:'LISTING_NOT_FOUND'});
  const evidence=await diligence.list(p.userId,listing.id);const byKind=new Map(evidence.map(x=>[x.kind,x]));
  const rent=Number(byKind.get('RENTAL_INCOME')?.value);const expenses=Number(byKind.get('OPERATING_EXPENSES')?.value);
  const metrics=calculateAcquisitionMetrics({askingPriceCents:listing.askingPriceCents,annualRentCents:byKind.get('RENTAL_INCOME')?.status==='VERIFIED'&&Number.isFinite(rent)&&rent>0?rent:undefined,annualExpensesCents:byKind.get('OPERATING_EXPENSES')?.status==='VERIFIED'&&Number.isFinite(expenses)&&expenses>=0?expenses:undefined});
  return res.json({listing,evidence,metrics,nextAction:evidence.some(x=>x.status==='VERIFIED')?'Complete remaining diligence evidence before offer.':'Capture evidence, then request authorized verification before relying on acquisition metrics.'});
 });
 app.put('/api/v1/investor/diligence/:listingId/:kind',auth,async(req,res)=>{
  const p=authenticatedPrincipal(res);if(p.role!=='INVESTOR')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
  if(!kinds.includes(req.params.kind as any))return res.status(400).json({error:'INVALID_EVIDENCE_KIND'});
  if(!statuses.includes(req.body?.status))return res.status(400).json({error:'INVALID_EVIDENCE_STATUS'});
  const listing=(await listings.listPublic({})).find(x=>x.id===req.params.listingId);if(!listing)return res.status(404).json({error:'LISTING_NOT_FOUND'});
  const value=typeof req.body?.value==='string'?req.body.value.slice(0,200):undefined;
  if(req.body.status==='CAPTURED'&&!value&&req.params.kind!=='PROPERTY_FACTS')return res.status(400).json({error:'CAPTURED_EVIDENCE_REQUIRES_VALUE'});
  return res.json(await diligence.upsert({investorId:p.userId,listingId:listing.id,kind:req.params.kind as any,status:req.body.status,label:typeof req.body?.label==='string'?req.body.label.slice(0,160):req.params.kind,value,source:typeof req.body?.source==='string'?req.body.source.slice(0,500):undefined,notes:typeof req.body?.notes==='string'?req.body.notes.slice(0,1000):undefined}));
 });
 app.post('/api/v1/agent/investor/diligence/:listingId/:kind/verify',auth,async(req,res)=>{
  const p=authenticatedPrincipal(res);if(p.role!=='AGENT'&&p.role!=='ADMIN')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
  if(!kinds.includes(req.params.kind as any))return res.status(400).json({error:'INVALID_EVIDENCE_KIND'});
  const listing=(await listings.listPublic({})).find(x=>x.id===req.params.listingId);if(!listing)return res.status(404).json({error:'LISTING_NOT_FOUND'});
  const investorId=typeof req.body?.investorId==='string'?req.body.investorId:'';const source=typeof req.body?.source==='string'?req.body.source.trim().slice(0,500):'';
  if(!investorId)return res.status(400).json({error:'INVESTOR_ID_REQUIRED'});if(!source)return res.status(400).json({error:'VERIFICATION_SOURCE_REQUIRED'});
  const prior=(await diligence.list(investorId,listing.id)).find(x=>x.kind===req.params.kind);if(!prior)return res.status(404).json({error:'EVIDENCE_NOT_CAPTURED'});
  return res.json(await diligence.upsert({...prior,status:'VERIFIED',source,verifiedAt:new Date().toISOString(),verifiedBy:p.userId}));
 });
}
