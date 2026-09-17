import type { Express, RequestHandler } from 'express';
import { z } from 'zod';
import type { HomeownerRepository } from './repository.js';
import type { ReputationRepository } from './reputationRepository.js';
import { authenticatedPrincipal } from './authentication.js';

const reviewSchema=z.object({propertyId:z.string().min(1),jobId:z.string().min(1).optional(),supplierId:z.string().min(1).optional(),agentId:z.string().min(1).optional(),rating:z.number().int().min(1).max(5),title:z.string().max(160).optional(),comment:z.string().max(3000).optional()});
export function registerReputationRoutes(app:Express,authenticated:RequestHandler,repository:ReputationRepository,homeownerRepository:HomeownerRepository){
 app.post('/api/v1/homeowner/reputation/reviews',authenticated,async(req,res)=>{const p=authenticatedPrincipal(res);if(p.role!=='HOMEOWNER')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});const parsed=reviewSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'INVALID_REVIEW',details:parsed.error.flatten()});const property=await homeownerRepository.getPropertyForOwner(parsed.data.propertyId,p.userId);if(!property)return res.status(404).json({error:'PROPERTY_NOT_FOUND'});const review=await repository.createReview({...parsed.data,ownerId:p.userId,propertyId:property.id,status:'PENDING'});return res.status(201).json(review);});
 app.get('/api/v1/homeowner/properties/:propertyId/reputation',authenticated,async(req,res)=>{const p=authenticatedPrincipal(res);if(p.role!=='HOMEOWNER')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});const property=await homeownerRepository.getPropertyForOwner(req.params.propertyId,p.userId);if(!property)return res.status(404).json({error:'PROPERTY_NOT_FOUND'});return res.json(await repository.getSummary(property.id,p.userId));});
 app.get('/api/v1/homeowner/properties/:propertyId/reputation/reviews',authenticated,async(req,res)=>{const p=authenticatedPrincipal(res);if(p.role!=='HOMEOWNER')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});const property=await homeownerRepository.getPropertyForOwner(req.params.propertyId,p.userId);if(!property)return res.status(404).json({error:'PROPERTY_NOT_FOUND'});return res.json(await repository.listReviewsForProperty(property.id,p.userId));});
}
