export const renewalStatuses = ['DRAFT','ACTIVE','PAUSED','COMPLETED','CANCELLED'] as const;
export type RenewalStatus = typeof renewalStatuses[number];

export const renewalTaskStatuses = ['PLANNED','QUOTING','SCHEDULED','IN_PROGRESS','COMPLETED','SKIPPED'] as const;
export type RenewalTaskStatus = typeof renewalTaskStatuses[number];

export interface RenewalPlan {
  id: string;
  propertyId: string;
  ownerId: string;
  status: RenewalStatus;
  cycleYears: 5;
  startDate: string;
  nextReviewDate: string;
  homeHealthAtStart?: number;
  sourceAuditId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RenewalTask {
  id: string;
  planId: string;
  propertyId: string;
  ownerId: string;
  title: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'URGENT';
  status: RenewalTaskStatus;
  dueDate?: string;
  serviceJobId?: string;
  createdAt: string;
  updatedAt: string;
}
