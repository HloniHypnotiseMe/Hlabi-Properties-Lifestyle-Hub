export const acceleratorStages = ['ACADEMY','AGENT','OFFICE','FRANCHISE'] as const;
export type AcceleratorStage = typeof acceleratorStages[number];

export const acceleratorStatuses = ['IN_PROGRESS','READY','BLOCKED','APPROVED'] as const;
export type AcceleratorStatus = typeof acceleratorStatuses[number];

export interface AcceleratorProfile {
  id: string;
  userId: string;
  stage: AcceleratorStage;
  status: AcceleratorStatus;
  checklist: Record<string, boolean>;
  territory?: string;
  officeName?: string;
  franchiseOpportunityId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const defaultAcceleratorChecklist: Record<AcceleratorStage, string[]> = {
  ACADEMY: ['foundationComplete', 'evidencePackageReady'],
  AGENT: ['professionalProfileComplete', 'regulatoryPathwayAcknowledged', 'marketReadinessComplete'],
  OFFICE: ['territoryDefined', 'officePlanComplete', 'supplierNetworkReady', 'customerJourneyReady'],
  FRANCHISE: ['officeReady', 'commercialPlanComplete', 'franchiseReviewSubmitted']
};

export function nextAcceleratorStage(stage: AcceleratorStage): AcceleratorStage | null {
  const i = acceleratorStages.indexOf(stage);
  return i >= 0 && i < acceleratorStages.length - 1 ? acceleratorStages[i + 1] : null;
}
