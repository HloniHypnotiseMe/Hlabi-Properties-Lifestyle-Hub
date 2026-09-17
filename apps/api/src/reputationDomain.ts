export const reputationReviewStatuses = ['PENDING','PUBLISHED','HIDDEN','FLAGGED'] as const;
export type ReputationReviewStatus = typeof reputationReviewStatuses[number];

export interface ReputationReview {
  id: string;
  ownerId: string;
  propertyId: string;
  jobId?: string;
  supplierId?: string;
  agentId?: string;
  rating: number;
  title?: string;
  comment?: string;
  status: ReputationReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReputationSummary {
  propertyId: string;
  reviewCount: number;
  averageRating: number | null;
  latestReviewAt?: string;
}
