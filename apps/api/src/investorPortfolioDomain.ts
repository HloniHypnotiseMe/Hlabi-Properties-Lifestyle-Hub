export const portfolioStatuses=['WATCHLIST','DUE_DILIGENCE','OFFERED','ACQUIRED','PASSED'] as const;
export type PortfolioStatus=typeof portfolioStatuses[number];
export interface InvestorPortfolioItem{ id:string; investorId:string; listingId:string; status:PortfolioStatus; notes?:string; createdAt:string; updatedAt:string; }
