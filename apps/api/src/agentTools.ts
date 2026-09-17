import type { AgentPermission, AgentToolContext, AgentToolDefinition } from './aiDomain.js';

export const agentTools: AgentToolDefinition[] = [
  { name: 'property.read', permission: 'READ_PROPERTY', description: 'Read property information available to the authenticated agent.' },
  { name: 'audit.read', permission: 'READ_AUDIT', description: 'Read homeowner audit findings available to the authenticated agent.' },
  { name: 'quotes.read', permission: 'READ_QUOTES', description: 'Read supplier quote information.' },
  { name: 'jobs.read', permission: 'READ_JOBS', description: 'Read service-job information.' },
  { name: 'message.draft', permission: 'DRAFT_MESSAGE', description: 'Prepare a communication draft for human review.' },
  { name: 'message.queue', permission: 'QUEUE_MESSAGE', description: 'Queue a message through the messaging layer; production policy may require approval.' },
  { name: 'task.create', permission: 'CREATE_TASK', description: 'Create a follow-up agent task.' },
  { name: 'quote-request.create', permission: 'CREATE_QUOTE_REQUEST', description: 'Create a supplier quote request.' },
  { name: 'job.schedule', permission: 'SCHEDULE_JOB', description: 'Propose or schedule a service job.' },
  { name: 'job.settle', permission: 'SETTLE_JOB', description: 'Pay the authoritative stored quote amount for a service job after explicit human approval.' },
];

export function canUseTool(context: AgentToolContext, permission: AgentPermission): boolean {
  return context.permissions.includes(permission);
}

export function requireToolPermission(context: AgentToolContext, permission: AgentPermission): void {
  if (!canUseTool(context, permission)) throw new Error(`AGENT_PERMISSION_DENIED:${permission}`);
}

export function defaultReadOnlyPermissions(): AgentPermission[] {
  return ['READ_PROPERTY', 'READ_AUDIT', 'READ_QUOTES', 'READ_JOBS', 'DRAFT_MESSAGE'];
}
