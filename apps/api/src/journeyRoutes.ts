import { Router } from 'express';
import { z } from 'zod';
import type { AuthenticationProvider } from './authentication.js';
import { requireAuthentication, authenticatedPrincipal } from './authentication.js';
import type { JourneyRepository } from './journeyRepository.js';
import { journeyTypes, journeyStatuses } from './journeyDomain.js';

export function registerJourneyRoutes(app: Router, auth: AuthenticationProvider, repository: JourneyRepository) {
  const guard = requireAuthentication(auth);
  const profile = z.object({ type:z.enum(journeyTypes), goals:z.record(z.unknown()).default({}), preferences:z.record(z.unknown()).default({}) });
  const event = z.object({ eventType:z.string().min(2).max(100), payload:z.record(z.unknown()).default({}) });
  const status = z.object({ status:z.enum(journeyStatuses) });
  app.post('/api/v1/journeys', guard, async (req,res) => { const p=authenticatedPrincipal(res); const parsed=profile.safeParse(req.body); if(!parsed.success)return res.status(400).json({error:'INVALID_JOURNEY',details:parsed.error.flatten()}); const journey=await repository.createJourney({userId:p.userId,...parsed.data}); await repository.addEvent({journeyId:journey.id,userId:p.userId,eventType:'JOURNEY_CREATED',payload:{type:journey.type}}); return res.status(201).json(journey); });
  app.get('/api/v1/journeys', guard, async (_req,res) => { const p=authenticatedPrincipal(res); return res.json(await repository.listJourneys(p.userId)); });
  app.get('/api/v1/journeys/:journeyId', guard, async (req,res) => { const p=authenticatedPrincipal(res); const journey=await repository.getJourney(req.params.journeyId,p.userId); if(!journey)return res.status(404).json({error:'JOURNEY_NOT_FOUND'}); return res.json(journey); });
  app.patch('/api/v1/journeys/:journeyId/status', guard, async (req,res) => { const p=authenticatedPrincipal(res); const parsed=status.safeParse(req.body); if(!parsed.success)return res.status(400).json({error:'INVALID_STATUS',details:parsed.error.flatten()}); const journey=await repository.updateStatus(req.params.journeyId,p.userId,parsed.data.status); if(!journey)return res.status(404).json({error:'JOURNEY_NOT_FOUND'}); await repository.addEvent({journeyId:journey.id,userId:p.userId,eventType:'STATUS_CHANGED',payload:{status:journey.status}}); return res.json(journey); });
  app.post('/api/v1/journeys/:journeyId/events', guard, async (req,res) => { const p=authenticatedPrincipal(res); const journey=await repository.getJourney(req.params.journeyId,p.userId); if(!journey)return res.status(404).json({error:'JOURNEY_NOT_FOUND'}); const parsed=event.safeParse(req.body); if(!parsed.success)return res.status(400).json({error:'INVALID_EVENT',details:parsed.error.flatten()}); return res.status(201).json(await repository.addEvent({journeyId:journey.id,userId:p.userId,...parsed.data})); });
  app.get('/api/v1/journeys/:journeyId/events', guard, async (req,res) => { const p=authenticatedPrincipal(res); const journey=await repository.getJourney(req.params.journeyId,p.userId); if(!journey)return res.status(404).json({error:'JOURNEY_NOT_FOUND'}); return res.json(await repository.listEvents(journey.id,p.userId)); });
}
