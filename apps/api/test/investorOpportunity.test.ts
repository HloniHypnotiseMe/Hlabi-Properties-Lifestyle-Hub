import test from 'node:test'; import assert from 'node:assert/strict';
import {screenInvestorOpportunity} from '../src/investorOpportunityDomain.js';
const base={id:'l1',propertyId:'p1',sellerId:'s1',status:'LISTED' as const,title:'Test',description:'A sufficiently detailed listing description.',askingPriceCents:200000000,features:[],createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z'};
const journey={id:'j',userId:'u',targetArea:'Rosebank',strategy:'LONG_TERM_RENTAL' as const,minBudgetCents:100000000,maxBudgetCents:300000000,targetYieldPercent:8,riskProfile:'BALANCED' as const,createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z'};
test('investor screening is deterministic and never invents yield',()=>{const x=screenInvestorOpportunity(base,journey);assert.equal(x.status,'REVIEW_REQUIRED');assert.deepEqual(x.criteriaMatches,['budget']);assert.ok(x.missingData.includes('verified investment yield'));});
test('budget outside investor range is flagged',()=>{const x=screenInvestorOpportunity({...base,askingPriceCents:400000000},journey);assert.ok(x.notes.some(n=>n.includes('maximum budget')));});
