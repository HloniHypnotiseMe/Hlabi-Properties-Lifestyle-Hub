import type { AiProviderAdapter } from './aiProvider.js';
import type { HomeownerRepository } from './repository.js';
import type { HomePassportRepository } from './homePassportRepository.js';
import type { SupplierRepository } from './supplierRepository.js';
import type { JobRepository } from './jobRepository.js';

export type AdvisorSource = 'PROPERTY'|'HOME_PASSPORT'|'AUDIT'|'SUPPLIER'|'QUOTE'|'JOB'|'SYSTEM';
export interface AdvisorAction { id:string; type:'REVIEW_AUDIT'|'REQUEST_QUOTES'|'REVIEW_QUOTES'|'FOLLOW_JOB'|'UPDATE_PASSPORT'|'CONTACT_SUPPLIER'; title:string; rationale:string; sources:AdvisorSource[]; requiresConfirmation:boolean; linkedIds:string[]; }
export interface AdvisorSnapshot { property:any; passport:any|null; latestAudit:any|null; eligibleSupplierCount:number; quoteRequests:any[]; jobs:any[]; actions:AdvisorAction[]; aiSummary?:string; ai:{enabled:boolean;provider?:string;model?:string}; }

export async function buildLifestyleAdvisor(input:{ownerId:string;propertyId:string;repository:HomeownerRepository;passportRepository:HomePassportRepository;supplierRepository:SupplierRepository;jobRepository:JobRepository;aiProvider?:AiProviderAdapter;aiModel?:string;}):Promise<AdvisorSnapshot|null>{
  const property=await input.repository.getPropertyForOwner(input.propertyId,input.ownerId); if(!property)return null;
  const [passport,latestAudit,eligibleSuppliers,quoteRequests,jobs]=await Promise.all([
    input.passportRepository.getForOwner(property.id,input.ownerId),
    input.repository.getLatestAuditForProperty(property.id,input.ownerId),
    input.supplierRepository.listEligibleSuppliers(),
    input.supplierRepository.listQuoteRequestsForOwner(input.ownerId,property.id),
    input.jobRepository.listJobsForOwner(input.ownerId,property.id),
  ]);
  const actions:AdvisorAction[]=[];
  if(!latestAudit) actions.push({id:'audit',type:'REVIEW_AUDIT',title:'Complete a home audit',rationale:'There is no completed property audit available to identify priorities.',sources:['PROPERTY','SYSTEM'],requiresConfirmation:false,linkedIds:[property.id]});
  else {
    const urgent=latestAudit.findings?.filter((f:any)=>f.priority==='URGENT')??[];
    if(urgent.length&&!quoteRequests.some(q=>q.status==='OPEN'||q.status==='QUOTING')) actions.push({id:'urgent-quotes',type:'REQUEST_QUOTES',title:'Request quotes for urgent findings',rationale:`${urgent.length} urgent audit finding${urgent.length===1?'':'s'} need attention and no open quote request is linked to the property.`,sources:['AUDIT','SUPPLIER','QUOTE'],requiresConfirmation:true,linkedIds:[latestAudit.id]});
  }
  const openQuotes=quoteRequests.filter(q=>q.status==='OPEN'||q.status==='QUOTING');
  if(openQuotes.length) actions.push({id:'quotes',type:'REVIEW_QUOTES',title:'Review supplier quotes',rationale:`${openQuotes.length} quote request${openQuotes.length===1?'':'s'} is active.`,sources:['QUOTE','SUPPLIER'],requiresConfirmation:false,linkedIds:openQuotes.map(q=>q.id)});
  const activeJobs=jobs.filter(j=>!['COMPLETED','CANCELLED'].includes(j.status));
  if(activeJobs.length) actions.push({id:'jobs',type:'FOLLOW_JOB',title:'Follow active work',rationale:`${activeJobs.length} service job${activeJobs.length===1?' is':'s are'} still active.`,sources:['JOB','SUPPLIER'],requiresConfirmation:false,linkedIds:activeJobs.map(j=>j.id)});
  if(!passport) actions.push({id:'passport',type:'UPDATE_PASSPORT',title:'Create your Home Passport',rationale:'A Home Passport gives the advisor a durable property context for future decisions.',sources:['HOME_PASSPORT','PROPERTY'],requiresConfirmation:false,linkedIds:[property.id]});
  const snapshot={property,passport,latestAudit,eligibleSupplierCount:eligibleSuppliers.length,quoteRequests,jobs,actions};
  let aiSummary:string|undefined; let aiEnabled=false; let provider:string|undefined;
  if(input.aiProvider){try{const result=await input.aiProvider.generate({provider:'OLLAMA',model:input.aiModel??'llama3.2',temperature:0.1,maxTokens:240,system:'You are Hlabi\'s property advisor. Use only supplied facts. Never invent prices, supplier verification, qualifications, completion, regulatory status or actions already taken. Return a concise next-step summary.',prompt:JSON.stringify({property,passport,latestAudit,quoteRequests,jobs,actions})});aiSummary=result.text;aiEnabled=true;provider=result.provider;}catch{aiEnabled=false;}}
  return {...snapshot,aiSummary,ai:{enabled:aiEnabled,provider,model:aiEnabled?(input.aiModel??'llama3.2'):undefined}};
}
