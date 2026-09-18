import type { ListingRecord } from './listingDomain.js';

export const diligenceEvidenceStatuses=['MISSING','CAPTURED','VERIFIED'] as const;
export type DiligenceEvidenceStatus=typeof diligenceEvidenceStatuses[number];
export type DiligenceEvidenceKind='PROPERTY_FACTS'|'OWNERSHIP'|'OCCUPANCY'|'RENTAL_INCOME'|'OPERATING_EXPENSES'|'COMPLIANCE'|'VALUATION'|'DOCUMENT';

export interface InvestorDiligenceEvidence {
  id:string; investorId:string; listingId:string; kind:DiligenceEvidenceKind;
  status:DiligenceEvidenceStatus; label:string; value?:string; source?:string;
  notes?:string; capturedAt:string; verifiedAt?:string; verifiedBy?:string;
}

export interface InvestorAcquisitionMetrics {
  askingPriceCents?:number; annualRentCents?:number; annualExpensesCents?:number;
  grossYieldPercent?:number; netYieldPercent?:number;
  available:string[]; missing:string[];
}

export interface InvestorDiligenceSnapshot {
  listingId:string; listing:ListingRecord; evidence:InvestorDiligenceEvidence[];
  metrics:InvestorAcquisitionMetrics; nextAction:string;
}

export function calculateAcquisitionMetrics(input:{askingPriceCents?:number;annualRentCents?:number;annualExpensesCents?:number}):InvestorAcquisitionMetrics{
  const available:string[]=[]; const missing:string[]=[];
  const m:InvestorAcquisitionMetrics={askingPriceCents:input.askingPriceCents,annualRentCents:input.annualRentCents,annualExpensesCents:input.annualExpensesCents,available,missing};
  if(input.askingPriceCents&&input.annualRentCents!==undefined){
    m.grossYieldPercent=Number(((input.annualRentCents/input.askingPriceCents)*100).toFixed(2)); available.push('gross yield');
  } else missing.push('asking price + annual rent');
  if(input.askingPriceCents&&input.annualRentCents!==undefined&&input.annualExpensesCents!==undefined){
    m.netYieldPercent=Number((((input.annualRentCents-input.annualExpensesCents)/input.askingPriceCents)*100).toFixed(2)); available.push('net yield');
  } else missing.push('annual operating expenses');
  return m;
}
