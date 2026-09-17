import type { Express, RequestHandler } from 'express';
import { z } from 'zod';
import type { AgentRepository } from './agentRepository.js';
import type { HomeownerRepository } from './repository.js';
import type { AgentPropertyAccessRepository } from './agentPropertyAccessRepository.js';
import { authenticatedPrincipal } from './authentication.js';

export function registerAgentPropertyAccessRoutes(app: Express, authenticated: RequestHandler, agentRepository: AgentRepository, homeownerRepository: HomeownerRepository, accessRepository: AgentPropertyAccessRepository) {
  app.get('/api/v1/agent/property-access', authenticated, async (req,res) => {
    const principal=authenticatedPrincipal(res); if(principal.role!=='AGENT') return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
    return res.json(await accessRepository.listForOwner(principal.userId, typeof req.query.propertyId==='string'?req.query.propertyId:undefined));
  });
  app.post('/api/v1/agent/property-access', authenticated, async (req,res) => {
    const principal=authenticatedPrincipal(res); if(principal.role!=='AGENT') return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
    const parsed=z.object({agentId:z.string().min(1),propertyId:z.string().min(1)}).safeParse(req.body); if(!parsed.success) return res.status(400).json({error:'INVALID_PROPERTY_ACCESS',details:parsed.error.flatten()});
    const agent=await agentRepository.getStaffForOwner(parsed.data.agentId,principal.userId); if(!agent) return res.status(404).json({error:'AGENT_NOT_FOUND'});
    const property=await homeownerRepository.getPropertyForOwner(parsed.data.propertyId,principal.userId); if(!property) return res.status(404).json({error:'PROPERTY_NOT_FOUND'});
    return res.status(201).json(await accessRepository.grant({agentId:agent.id,ownerId:principal.userId,propertyId:property.id,grantedBy:principal.userId}));
  });
  app.delete('/api/v1/agent/property-access/:accessId', authenticated, async (req,res) => {
    const principal=authenticatedPrincipal(res); if(principal.role!=='AGENT') return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
    const access=await accessRepository.revoke(req.params.accessId,principal.userId); if(!access) return res.status(404).json({error:'PROPERTY_ACCESS_NOT_FOUND'}); return res.json(access);
  });
}
