import { randomUUID } from 'node:crypto';
import type { AgentPermission, AgentToolContext } from './aiDomain.js';
import { requireToolPermission } from './agentTools.js';
import type { AgentRepository } from './agentRepository.js';
import type { HomeownerRepository } from './repository.js';
import type { SupplierRepository } from './supplierRepository.js';
import type { JobRepository } from './jobRepository.js';
import type { MessagingRepository } from './messagingRepository.js';
import { queueNotification } from './messagingService.js';
import type { MessageChannel } from './messagingDomain.js';
import type { AgentPropertyAccessRepository } from './agentPropertyAccessRepository.js';
import type { BillingRepository } from './billingRepository.js';
import type { PaymentProvider } from './billingDomain.js';

export type AgentToolName = 'property.read' | 'audit.read' | 'quotes.read' | 'jobs.read' | 'message.draft' | 'message.queue' | 'task.create' | 'quote-request.create' | 'job.schedule' | 'job.settle';
export interface AgentToolExecutionInput { tool: AgentToolName; agentId: string; propertyId?: string; arguments: Record<string, unknown>; taskId?: string; idempotencyKey?: string; }
export interface AgentToolExecutionResult { tool: AgentToolName; result: Record<string, unknown>; consequential: boolean; approvalRequired: boolean; }
const permissionByTool: Record<AgentToolName, AgentPermission> = {'property.read':'READ_PROPERTY','audit.read':'READ_AUDIT','quotes.read':'READ_QUOTES','jobs.read':'READ_JOBS','message.draft':'DRAFT_MESSAGE','message.queue':'QUEUE_MESSAGE','task.create':'CREATE_TASK','quote-request.create':'CREATE_QUOTE_REQUEST','job.schedule':'SCHEDULE_JOB','job.settle':'SETTLE_JOB'};
const consequentialTools = new Set<AgentToolName>(['message.queue','task.create','quote-request.create','job.schedule','job.settle']);

export class AgentToolExecutionService {
  constructor(private readonly homeownerRepository: HomeownerRepository, private readonly supplierRepository: SupplierRepository, private readonly jobRepository: JobRepository, private readonly messagingRepository: MessagingRepository, private readonly agentRepository: AgentRepository, private readonly propertyAccessRepository: AgentPropertyAccessRepository, private readonly billingRepository: BillingRepository, private readonly paymentProvider: PaymentProvider) {}
  async execute(ownerId: string, context: AgentToolContext, input: AgentToolExecutionInput): Promise<AgentToolExecutionResult> {
    const staff = await this.agentRepository.getStaffForOwner(input.agentId, ownerId); if (!staff || staff.status !== 'ACTIVE') throw new Error('AGENT_NOT_FOUND');
    requireToolPermission(context, permissionByTool[input.tool]);
    const propertyId = input.propertyId ?? String(input.arguments.propertyId ?? ''); if (!propertyId) throw new Error('PROPERTY_SCOPE_REQUIRED');
    const property = await this.homeownerRepository.getPropertyForOwner(propertyId, ownerId); if (!property) throw new Error('PROPERTY_ACCESS_DENIED');
    const access = await this.propertyAccessRepository.getActive(input.agentId, ownerId, propertyId); if (!access) throw new Error('AGENT_PROPERTY_ACCESS_DENIED');
    const consequential = consequentialTools.has(input.tool);
    if (consequential) {
      if (!input.taskId) throw new Error('APPROVAL_TASK_REQUIRED');
      const task = await this.agentRepository.getTaskForOwner(input.taskId, ownerId); if (!task) throw new Error('APPROVAL_TASK_NOT_FOUND');
      if (task.agentId !== input.agentId || task.propertyId !== propertyId) throw new Error('AGENT_TASK_SCOPE_VIOLATION');
      if (task.status !== 'WAITING_APPROVAL') throw new Error('APPROVAL_REQUIRED');
      if (!await this.agentRepository.hasApprovalGrant(task.id, ownerId)) throw new Error('HUMAN_APPROVAL_REQUIRED');
    }
    let result: Record<string, unknown>;
    switch (input.tool) {
      case 'property.read': result = { property }; break;
      case 'audit.read': { const auditId = typeof input.arguments.auditId === 'string' ? input.arguments.auditId : undefined; const audit = auditId ? await this.homeownerRepository.getAuditForOwner(auditId, ownerId) : await this.homeownerRepository.getLatestAuditForProperty(propertyId, ownerId); if (audit && audit.propertyId !== propertyId) throw new Error('PROPERTY_SCOPE_VIOLATION'); result = { audit }; break; }
      case 'quotes.read': result = { quoteRequests: await this.supplierRepository.listQuoteRequestsForOwner(ownerId, propertyId) }; break;
      case 'jobs.read': result = { jobs: await this.jobRepository.listJobsForOwner(ownerId, propertyId) }; break;
      case 'message.draft': result = { channel:String(input.arguments.channel ?? 'EMAIL').toUpperCase(), recipient:String(input.arguments.recipient ?? ''), template:String(input.arguments.template ?? 'agent-draft'), payload:(input.arguments.payload as Record<string, unknown>) ?? {}, status:'DRAFT' }; break;
      case 'message.queue': { const channel = String(input.arguments.channel ?? '').toUpperCase() as MessageChannel; if (!['EMAIL','WHATSAPP','SMS'].includes(channel)) throw new Error('INVALID_MESSAGE_CHANNEL'); const recipient = String(input.arguments.recipient ?? ''); if (!recipient) throw new Error('MESSAGE_RECIPIENT_REQUIRED'); const message = await queueNotification(this.messagingRepository, { ownerId, propertyId, channel, recipient, template:String(input.arguments.template ?? 'agent-message'), payload:(input.arguments.payload as Record<string, unknown>) ?? {}, idempotencyKey:input.idempotencyKey ?? String(input.arguments.idempotencyKey ?? randomUUID()) }); result = { message }; break; }
      case 'task.create': { const agentId = String(input.arguments.agentId ?? ''); if (agentId !== input.agentId) throw new Error('AGENT_SCOPE_VIOLATION'); const target = await this.agentRepository.getStaffForOwner(agentId, ownerId); if (!target || target.status !== 'ACTIVE') throw new Error('AGENT_NOT_FOUND'); const task = await this.agentRepository.createTask({ ownerId, agentId, propertyId, type:String(input.arguments.type ?? 'FOLLOW_UP'), input:(input.arguments.input as Record<string, unknown>) ?? {}, requiresApproval:true, status:'QUEUED', idempotencyKey:input.idempotencyKey ?? String(input.arguments.idempotencyKey ?? randomUUID()) }); await this.agentRepository.appendEvent({taskId:task.id,ownerId,eventType:'TOOL_TASK_CREATED',payload:{propertyId}}); result = { task }; break; }
      case 'quote-request.create': { const auditId = typeof input.arguments.auditId === 'string' ? input.arguments.auditId : undefined; if (auditId) { const audit = await this.homeownerRepository.getAuditForOwner(auditId, ownerId); if (!audit || audit.propertyId !== propertyId) throw new Error('PROPERTY_SCOPE_VIOLATION'); } const suppliers = await this.supplierRepository.listEligibleSuppliers(typeof input.arguments.category === 'string' ? input.arguments.category : undefined); const priorityValue = String(input.arguments.priority ?? 'MEDIUM').toUpperCase(); const priority = (['LOW','MEDIUM','URGENT'] as const).includes(priorityValue as 'LOW'|'MEDIUM'|'URGENT') ? priorityValue as 'LOW'|'MEDIUM'|'URGENT' : 'MEDIUM'; const request = await this.supplierRepository.createQuoteRequest({propertyId,ownerId,auditId,area:typeof input.arguments.area === 'string' ? input.arguments.area : undefined,title:String(input.arguments.title ?? 'Agent quote request'),description:String(input.arguments.description ?? 'Agent-created quote request'),priority,status:'OPEN',supplierIds:suppliers.map(s => s.id)}); result = { request }; break; }
      case 'job.schedule': { const jobId = String(input.arguments.jobId ?? ''); const scheduledFor = String(input.arguments.scheduledFor ?? ''); if (!jobId || !scheduledFor) throw new Error('JOB_AND_SCHEDULE_REQUIRED'); const job = await this.jobRepository.getJobForOwner(jobId, ownerId); if (!job || job.propertyId !== propertyId) throw new Error('JOB_SCOPE_VIOLATION'); result = { job: await this.jobRepository.updateJobStatus(jobId, ownerId, 'SCHEDULED', scheduledFor) }; break; }
      case 'job.settle': { const jobId = String(input.arguments.jobId ?? ''); if (!jobId) throw new Error('JOB_REQUIRED'); const job = await this.jobRepository.getJobForOwner(jobId, ownerId); if (!job || job.propertyId !== propertyId) throw new Error('JOB_SCOPE_VIOLATION'); if (['CANCELLED','COMPLETED'].includes(job.status)) throw new Error('JOB_NOT_PAYABLE'); const existing = await this.billingRepository.getSuccessfulTransactionForJob(job.id, ownerId); if (existing) { result = { transaction: existing, alreadySettled: true }; break; } if (!job.quoteId) throw new Error('JOB_QUOTE_REQUIRED'); const quotes = await this.supplierRepository.listQuotesForOwnerRequest(String(job.details.quoteRequestId ?? ''), ownerId); const quote = quotes.find(q => q.id === job.quoteId && q.status === 'ACCEPTED'); if (!quote || !quote.amountCents || quote.amountCents <= 0) throw new Error('AUTHORITATIVE_QUOTE_AMOUNT_REQUIRED'); const currency = quote.currency.toUpperCase(); const amountMinor = quote.amountCents; const reference = `JOB-${job.id}-${input.idempotencyKey ?? randomUUID()}`; const payment = await this.paymentProvider.createPayment({amountMinor,currency,reference,customerId:ownerId}); const transaction = await this.billingRepository.createTransaction({ownerId,propertyId:job.propertyId,jobId:job.id,provider:this.paymentProvider.name,reference,amountMinor,currency,status:payment.status,providerTransactionRef:payment.externalId,idempotencyKey:input.idempotencyKey ?? reference}); result = { transaction, jobId:job.id, authoritativeQuoteId:quote.id, amountMinor, currency }; break; }
    }
    if (input.taskId) { await this.agentRepository.appendEvent({taskId:input.taskId,ownerId,eventType:'TOOL_EXECUTED',payload:{tool:input.tool,propertyId,consequential}}); await this.agentRepository.updateTask(input.taskId,ownerId,{status:'COMPLETED',completedAt:new Date().toISOString()}); }
    return {tool:input.tool,result,consequential,approvalRequired:consequential};
  }
}
