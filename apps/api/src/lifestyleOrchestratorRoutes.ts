import type { Express, RequestHandler } from 'express';
import type { HomeownerRepository } from './repository.js';
import type { HomePassportRepository } from './homePassportRepository.js';
import type { SupplierRepository } from './supplierRepository.js';
import type { JobRepository } from './jobRepository.js';
import type { AiProviderAdapter } from './aiProvider.js';
import { buildLifestyleAdvisor } from './lifestyleOrchestrator.js';

export function registerLifestyleOrchestratorRoutes(app:Express, authenticated:RequestHandler, repository:HomeownerRepository, passportRepository:HomePassportRepository, supplierRepository:SupplierRepository, jobRepository:JobRepository, aiProvider:AiProviderAdapter, aiModel:string|undefined){
  app.get('/api/v1/homeowner/properties/:propertyId/advisor',authenticated,async(req,res)=>{
    const principal=res.locals.principal;
    if(!principal||principal.role!=='HOMEOWNER')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
    const snapshot=await buildLifestyleAdvisor({ownerId:principal.userId,propertyId:req.params.propertyId,repository,passportRepository,supplierRepository,jobRepository,aiProvider,aiModel});
    if(!snapshot)return res.status(404).json({error:'PROPERTY_NOT_FOUND'});
    return res.json({schema:'hlabi.lifestyle.advisor.v1',...snapshot});
  });
}
