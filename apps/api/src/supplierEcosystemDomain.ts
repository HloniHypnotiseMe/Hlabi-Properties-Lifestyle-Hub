export const supplierOnboardingStatuses = ['DRAFT','SUBMITTED','VERIFIED','SUSPENDED'] as const;
export type SupplierOnboardingStatus = typeof supplierOnboardingStatuses[number];

export interface SupplierEcosystemProfile {
  supplierId: string;
  status: SupplierOnboardingStatus;
  businessProfileComplete: boolean;
  serviceAreasComplete: boolean;
  categoriesComplete: boolean;
  evidenceComplete: boolean;
  termsAccepted: boolean;
  reputationScore?: number;
  completedJobs: number;
  createdAt: string;
  updatedAt: string;
}

export const supplierEligibilityChecklist = [
  'businessProfileComplete',
  'serviceAreasComplete',
  'categoriesComplete',
  'evidenceComplete',
  'termsAccepted',
] as const;

export function isSupplierEligible(profile: SupplierEcosystemProfile) {
  return profile.status === 'VERIFIED' && supplierEligibilityChecklist.every((key) => profile[key]);
}
