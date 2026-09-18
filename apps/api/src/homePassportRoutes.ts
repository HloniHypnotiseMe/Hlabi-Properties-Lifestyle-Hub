import { z } from 'zod';
import type { Express, RequestHandler } from 'express';
import type { HomePassportRepository } from './homePassportRepository.js';
import { homePassportSections } from './homePassportDomain.js';
import type { HomeownerRepository } from './repository.js';
import type { SupplierRepository } from './supplierRepository.js';
import type { JobRepository } from './jobRepository.js';
import type { RenewalRepository } from './renewalRepository.js';

const updateSchema=z.object({section:z.enum(homePassportSections),value:z.record(z.unknown())});

export function registerHomePassportRoutes(app:Express,auth:RequestHandler,repo:HomePassportRepository,properties:HomeownerRepository,suppliers:SupplierRepository,jobs:JobRepository,renewals:RenewalRepository){
  app.get('/api/v1/homeowner/properties/:propertyId/passport',auth,async(req,res)=>{
    const p=res.locals.principal;
    if(!p)return res.status(401).json({error:'AUTH_REQUIRED'});
    if(p.role!=='HOMEOWNER')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
    const property=await properties.getPropertyForOwner(req.params.propertyId,p.userId);
    if(!property)return res.status(404).json({error:'PROPERTY_NOT_FOUND'});
    let passport=await repo.getForOwner(property.id,p.userId);
    if(!passport)passport=await repo.create({propertyId:property.id,ownerId:p.userId,status:'ACTIVE',data:{}});
    const [latestAudit,quoteRequests,jobsForProperty,renewalPlan]=await Promise.all([
      properties.getLatestAuditForProperty(property.id,p.userId),
      suppliers.listQuoteRequestsForOwner(p.userId,property.id),
      jobs.listJobsForOwner(p.userId,property.id),
      renewals.getPlanForOwner(property.id,p.userId),
    ]);
    const jobEvidence=await Promise.all(jobsForProperty.map(async job=>({jobId:job.id,evidence:await jobs.listEvidenceForOwner(job.id,p.userId)})));
    const quotes=await Promise.all(quoteRequests.map(async request=>({requestId:request.id,quotes:await suppliers.listQuotesForOwnerRequest(request.id,p.userId)})));
    const renewalTasks=renewalPlan?await renewals.listTasksForOwner(renewalPlan.id,p.userId):[];
    return res.json({passport,linked:{property,latestAudit,quoteRequests,quotes,jobs:jobsForProperty,jobEvidence,renewalPlan,renewalTasks}});
  });
  app.patch('/api/v1/homeowner/properties/:propertyId/passport',auth,async(req,res)=>{
    const p=res.locals.principal;
    if(!p)return res.status(401).json({error:'AUTH_REQUIRED'});
    if(p.role!=='HOMEOWNER')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
    const parsed=updateSchema.safeParse(req.body);
    if(!parsed.success)return res.status(400).json({error:'INVALID_PASSPORT_UPDATE',details:parsed.error.flatten()});
    const property=await properties.getPropertyForOwner(req.params.propertyId,p.userId);
    if(!property)return res.status(404).json({error:'PROPERTY_NOT_FOUND'});
    let passport=await repo.getForOwner(property.id,p.userId);
    if(!passport)passport=await repo.create({propertyId:property.id,ownerId:p.userId,status:'ACTIVE',data:{}});
    const updated=await repo.updateSection(property.id,p.userId,parsed.data.section,parsed.data.value);
    return res.json(updated??passport);
  });
}
