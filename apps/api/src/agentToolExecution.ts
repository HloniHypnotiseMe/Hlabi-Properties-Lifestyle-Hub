import type { AgentPermission, AgentToolContext } from './aiDomain.js';
import { requireToolPermission } from './agentTools.js';
import type { AgentRepository } from './agentRepository.js';
import type { HomeownerRepository } from './repository.js';
import type { SupplierRepository } from './supplierRepository.js';
import type { JobRepository } from './jobRepository.js';
import type { MessagingRepository } from './messagingRepository.js';
import { queueNotification } from './messagingService.js';
import type { MessageChannel } from './messagingDomain.js';

export type AgentToolName =
  | 'property.read' | 'audit.read' | 'quotes.read' | 'jobs.read'
  | 'message.draft' | 'message.queue' | 'task.create'
  | 'quote-request.create' | 'job.schedule';

export interface AgentToolExecutionInput {
  tool: AgentToolName;
  propertyId?: string;
  arguments: Record<string, unknown>;
  taskId?: string;
  idempotencyKey?: string;
}

export interface AgentToolExecutionResult {
  tool: AgentToolName;
  result: Record<string, unknown>;
  consequential: boolean;
  approvalRequired: boolean;
}

const permissionByTool: Record<AgentToolName, AgentPermission> = {
  'property.read': 'READ_PROPERTY',
  'audit.read': 'READ_AUDIT',
  'quotes.read': 'READ_QUOTES',
  'jobs.read': 'READ_JOBS',
  'message.draft': 'DRAFT_MESSAGE',
  'message.queue': 'QUEUE_MESSAGE',
  'task.create': 'CREATE_TASK',
  'quote-request.create': 'CREATE_QUOTE_REQUEST',
  'job.schedule': 'SCHEDULE_JOB',
};

const consequentialTools = new Set<AgentToolName>(['message.queue', 'task.create', 'quote-request.create', 'job.schedule']);

export class AgentToolExecutionService {
  constructor(
    private readonly homeownerRepository: HomeownerRepository,
    private readonly supplierRepository: SupplierRepository,
    private readonly jobRepository: JobRepository,
    private readonly messagingRepository: MessagingRepository,
    private readonly agentRepository: AgentRepository,
  ) {}

  async execute(ownerId: string, context: AgentToolContext, input: AgentToolExecutionInput): Promise<AgentToolExecutionResult> {
    requireToolPermission(context, permissionByTool[input.tool]);
    const consequential = consequentialTools.has(input.tool);
    if (consequential && !input.taskId) throw new Error('APPROVAL_TASK_REQUIRED');
    if (consequential && input.taskId) {
      const task = await this.agentRepository.getTaskForOwner(input.taskId, ownerId);
      if (!task) throw new Error('APPROVAL_TASK_NOT_FOUND');
      if (task.status !== 'WAITING_APPROVAL') throw new Error('APPROVAL_REQUIRED');
    }

    const propertyId = input.propertyId ?? String(input.arguments.propertyId ?? '');
    if (!propertyId) throw new Error('PROPERTY_SCOPE_REQUIRED');
    const property = await this.homeownerRepository.getPropertyForOwner(propertyId, ownerId);
    if (!property) throw new Error('PROPERTY_ACCESS_DENIED');

    let result: Record<string, unknown>;
    switch (input.tool) {
      case 'property.read':
        result = { property };
        break;
      case 'audit.read': {
        const auditId = typeof input.arguments.auditId === 'string' ? input.arguments.auditId : undefined;
        const audit = auditId
          ? await this.homeownerRepository.getAuditForOwner(auditId, ownerId)
          : await this.homeownerRepository.getLatestAuditForProperty(propertyId, ownerId);
        if (audit && audit.propertyId !== propertyId) throw new Error('PROPERTY_SCOPE_VIOLATION');
        result = { audit };
        break;
      }
      case 'quotes.read':
        result = { quoteRequests: await this.supplierRepository.listQuoteRequestsForOwner(ownerId, propertyId) };
        break;
      case 'jobs.read':
        result = { jobs: await this.jobRepository.listJobsForOwner(ownerId, propertyId) };
        break;
      case 'message.draft': {
        const channel = String(input.arguments.channel ?? 'EMAIL').toUpperCase();
        const recipient = String(input.arguments.recipient ?? '');
        const template = String(input.arguments.template ?? 'agent-draft');
        result = { channel, recipient, template, payload: (input.arguments.payload as Record<string, unknown>) ?? {}, status: 'DRAFT' };
        break;
      }
      case 'message.queue': {
        const channel = String(input.arguments.channel ?? '').toUpperCase() as MessageChannel;
        if (!['EMAIL', 'WHATSAPP', 'SMS'].includes(channel)) throw new Error('INVALID_MESSAGE_CHANNEL');
        const recipient = String(input.arguments.recipient ?? '');
        if (!recipient) throw new Error('MESSAGE_RECIPIENT_REQUIRED');
        const message = await queueNotification(this.messagingRepository, {
          ownerId,
          propertyId,
          channel,
          recipient,
          template: String(input.arguments.template ?? 'agent-message'),
          payload: (input.arguments.payload as Record<string, unknown>) ?? {},
          idempotencyKey: input.idempotencyKey ?? String(input.arguments.idempotencyKey ?? crypto.randomUUID()),
        });
        result = { message };
        break;
      }
      case 'task.create': {
        const agentId = String(input.arguments.agentId ?? '');
        const agent = await this.agentRepository.getStaffForOwner(agentId, ownerId);
        if (!agent || agent.status !== 'ACTIVE') throw new Error('AGENT_NOT_FOUND');
        const task = await this.agentRepository.createTask({
          ownerId,
          agentId,
          propertyId,
          type: String(input.arguments.type ?? 'FOLLOW_UP'),
          input: (input.arguments.input as Record<string, unknown>) ?? {},
          requiresApproval: true,
          status: 'QUEUED',
          idempotencyKey: input.idempotencyKey ?? String(input.arguments.idempotencyKey ?? crypto.randomUUID()),
        });
        await this.agentRepository.appendEvent({ taskId: task.id, ownerId, eventType: 'TOOL_TASK_CREATED', payload: { propertyId } });
        result = { task };
        break;
      }
      case 'quote-request.create': {
        const suppliers = await this.supplierRepository.listEligibleSuppliers(typeof input.arguments.category === 'string' ? input.arguments.category : undefined);
        const request = await this.supplierRepository.createQuoteRequest({
          propertyId,
          ownerId,
          auditId: typeof input.arguments.auditId === 'string' ? input.arguments.auditId : undefined,
          area: typeof input.arguments.area === 'string' ? input.arguments.area : undefined,
          title: String(input.arguments.title ?? 'Agent quote request'),
          description: String(input.arguments.description ?? ''),
          priority: (['LOW', 'MEDIUM', 'URGENT'] as const).includes(input.arguments.priority as never) ? input.arguments.priority as 'LOW' | 'MEDIUM' | 'URGENT' : 'MEDIUM',
          status: 'OPEN',
          supplierIds: suppliers.map((s) => s.id),
        });
        result = { request };
        break;
      }
      case 'job.schedule': {
        const jobId = String(input.arguments.jobId ?? '');
        const scheduledFor = String(input.arguments.scheduledFor ?? '');
        if (!jobId || !scheduledFor) throw new Error('JOB_AND_SCHEDULE_REQUIRED');
        const job = await this.jobRepository.getJobForOwner(jobId, ownerId);
        if (!job || job.propertyId !== propertyId) throw new Error('JOB_SCOPE_VIOLATION');
        const updated = await this.jobRepository.updateJobStatus(jobId, ownerId, 'SCHEDULED', scheduledFor);
        result = { job: updated };
        break;
      }
    }
    if (input.taskId) await this.agentRepository.appendEvent({ taskId: input.taskId, ownerId, eventType: 'TOOL_EXECUTED', payload: { tool: input.tool, propertyId, consequential } });
    return { tool: input.tool, result, consequential, approvalRequired: consequential };
  }
}
