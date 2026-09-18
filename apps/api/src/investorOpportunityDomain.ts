import type { ListingRecord } from './listingDomain.js';
import type { InvestorJourney } from './journeyDomain.js';

export const opportunityStatuses=['MATCHED','REVIEW_REQUIRED','WATCHLISTED','DISMISSED'] as const;
export type OpportunityStatus=typeof opportunityStatuses[number];
export interface InvestorOpportunity { listing:ListingRecord; status:OpportunityStatus; criteriaMatches:string[]; missingData:string[]; notes:string[]; }
export function screenInvestorOpportunity(listing:ListingRecord, journey:InvestorJourney):InvestorOpportunity {
  const criteriaMatches:string[]=[]; const missingData:string[]=[]; const notes:string[]=[];
  const price=listing.askingPriceCents;
  if(price===undefined){missingData.push('asking price');} else {
    if(journey.minBudgetCents!==undefined && price<journey.minBudgetCents) notes.push('Below the investor minimum budget.');
    else if(journey.maxBudgetCents!==undefined && price>journey.maxBudgetCents) notes.push('Above the investor maximum budget.');
    else criteriaMatches.push('budget');
  }
  if(journey.targetArea) missingData.push('verified property area match');
  if(journey.targetYieldPercent!==undefined) missingData.push('verified investment yield');
  missingData.push('strategy suitability evidence');
  const budgetOut=price!==undefined && ((journey.minBudgetCents!==undefined&&price<journey.minBudgetCents)||(journey.maxBudgetCents!==undefined&&price>journey.maxBudgetCents));
  const status=budgetOut?'REVIEW_REQUIRED':missingData.length?'REVIEW_REQUIRED':'MATCHED';
  return {listing,status,criteriaMatches,missingData,notes};
}
