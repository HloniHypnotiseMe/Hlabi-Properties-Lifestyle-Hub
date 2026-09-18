import type { Express, RequestHandler } from 'express';
import { z } from 'zod';
import type { HomeownerRepository } from './repository.js';
import type { HomePassportRepository } from './homePassportRepository.js';
import type { SupplierRepository } from './supplierRepository.js';
import type { JobRepository } from './jobRepository.js';
import type { RenewalRepository } from './renewalRepository.js';
import type { BillingRepository } from './billingRepository.js';
import type { ReputationRepository } from './reputationRepository.js';
import type { AiProviderAdapter } from './aiProvider.js';
import { buildLifestyleAdvisor } from './lifestyleOrchestrator.js';
import type { AgentRepository } from './agentRepository.js';
import type { AcademyRepository } from './academyRepository.js';
import type { AcademyAssessmentRepository } from './academyAssessmentRepository.js';
import type { JourneyRepository } from './journeyRepository.js';

const actionSchema=z.object({
  actionId:z.string().min(1),
  confirm:z.literal(true),
  scheduledFor:z.string().datetime().optional(),
  category:z.string().max(80).optional(),
  title:z.string().min(3).max(160).optional(),
  description:z.string().min(10).max(3000).optional(),
});

export function registerLifestyleOrchestratorRoutes(app:Express, authenticated:RequestHandler, repository:HomeownerRepository, passportRepository:HomePassportRepository, supplierRepository:SupplierRepository, jobRepository:JobRepository, renewalRepository:RenewalRepository, billingRepository:BillingRepository, reputationRepository:ReputationRepository, aiProvider:AiProviderAdapter, aiModel:string|undefined, agentRepository?:AgentRepository, academyRepository?:AcademyRepository, academyAssessmentRepository?:AcademyAssessmentRepository, journeyRepository?:JourneyRepository){
  app.get('/api/v1/homeowner/properties/:propertyId/advisor',authenticated,async(req,res)=>{
    const principal=res.locals.principal;
    if(!principal||principal.role!=='HOMEOWNER')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
    const snapshot=await buildLifestyleAdvisor({ownerId:principal.userId,propertyId:req.params.propertyId,repository,passportRepository,supplierRepository,jobRepository,renewalRepository,billingRepository,reputationRepository,aiProvider,aiModel,agentRepository,academyRepository,academyAssessmentRepository,journeyRepository});
    if(!snapshot)return res.status(404).json({error:'PROPERTY_NOT_FOUND'});
    return res.json({schema:'hlabi.lifestyle.advisor.v1',...snapshot});
  });

  app.post('/api/v1/homeowner/properties/:propertyId/advisor/actions',authenticated,async(req,res)=>{
    const principal=res.locals.principal;
    if(!principal||principal.role!=='HOMEOWNER')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
    const parsed=actionSchema.safeParse(req.body);
    if(!parsed.success)return res.status(400).json({error:'INVALID_ADVISOR_ACTION',details:parsed.error.flatten()});
    const property=await repository.getPropertyForOwner(req.params.propertyId,principal.userId);
    if(!property)return res.status(404).json({error:'PROPERTY_NOT_FOUND'});
    const snapshot=await buildLifestyleAdvisor({ownerId:principal.userId,propertyId:property.id,repository,passportRepository,supplierRepository,jobRepository,renewalRepository,billingRepository,reputationRepository,aiProvider,aiModel});
    if(!snapshot)return res.status(404).json({error:'PROPERTY_NOT_FOUND'});
    const action=snapshot.actions.find(a=>a.id===parsed.data.actionId);
    if(!action)return res.status(404).json({error:'ADVISOR_ACTION_NOT_FOUND'});
    if(!action.requiresConfirmation)return res.status(409).json({error:'ACTION_DOES_NOT_REQUIRE_EXECUTION',action});
    if(action.type==='REQUEST_QUOTES'){
      const audit=snapshot.latestAudit;
      const urgent=audit?.findings?.filter((f:any)=>f.priority==='URGENT')??[];
      if(!urgent.length)return res.status(409).json({error:'NO_URGENT_FINDINGS'});
      const description=parsed.data.description??urgent.map((f:any)=>`${f.area}: ${f.recommendedAction}`).join('; ');
      const request=await supplierRepository.createQuoteRequest({
        propertyId:property.id,ownerId:principal.userId,auditId:audit.id,
        title:parsed.data.title??'Urgent property maintenance quotes',
        description,priority:'URGENT',status:'OPEN',
        supplierIds:(await supplierRepository.listEligibleSuppliers(parsed.data.category)).map(s=>s.id),
      });
      return res.status(201).json({actionId:action.id,executed:true,request});
    }
    if(action.type==='SCHEDULE_JOB'){
      const scheduled=parsed.data.scheduledFor;
      if(!scheduled)return res.status(400).json({error:'SCHEDULED_FOR_REQUIRED'});
      const jobId=action.linkedIds[0];
      const job=await jobRepository.getJobForOwner(jobId,principal.userId);
      if(!job||job.propertyId!==property.id)return res.status(404).json({error:'JOB_NOT_FOUND'});
      const updated=await jobRepository.updateJobStatus(job.id,principal.userId,'SCHEDULED',scheduled);
      return res.status(200).json({actionId:action.id,executed:true,job:updated});
    }
    return res.status(400).json({error:'UNSUPPORTED_ADVISOR_ACTION'});
  });
}
