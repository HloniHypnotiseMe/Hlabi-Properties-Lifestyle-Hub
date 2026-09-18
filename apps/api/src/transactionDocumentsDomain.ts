export const transactionDocumentKinds=['OFFER_ACCEPTANCE','IDENTITY','FINANCE','COMPLIANCE','TRANSFER','OTHER'] as const;
export type TransactionDocumentKind=typeof transactionDocumentKinds[number];
export const transactionDocumentStatuses=['REQUIRED','SUBMITTED','VERIFIED','REJECTED'] as const;
export type TransactionDocumentStatus=typeof transactionDocumentStatuses[number];
export interface TransactionDocument{id:string;transactionId:string;kind:TransactionDocumentKind;label:string;status:TransactionDocumentStatus;storageKey?:string;notes?:string;submittedBy?:string;verifiedBy?:string;createdAt:string;updatedAt:string;verifiedAt?:string;}