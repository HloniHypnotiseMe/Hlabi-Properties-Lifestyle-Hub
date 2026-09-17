export type SubscriptionStatus = 'PENDING'|'ACTIVE'|'PAST_DUE'|'PAUSED'|'CANCELLED'|'EXPIRED';
export type PaymentStatus = 'PENDING'|'SUCCEEDED'|'FAILED'|'REFUNDED';
export type BillingInterval = 'MONTH'|'YEAR';

export interface Subscription {
  id:string; ownerId:string; propertyId:string; planCode:string; status:SubscriptionStatus;
  currency:string; amountMinor:number; interval:BillingInterval; provider:string;
  providerCustomerRef?:string; providerSubscriptionRef?:string;
  currentPeriodStart?:string; currentPeriodEnd?:string; createdAt:string; updatedAt:string;
}

export interface PaymentTransaction {
  id:string; subscriptionId?:string; ownerId:string; propertyId?:string; provider:string;
  reference:string; providerTransactionRef?:string; amountMinor:number; currency:string;
  status:PaymentStatus; failureCode?:string; failureReason?:string; idempotencyKey:string;
  createdAt:string; updatedAt:string;
}

export interface PaymentProvider {
  readonly name:string;
  createPayment(input:{amountMinor:number;currency:string;reference:string;customerId:string;returnUrl?:string}):Promise<{status:'PENDING'|'SUCCEEDED'|'FAILED';externalId?:string}>;
}
