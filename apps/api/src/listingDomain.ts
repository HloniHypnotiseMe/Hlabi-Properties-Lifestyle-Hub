export const listingStatuses = ['DRAFT','READY_TO_LIST','LISTED','PAUSED','SOLD','WITHDRAWN'] as const;
export type ListingStatus = typeof listingStatuses[number];

export interface ListingRecord {
  id: string;
  propertyId: string;
  sellerId: string;
  status: ListingStatus;
  title: string;
  description: string;
  askingPriceCents?: number;
  bedrooms?: number;
  bathrooms?: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
