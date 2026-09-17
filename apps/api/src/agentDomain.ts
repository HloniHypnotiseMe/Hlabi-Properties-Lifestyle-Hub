export const agentRoles = ['LISTING_MANAGER','LEAD_FOLLOW_UP','MARKETING','CRM_COORDINATOR','COMMUNICATIONS','SCHEDULING','REPUTATION'] as const;
export type AgentRole = typeof agentRoles[number];

export const agentStatuses = ['ACTIVE','PAUSED','DISABLED'] as const;
export type AgentStatus = typeof agentStatuses[number];

export const agentTaskStatuses = ['QUEUED','RUNNING','WAITING_APPROVAL','COMPLETED','FAILED','CANCELLED'] as const;
export type AgentTaskStatus = typeof agentTaskStatuses[number];

export interface AgentStaffMember {
  id: string;
  ownerId: string;
  role: AgentRole;
  name: string;
  description?: string;
  status: AgentStatus;
  configuration: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTask {
  id: string;
  agentId: string;
  ownerId: string;
  propertyId?: string;
  type: string;
  input: Record<string, unknown>;
  status: AgentTaskStatus;
  output?: Record<string, unknown>;
  requiresApproval: boolean;
  idempotencyKey?: string;
  errorCode?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentTaskEvent {
  id: string;
  taskId: string;
  ownerId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}
