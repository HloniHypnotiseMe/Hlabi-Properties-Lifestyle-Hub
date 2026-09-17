import { z } from 'zod';
import type { Express, RequestHandler } from 'express';
import type { AgentRepository } from './agentRepository.js';
import type { AiProviderAdapter } from './aiProvider.js';
import { orchestrateAgentTask } from './agentOrchestrator.js';

const schema = z.object({
  agentId: z.string().min(1), propertyId: z.string().min(1).optional(), taskType: z.string().min(2).max(120), prompt: z.string().min(1).max(10000), model: z.string().min(1).max(160), provider: z.literal('OLLAMA').default('OLLAMA'), requiresApproval: z.boolean().default(true), idempotencyKey: z.string().min(8).max(200).optional(),
});

export function registerAgentAiRoutes(app: Express, authenticated: RequestHandler, repository: AgentRepository, provider: AiProviderAdapter) {
  app.post('/api/v1/agent-ai/tasks', authenticated, async (req, res) => {
    const principal = res.locals.principal; if (!principal || principal.role !== 'AGENT') return res.status(403).json({ error: 'ROLE_NOT_ALLOWED' });
    const parsed = schema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: 'INVALID_AI_TASK', details: parsed.error.flatten() });
    const task = await orchestrateAgentTask(repository, provider, { ownerId: principal.userId, ...parsed.data }); if (!task) return res.status(404).json({ error: 'AGENT_NOT_FOUND_OR_INACTIVE' });
    return res.status(202).json(task);
  });
  app.get('/api/v1/agent-ai/tasks', authenticated, async (req, res) => {
    const principal = res.locals.principal; if (!principal || principal.role !== 'AGENT') return res.status(403).json({ error: 'ROLE_NOT_ALLOWED' });
    const agentId = typeof req.query.agentId === 'string' ? req.query.agentId : undefined;
    return res.json({ tasks: await repository.listTasks(principal.userId, agentId) });
  });
}
