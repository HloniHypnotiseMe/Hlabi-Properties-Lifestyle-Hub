export const leadStatuses=['NEW','CONTACTED','QUALIFIED','VIEWING_REQUESTED','VIEWED','OFFERED','CLOSED','DECLINED'] as const;
export type LeadStatus=typeof leadStatuses[number];
export const offerStatuses=['SUBMITTED','UNDER_REVIEW','ACCEPTED','REJECTED','WITHDRAWN'] as const;
export type OfferStatus=typeof offerStatuses[number];
export interface PropertyLead{id:string;listingId:string;propertyId:string;buyerId:string;status:LeadStatus;message?:string;createdAt:string;updatedAt:string;}
export interface PropertyViewing{id:string;leadId:string;listingId:string;propertyId:string;buyerId:string;requestedFor:string;status:'REQUESTED'|'CONFIRMED'|'COMPLETED'|'CANCELLED';createdAt:string;updatedAt:string;}
export interface PropertyOffer{id:string;leadId:string;listingId:string;propertyId:string;buyerId:string;amountCents:number;conditions:string[];status:OfferStatus;createdAt:string;updatedAt:string;}
