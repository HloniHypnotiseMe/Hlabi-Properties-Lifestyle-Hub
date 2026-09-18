import type {Express,RequestHandler} from 'express';
import {authenticatedPrincipal} from './authentication.js';
import type {JourneyRepository} from './journeyRepository.js';
import type {ListingRepository} from './listingRepository.js';
import {screenInvestorOpportunity} from './investorOpportunityDomain.js';

export function registerInvestorOpportunityRoutes(app:Express,auth:RequestHandler,journeys:JourneyRepository,listings:ListingRepository){
 app.get('/api/v1/investor/opportunities',auth,async(req,res)=>{
  const p=authenticatedPrincipal(res); if(p.role!=='INVESTOR') return res.status(403).json({error:'ROLE_NOT_ALLOWED'});
  const journey=await journeys.getInvestor(p.userId); if(!journey) return res.status(409).json({error:'INVESTOR_JOURNEY_REQUIRED'});
  const listingsFound=await listings.listPublic({area:journey.targetArea,maxPriceCents:journey.maxBudgetCents});
  const opportunities=listingsFound.map(l=>screenInvestorOpportunity(l,journey)).filter(o=>o.status!=='DISMISSED');
  return res.json({journey:{strategy:journey.strategy,targetArea:journey.targetArea,minBudgetCents:journey.minBudgetCents,maxBudgetCents:journey.maxBudgetCents,targetYieldPercent:journey.targetYieldPercent,riskProfile:journey.riskProfile},opportunities});
 });
}
