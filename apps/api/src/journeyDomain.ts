export const journeyTypes = ['BUYER','SELLER','INVESTOR'] as const;
export type JourneyType = typeof journeyTypes[number];

export interface BuyerJourney {
  id: string; userId: string; preferredSuburb?: string; city?: string; province?: string;
  propertyTypes: string[]; minBudgetCents?: number; maxBudgetCents?: number;
  bedrooms?: number; financingStatus?: 'CASH'|'PRE_APPROVED'|'NEEDS_FINANCE'|'UNKNOWN';
  createdAt: string; updatedAt: string;
}
export interface SellerJourney {
  id: string; userId: string; propertyId: string; targetSaleDate?: string;
  reason?: string; readiness: 'NOT_STARTED'|'PREPARING'|'READY_TO_LIST'; notes?: string;
  createdAt: string; updatedAt: string;
}
export interface InvestorJourney {
  id: string; userId: string; targetArea?: string; strategy: 'LONG_TERM_RENTAL'|'FLIP'|'DEVELOPMENT'|'MIXED';
  minBudgetCents?: number; maxBudgetCents?: number; targetYieldPercent?: number;
  riskProfile: 'CONSERVATIVE'|'BALANCED'|'GROWTH'; createdAt: string; updatedAt: string;
}
