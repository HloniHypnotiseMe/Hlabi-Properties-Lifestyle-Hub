export type UserRole = 'HOMEOWNER' | 'BUYER' | 'SELLER' | 'INVESTOR' | 'AGENT' | 'SUPPLIER' | 'ADMIN';

export type PropertyLifecycle =
  | 'draft'
  | 'onboarding'
  | 'audited'
  | 'renewal-ready'
  | 'active-plan'
  | 'maintenance'
  | 'sale-preparation'
  | 'archived';

export type ConditionGrade = 'GREEN' | 'AMBER' | 'RED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type AuditArea =
  | 'roof'
  | 'structure'
  | 'electrical'
  | 'plumbing'
  | 'exterior'
  | 'interior'
  | 'security'
  | 'grounds'
  | 'compliance';

export interface PropertyAddress {
  line1: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface Property {
  id: string;
  ownerId: string;
  nickname: string;
  address: PropertyAddress;
  propertyType: 'HOUSE' | 'APARTMENT' | 'TOWNHOUSE' | 'OTHER';
  lifecycle: PropertyLifecycle;
  conditionGrade?: ConditionGrade;
  conditionScore?: number;
  acquiredAt?: string;
  nextFiveYearReview?: string;
}

export interface HomeAuditFinding {
  id: string;
  area: AuditArea;
  title: string;
  description: string;
  grade: ConditionGrade;
  priority: Priority;
  recommendedAction: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  verified: boolean;
}

export interface HomeAudit {
  id: string;
  propertyId: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW_REQUIRED';
  inspectedAt?: string;
  conditionScore?: number;
  grade?: ConditionGrade;
  findings: HomeAuditFinding[];
}

export interface RenewalTask {
  id: string;
  propertyId: string;
  title: string;
  area: AuditArea;
  priority: Priority;
  dueDate: string;
  status: 'OPEN' | 'QUOTING' | 'BOOKED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface RenewalPlan {
  id: string;
  propertyId: string;
  status: 'PROPOSED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  cycleYears: 5;
  startDate: string;
  nextReviewDate: string;
  tasks: RenewalTask[];
}

export interface SupplierQuote {
  id: string;
  propertyId: string;
  taskId: string;
  supplierName: string;
  amount: number;
  status: 'REQUESTED' | 'RECEIVED' | 'SHORTLISTED' | 'ACCEPTED' | 'DECLINED';
}

export interface ActivityEvent {
  id: string;
  propertyId?: string;
  type: 'AUDIT' | 'QUOTE' | 'JOB' | 'DOCUMENT' | 'PLAN' | 'MESSAGE';
  title: string;
  occurredAt: string;
}

export interface HomeownerDashboardData {
  userId: string;
  role: 'HOMEOWNER';
  properties: Property[];
  audits: HomeAudit[];
  renewalPlans: RenewalPlan[];
  quotes: SupplierQuote[];
  activity: ActivityEvent[];
}
