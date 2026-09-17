import type { ConditionGrade, HomeAuditFinding } from '../domain/property';

const API_BASE_URL = (import.meta.env.VITE_HLABI_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export interface ApiAuditFinding {
  area: string;
  grade: ConditionGrade;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'URGENT';
  recommendedAction: string;
  verified: boolean;
}

export interface ApiAuditRecord {
  id: string;
  propertyId: string;
  ownerId: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW_REQUIRED';
  findings: ApiAuditFinding[];
  createdAt: string;
  updatedAt: string;
}

async function request<T>(path: string, options: RequestInit = {}, userId: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-hlabi-user-id': userId,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json() as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // Keep the HTTP status message when the response is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getHomeownerProperty(propertyId: string, userId: string) {
  return request<{ id: string; ownerId: string; nickname: string; address: Record<string, string> }>(
    `/api/v1/homeowner/properties/${encodeURIComponent(propertyId)}`,
    {},
    userId,
  );
}

export function createHomeAudit(propertyId: string, findings: HomeAuditFinding[], userId: string) {
  const apiFindings: ApiAuditFinding[] = findings.map(({ area, grade, description, priority, recommendedAction, verified }) => ({
    area,
    grade,
    description,
    priority,
    recommendedAction,
    verified,
  }));

  return request<ApiAuditRecord>('/api/v1/homeowner/audits', {
    method: 'POST',
    body: JSON.stringify({ propertyId, findings: apiFindings }),
  }, userId);
}

export function getLatestHomeAudit(propertyId: string, userId: string) {
  return request<ApiAuditRecord>(
    `/api/v1/homeowner/properties/${encodeURIComponent(propertyId)}/audits/latest`,
    {},
    userId,
  );
}

export function getHomeAudit(auditId: string, userId: string) {
  return request<ApiAuditRecord>(`/api/v1/homeowner/audits/${encodeURIComponent(auditId)}`, {}, userId);
}
