import type {Express,RequestHandler} from 'express';
import {authenticatedPrincipal} from './authentication.js';
import type {ListingRepository} from './listingRepository.js';
import type {InvestorDiligenceRepository} from './investorDiligenceRepository.js';
import {calculateAcquisitionMetrics} from './investorDiligenceDomain.js';

const kinds=['PROPERTY_FACTS','OWNERSHIP','OCCUPANCY','RENTAL_INCOME','OPERATING_EXPENSES','COMPLIANCE','VALUATION','DOCUMENT'] as const;
const statuses=['MISSING','CAPTURED','VERIFIED'] as const;

export function registerInvestorDiligenceRoutes(app:Express,auth:RequestHandler,listings:ListingRepository,diligence:InvestorDiligenceRepository){
 app.get('/api/v1/investor/diligence/:listingId',auth,async(req,res)=>{
  const p=authenticatedPrincipal(res); if(p.role!=='INVESTOR')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
  const listing=(await listings.listPublic({})).find(x=>x.id===req.params.listingId); if(!listing)return res.status(404).json({error:'LISTING_NOT_FOUND'});
  const evidence=await diligence.list(p.userId,listing.id);
  const byKind=new Map(evidence.map(x=>[x.kind,x]));
  const annualRent=Number(byKind.get('RENTAL_INCOME')?.value); const annualExpenses=Number(byKind.get('OPERATING_EXPENSES')?.value);
  const metrics=calculateAcquisitionMetrics({askingPriceCents:listing.askingPriceCents,annualRentCents:Number.isFinite(annualRent)&&annualRent>0?annualRent:undefined,annualExpensesCents:Number.isFinite(annualExpenses)&&annualExpenses>=0?annualExpenses:undefined});
  return res.json({listing,evidence,metrics,nextAction:evidence.some(x=>x.status==='VERIFIED')?'Complete remaining diligence evidence before offer.':'Capture and verify ownership, income, expenses and compliance evidence before relying on acquisition metrics.'});
 });
 app.put('/api/v1/investor/diligence/:listingId/:kind',auth,async(req,res)=>{
  const p=authenticatedPrincipal(res); if(p.role!=='INVESTOR')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
  if(!kinds.includes(req.params.kind as any))return res.status(400).json({error:'INVALID_EVIDENCE_KIND'});
  if(!statuses.includes(req.body?.status))return res.status(400).json({error:'INVALID_EVIDENCE_STATUS'});
  const listing=(await listings.listPublic({})).find(x=>x.id===req.params.listingId); if(!listing)return res.status(404).json({error:'LISTING_NOT_FOUND'});
  const value=typeof req.body?.value==='string'?req.body.value.slice(0,200):undefined;
  if((req.body.status==='VERIFIED')&&!value&&req.params.kind!=='PROPERTY_FACTS')return res.status(400).json({error:'VERIFIED_EVIDENCE_REQUIRES_VALUE'});
  const item=await diligence.upsert({investorId:p.userId,listingId:listing.id,kind:req.params.kind as any,status:req.body.status,label:typeof req.body?.label==='string'?req.body.label.slice(0,160):req.params.kind,value,source:typeof req.body?.source==='string'?req.body.source.slice(0,500):undefined,notes:typeof req.body?.notes==='string'?req.body.notes.slice(0,1000):undefined,verifiedAt:req.body.status==='VERIFIED'?new Date().toISOString():undefined});
  return res.json(item);
 });
}
