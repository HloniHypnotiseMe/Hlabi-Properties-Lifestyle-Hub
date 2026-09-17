export const serviceJobStatuses = ['REQUESTED','SCHEDULED','IN_PROGRESS','AWAITING_EVIDENCE','COMPLETED','CANCELLED'] as const;
export type ServiceJobStatus = typeof serviceJobStatuses[number];

export const evidenceTypes = ['BEFORE','PROGRESS','AFTER','DOCUMENT'] as const;
export type EvidenceType = typeof evidenceTypes[number];

export interface ServiceJob {
  id: string;
  propertyId: string;
  ownerId: string;
  supplierId?: string;
  quoteId?: string;
  status: ServiceJobStatus;
  details: Record<string, unknown>;
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobEvidence {
  id: string;
  jobId: string;
  ownerId: string;
  propertyId: string;
  evidenceType: EvidenceType;
  storageKey: string;
  metadata: Record<string, unknown>;
  capturedAt: string;
  createdAt: string;
}
