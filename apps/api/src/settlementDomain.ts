export const settlementStatuses=['PENDING','ELIGIBLE','PROCESSING','PAID','FAILED','HELD'] as const;
export type SettlementStatus=typeof settlementStatuses[number];
export interface SupplierSettlement{id:string;jobId:string;quoteId:string;supplierId:string;paymentTransactionId:string;grossAmountMinor:number;platformFeeMinor:number;netAmountMinor:number;currency:string;status:SettlementStatus;payoutReference?:string;failureReason?:string;createdAt:string;updatedAt:string;paidAt?:string;}
export function calculateSettlement(grossAmountMinor:number,platformFeeMinor:number){if(!Number.isInteger(grossAmountMinor)||grossAmountMinor<=0)throw new Error('INVALID_GROSS_AMOUNT');if(!Number.isInteger(platformFeeMinor)||platformFeeMinor<0||platformFeeMinor>grossAmountMinor)throw new Error('INVALID_PLATFORM_FEE');return {grossAmountMinor,platformFeeMinor,netAmountMinor:grossAmountMinor-platformFeeMinor};}

export const settlementTransitions:Record<SettlementStatus,readonly SettlementStatus[]>={PENDING:['ELIGIBLE','HELD'],ELIGIBLE:['PROCESSING','HELD'],PROCESSING:['PAID','FAILED','HELD'],PAID:[],FAILED:['PROCESSING','HELD'],HELD:['ELIGIBLE','PROCESSING']};
export function canTransitionSettlementStatus(from:SettlementStatus,to:SettlementStatus){return from===to||settlementTransitions[from].includes(to)}

export interface SupplierPayoutProvider { readonly name:string; initiatePayout(input:{settlementId:string;supplierId:string;amountMinor:number;currency:string;reference:string;idempotencyKey?:string}):Promise<{status:'PROCESSING'|'PAID'|'FAILED';payoutReference?:string;failureReason?:string}>; }
