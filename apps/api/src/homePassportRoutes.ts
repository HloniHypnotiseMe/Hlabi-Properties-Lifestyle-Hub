import { z } from 'zod';
import type { Express, RequestHandler } from 'express';
import type { HomePassportRepository } from './homePassportRepository.js';
import { homePassportSections } from './homePassportDomain.js';
import type { HomeownerRepository } from './repository.js';

const updateSchema=z.object({section:z.enum(homePassportSections),value:z.record(z.unknown())});
export function registerHomePassportRoutes(app:Express,auth:RequestHandler,repo:HomePassportRepository,properties:HomeownerRepository){
  app.get('/api/v1/homeowner/properties/:propertyId/passport',auth,async(req,res)=>{const p=res.locals.principal;if(!p)return res.status(401).json({error:'AUTH_REQUIRED'});if(p.role!=='HOMEOWNER')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});const property=await properties.getPropertyForOwner(req.params.propertyId,p.userId);if(!property)return res.status(404).json({error:'PROPERTY_NOT_FOUND'});let passport=await repo.getForOwner(property.id,p.userId);if(!passport)passport=await repo.create({propertyId:property.id,ownerId:p.userId,status:'ACTIVE',data:{}});return res.json(passport);});
  app.patch('/api/v1/homeowner/properties/:propertyId/passport',auth,async(req,res)=>{const p=res.locals.principal;if(!p)return res.status(401).json({error:'AUTH_REQUIRED'});if(p.role!=='HOMEOWNER')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});const parsed=updateSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'INVALID_PASSPORT_UPDATE',details:parsed.error.flatten()});const property=await properties.getPropertyForOwner(req.params.propertyId,p.userId);if(!property)return res.status(404).json({error:'PROPERTY_NOT_FOUND'});let passport=await repo.getForOwner(property.id,p.userId);if(!passport)passport=await repo.create({propertyId:property.id,ownerId:p.userId,status:'ACTIVE',data:{}});const updated=await repo.updateSection(property.id,p.userId,parsed.data.section,parsed.data.value);return res.json(updated??passport);});
}
