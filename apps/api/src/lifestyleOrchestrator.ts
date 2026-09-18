import type { AiProviderAdapter } from './aiProvider.js';
import type { HomeownerRepository } from './repository.js';
import type { HomePassportRepository } from './homePassportRepository.js';
import type { SupplierRepository } from './supplierRepository.js';
import type { JobRepository } from './jobRepository.js';
import type { RenewalRepository } from './renewalRepository.js';
import type { BillingRepository } from './billingRepository.js';
import type { ReputationRepository } from './reputationRepository.js';
import type { AgentRepository } from './agentRepository.js';
import type { AcademyRepository } from './academyRepository.js';
import type { AcademyAssessmentRepository } from './academyAssessmentRepository.js';

export type AdvisorSource = 'PROPERTY'|'HOME_PASSPORT'|'AUDIT'|'SUPPLIER'|'QUOTE'|'JOB'|'PAYMENT'|'RENEWAL'|'SYSTEM';
export interface AdvisorAction { id:string; type:'REVIEW_AUDIT'|'REQUEST_QUOTES'|'REVIEW_QUOTES'|'PAY_JOB'|'SCHEDULE_JOB'|'FOLLOW_JOB'|'UPDATE_PASSPORT'|'CONTACT_SUPPLIER'|'REVIEW_RENEWAL'; title:string; rationale:string; sources:AdvisorSource[]; requiresConfirmation:boolean; linkedIds:string[]; }
export interface AdvisorSnapshot { property:any; passport:any|null; latestAudit:any|null; renewalPlan:any|null; renewalTasks:any[]; eligibleSupplierCount:number; quoteRequests:any[]; jobs:any[]; actions:AdvisorAction[]; aiSummary?:string; ai:{enabled:boolean;provider?:string;model?:string}; }

export async function buildLifestyleAdvisor(input:{ownerId:string;propertyId:string;repository:HomeownerRepository;passportRepository:HomePassportRepository;supplierRepository:SupplierRepository;jobRepository:JobRepository;reputationRepository?:ReputationRepository;billingRepository?:BillingRepository;renewalRepository?:RenewalRepository;aiProvider?:AiProviderAdapter;aiModel?:string;agentRepository?:AgentRepository;academyRepository?:AcademyRepository;academyAssessmentRepository?:AcademyAssessmentRepository;}):Promise<AdvisorSnapshot|null>{
  const property=await input.repository.getPropertyForOwner(input.propertyId,input.ownerId); if(!property)return null;
  const renewalPlan=input.renewalRepository?await input.renewalRepository.getPlanForOwner(property.id,input.ownerId):null;
  const [passport,latestAudit,eligibleSuppliers,quoteRequests,jobs,renewalTasks]=await Promise.all([
    input.passportRepository.getForOwner(property.id,input.ownerId),
    input.repository.getLatestAuditForProperty(property.id,input.ownerId),
    input.supplierRepository.listEligibleSuppliers(),
    input.supplierRepository.listQuoteRequestsForOwner(input.ownerId,property.id),
    input.jobRepository.listJobsForOwner(input.ownerId,property.id),
    renewalPlan&&input.renewalRepository?input.renewalRepository.listTasksForOwner(renewalPlan.id,input.ownerId):Promise.resolve([]),
  ]);
  const actions:AdvisorAction[]=[];
  if(!latestAudit) actions.push({id:'audit',type:'REVIEW_AUDIT',title:'Complete a home audit',rationale:'There is no completed property audit available to identify priorities.',sources:['PROPERTY','SYSTEM'],requiresConfirmation:false,linkedIds:[property.id]});
  else {
    const urgent=latestAudit.findings?.filter((f:any)=>f.priority==='URGENT')??[];
    if(urgent.length&&!quoteRequests.some(q=>q.status==='OPEN'||q.status==='QUOTING')) actions.push({id:'urgent-quotes',type:'REQUEST_QUOTES',title:'Request quotes for urgent findings',rationale:`${urgent.length} urgent audit finding${urgent.length===1?'':'s'} need attention and no open quote request is linked to the property.`,sources:['AUDIT','SUPPLIER','QUOTE'],requiresConfirmation:true,linkedIds:[latestAudit.id]});
  }
  const openQuotes=quoteRequests.filter(q=>q.status==='OPEN'||q.status==='QUOTING');
  if(openQuotes.length) actions.push({id:'quotes',type:'REVIEW_QUOTES',title:'Review supplier quotes',rationale:`${openQuotes.length} quote request${openQuotes.length===1?'':'s'} is active.`,sources:['QUOTE','SUPPLIER'],requiresConfirmation:false,linkedIds:openQuotes.map(q=>q.id)});
  const payableJobs=input.billingRepository?await Promise.all(jobs.filter(j=>['REQUESTED','SCHEDULED'].includes(j.status)).map(async j=>({job:j,paid:Boolean(await input.billingRepository!.getSuccessfulTransactionForJob(j.id,input.ownerId))}))).then(x=>x.filter(y=>!y.paid).map(y=>y.job)):[];
  if(payableJobs.length) actions.push({id:'payments',type:'PAY_JOB',title:'Pay for booked work',rationale:`${payableJobs.length} booked service job${payableJobs.length===1?' is':'s are'} ready for payment.`,sources:['JOB','PAYMENT'],requiresConfirmation:true,linkedIds:payableJobs.map(j=>j.id)});
  const activeJobs=jobs.filter(j=>!['COMPLETED','CANCELLED'].includes(j.status));
  const schedulableJobs=jobs.filter(j=>j.status==='REQUESTED');
  if(schedulableJobs.length) actions.push({id:'schedule-job',type:'SCHEDULE_JOB',title:'Schedule booked work',rationale:`${schedulableJobs.length} booked service job${schedulableJobs.length===1?' is':'s are'} awaiting scheduling.`,sources:['JOB','SUPPLIER'],requiresConfirmation:true,linkedIds:schedulableJobs.map(j=>j.id)});
  if(activeJobs.length) actions.push({id:'jobs',type:'FOLLOW_JOB',title:'Follow active work',rationale:`${activeJobs.length} service job${activeJobs.length===1?' is':'s are'} still active.`,sources:['JOB','SUPPLIER'],requiresConfirmation:false,linkedIds:activeJobs.map(j=>j.id)});
  if(renewalPlan) {
    const openTasks=renewalTasks.filter(t=>!['COMPLETED','CANCELLED'].includes(t.status));
    if(openTasks.length) actions.push({id:'renewal',type:'REVIEW_RENEWAL',title:'Review renewal plan',rationale:`${openTasks.length} renewal task${openTasks.length===1?'':'s'} remain active.`,sources:['RENEWAL','PROPERTY'],requiresConfirmation:false,linkedIds:[renewalPlan.id,...openTasks.map(t=>t.id)]});
  }
  if(!passport) actions.push({id:'passport',type:'UPDATE_PASSPORT',title:'Create your Home Passport',rationale:'A Home Passport gives the advisor a durable property context for future decisions.',sources:['HOME_PASSPORT','PROPERTY'],requiresConfirmation:false,linkedIds:[property.id]});
  const supplierReputation=input.reputationRepository?await Promise.all(eligibleSuppliers.map(s=>input.reputationRepository!.getSummaryForSupplier(s.id))):[];
  const agentStaff=input.agentRepository?await input.agentRepository.listStaff(input.ownerId):[];
  const agentTasks=input.agentRepository?await input.agentRepository.listTasks(input.ownerId):[];
  const academyEnrollments=input.academyRepository?await input.academyRepository.listEnrollments(input.ownerId):[];
  const academyEvidence=await Promise.all(academyEnrollments.map(async e=>({enrollmentId:e.id,completedModules:e.completedModules,progressPercent:e.progressPercent,attempts:input.academyAssessmentRepository?await input.academyAssessmentRepository.listAttempts(e.id,input.ownerId):[]})));
  const agentContext={staff:agentStaff.map(a=>({id:a.id,role:a.role,name:a.name,status:a.status})),tasks:agentTasks.map(t=>({id:t.id,agentId:t.agentId,propertyId:t.propertyId,type:t.type,status:t.status,createdAt:t.createdAt}))};
  const academyContext={enrollments:academyEvidence};
  const snapshot={property,passport,latestAudit,renewalPlan,renewalTasks,eligibleSupplierCount:eligibleSuppliers.length,supplierReputation,quoteRequests,jobs,actions,agentContext,academyContext};
  let aiSummary:string|undefined; let aiEnabled=false; let provider:string|undefined;
  if(input.aiProvider){try{const result=await input.aiProvider.generate({provider:'OLLAMA',model:input.aiModel??'llama3.2',temperature:0.1,maxTokens:240,system:'You are Hlabi\'s property advisor. Use only supplied facts. Never invent prices, supplier verification, qualifications, completion, regulatory status or actions already taken. Return a concise next-step summary.',prompt:JSON.stringify({property,passport,latestAudit,renewalPlan,renewalTasks,quoteRequests,jobs,actions})});aiSummary=result.text;aiEnabled=true;provider=result.provider;}catch{aiEnabled=false;}}
  return {...snapshot,aiSummary,ai:{enabled:aiEnabled,provider,model:aiEnabled?(input.aiModel??'llama3.2'):undefined}};
}
