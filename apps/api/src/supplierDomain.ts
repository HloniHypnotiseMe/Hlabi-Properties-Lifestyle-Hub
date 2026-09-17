export const quoteRequestStatuses = ['OPEN', 'QUOTING', 'SELECTED', 'CANCELLED', 'COMPLETED'] as const;
export type QuoteRequestStatus = typeof quoteRequestStatuses[number];

export const quoteStatuses = ['REQUESTED', 'SUBMITTED', 'ACCEPTED', 'DECLINED', 'EXPIRED'] as const;
export type QuoteStatus = typeof quoteStatuses[number];

export interface SupplierProfile {
  id: string;
  businessName: string;
  categories: string[];
  serviceAreas: string[];
  verified: boolean;
  active: boolean;
}

export interface QuoteRequest {
  id: string;
  propertyId: string;
  ownerId: string;
  auditId?: string;
  area?: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'URGENT';
  status: QuoteRequestStatus;
  supplierIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierQuote {
  id: string;
  quoteRequestId: string;
  supplierId: string;
  amountCents?: number;
  currency: string;
  details: Record<string, unknown>;
  status: QuoteStatus;
  validUntil?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}
