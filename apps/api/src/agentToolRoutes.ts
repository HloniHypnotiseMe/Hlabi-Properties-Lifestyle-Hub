import type { Express, RequestHandler } from 'express';
import { z } from 'zod';
import type { AgentRepository } from './agentRepository.js';
import type { AgentToolContext } from './aiDomain.js';
import { AgentToolExecutionService } from './agentToolExecution.js';
import type { HomeownerRepository } from './repository.js';
import type { SupplierRepository } from './supplierRepository.js';
import type { JobRepository } from './jobRepository.js';
import type { MessagingRepository } from './messagingRepository.js';
import { authenticatedPrincipal } from './authentication.js';

const toolSchema = z.object({
  tool: z.enum(['property.read','audit.read','quotes.read','jobs.read','message.draft','message.queue','task.create','quote-request.create','job.schedule']),
  propertyId: z.string().min(1).optional(),
  arguments: z.record(z.unknown()).default({}),
  taskId: z.string().min(1).optional(),
  idempotencyKey: z.string().min(1).max(200).optional(),
});

const approveSchema = z.object({ action: z.literal('approve') });

export function registerAgentToolRoutes(
  app: Express,
  authenticated: RequestHandler,
  agentRepository: AgentRepository,
  homeownerRepository: HomeownerRepository,
  supplierRepository: SupplierRepository,
  jobRepository: JobRepository,
  messagingRepository: MessagingRepository,
) {
  const service = new AgentToolExecutionService(homeownerRepository, supplierRepository, jobRepository, messagingRepository, agentRepository);

  app.post('/api/v1/agent-ai/tools/execute', authenticated, async (req, res) => {
    const principal = authenticatedPrincipal(res);
    if (principal.role !== 'AGENT') return res.status(403).json({ error: 'ROLE_NOT_ALLOWED' });
    const parsed = toolSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'INVALID_TOOL_REQUEST', details: parsed.error.flatten() });
    const context: AgentToolContext = { ownerId: principal.userId, propertyId: parsed.data.propertyId, permissions: Array.isArray(req.body.permissions) ? req.body.permissions : [] };
    try {
      const result = await service.execute(principal.userId, context, parsed.data);
      return res.status(200).json(result);
    } catch (error) {
      const code = error instanceof Error ? error.message : 'TOOL_EXECUTION_FAILED';
      const status = code.includes('PERMISSION_DENIED') || code.includes('ACCESS_DENIED') || code.includes('SCOPE_VIOLATION') ? 403 : code.includes('APPROVAL') ? 409 : 400;
      return res.status(status).json({ error: code });
    }
  });

  app.post('/api/v1/agent-ai/tasks/:taskId/approve', authenticated, async (req, res) => {
    const principal = authenticatedPrincipal(res);
    if (principal.role !== 'AGENT') return res.status(403).json({ error: 'ROLE_NOT_ALLOWED' });
    const parsed = approveSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'APPROVAL_REQUIRED' });
    const task = await agentRepository.getTaskForOwner(req.params.taskId, principal.userId);
    if (!task) return res.status(404).json({ error: 'TASK_NOT_FOUND' });
    if (task.status !== 'WAITING_APPROVAL') return res.status(409).json({ error: 'TASK_NOT_AWAITING_APPROVAL' });
    const updated = await agentRepository.updateTask(task.id, principal.userId, { status: 'WAITING_APPROVAL' });
    await agentRepository.appendEvent({ taskId: task.id, ownerId: principal.userId, eventType: 'HUMAN_APPROVAL_GRANTED', payload: {} });
    return res.json({ task: updated, approved: true, nextStep: 'EXECUTE_APPROVED_TOOL' });
  });
}
