export const transactionStatuses=['OPEN','CONDITIONAL','IN_TRANSFER','COMPLETED','CANCELLED'] as const;
export type TransactionStatus=typeof transactionStatuses[number];
export const transactionMilestoneStatuses=['PENDING','IN_PROGRESS','COMPLETED','BLOCKED'] as const;
export type TransactionMilestoneStatus=typeof transactionMilestoneStatuses[number];
export interface PropertyTransaction{id:string;offerId:string;listingId:string;propertyId:string;buyerId:string;sellerId:string;agentId?:string;status:TransactionStatus;notes?:string;createdAt:string;updatedAt:string;completedAt?:string;}
export interface TransactionMilestone{id:string;transactionId:string;key:string;label:string;status:TransactionMilestoneStatus;notes?:string;updatedAt:string;}