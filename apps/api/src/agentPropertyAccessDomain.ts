export const agentPropertyAccessStatuses = ['ACTIVE','REVOKED'] as const;
export type AgentPropertyAccessStatus = typeof agentPropertyAccessStatuses[number];

export interface AgentPropertyAccess {
  id: string;
  agentId: string;
  ownerId: string;
  propertyId: string;
  status: AgentPropertyAccessStatus;
  grantedBy: string;
  createdAt: string;
  updatedAt: string;
}
