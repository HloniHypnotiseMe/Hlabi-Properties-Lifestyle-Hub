export const auditAreas = ['roof', 'structure', 'electrical', 'plumbing', 'exterior', 'interior', 'security', 'grounds', 'compliance'] as const;
export type AuditArea = typeof auditAreas[number];

export const conditionGrades = ['GREEN', 'AMBER', 'RED'] as const;
export type ConditionGrade = typeof conditionGrades[number];

export type UserRole = 'HOMEOWNER' | 'BUYER' | 'SELLER' | 'INVESTOR' | 'AGENT' | 'SUPPLIER' | 'ADMIN';

export interface PropertyRecord {
  id: string;
  ownerId: string;
  nickname: string;
  address: Record<string, string>;
  propertyType: 'HOUSE' | 'APARTMENT' | 'TOWNHOUSE' | 'OTHER';
  lifecycle: 'draft' | 'onboarding' | 'audited' | 'renewal-ready' | 'active-plan' | 'maintenance' | 'sale-preparation' | 'archived';
}

export interface AuditFindingRecord {
  area: AuditArea;
  grade: ConditionGrade;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'URGENT';
  recommendedAction: string;
  verified: boolean;
}

export interface AuditRecord {
  id: string;
  propertyId: string;
  ownerId: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW_REQUIRED';
  findings: AuditFindingRecord[];
  createdAt: string;
  updatedAt: string;
}
