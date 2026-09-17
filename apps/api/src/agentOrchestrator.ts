import type { AgentRepository } from './agentRepository.js';
import type { AiGenerationRequest, AgentToolContext } from './aiDomain.js';
import type { AiProviderAdapter } from './aiProvider.js';
import { defaultReadOnlyPermissions, requireToolPermission } from './agentTools.js';
import { queueAgentTask } from './agentService.js';

export interface AgentOrchestrationRequest {
  ownerId: string;
  agentId: string;
  propertyId?: string;
  taskType: string;
  prompt: string;
  model: string;
  provider?: 'OLLAMA';
  requiresApproval?: boolean;
  idempotencyKey?: string;
}

export async function orchestrateAgentTask(
  repository: AgentRepository,
  aiProvider: AiProviderAdapter,
  request: AgentOrchestrationRequest,
) {
  const task = await queueAgentTask(repository, {
    ownerId: request.ownerId,
    agentId: request.agentId,
    propertyId: request.propertyId,
    type: request.taskType,
    input: { prompt: request.prompt, model: request.model, provider: request.provider ?? 'OLLAMA' },
    requiresApproval: request.requiresApproval ?? true,
    idempotencyKey: request.idempotencyKey,
  });
  if (!task) return null;

  const context: AgentToolContext = {
    ownerId: request.ownerId,
    propertyId: request.propertyId,
    permissions: defaultReadOnlyPermissions(),
  };
  requireToolPermission(context, 'DRAFT_MESSAGE');

  await repository.updateTask(task.id, request.ownerId, { status: 'RUNNING', startedAt: new Date().toISOString() });
  await repository.appendEvent({ taskId: task.id, ownerId: request.ownerId, eventType: 'AI_STARTED', payload: { provider: request.provider ?? 'OLLAMA', model: request.model } });

  try {
    const generation: AiGenerationRequest = {
      provider: request.provider ?? 'OLLAMA',
      model: request.model,
      prompt: request.prompt,
      system: 'You are a Hlabi Properties digital staff assistant. Produce factual, reviewable work. Do not claim to have taken an external action unless the platform confirms it.',
    };
    const result = await aiProvider.generate(generation);
    const status = task.requiresApproval ? 'WAITING_APPROVAL' : 'COMPLETED';
    const updated = await repository.updateTask(task.id, request.ownerId, {
      status,
      output: { text: result.text, provider: result.provider, model: result.model },
      completedAt: status === 'COMPLETED' ? new Date().toISOString() : undefined,
    });
    await repository.appendEvent({ taskId: task.id, ownerId: request.ownerId, eventType: status === 'WAITING_APPROVAL' ? 'AI_OUTPUT_AWAITING_APPROVAL' : 'AI_COMPLETED', payload: { provider: result.provider, model: result.model } });
    return updated;
  } catch (error) {
    const errorCode = error instanceof Error ? error.message.slice(0, 120) : 'AI_PROVIDER_ERROR';
    const updated = await repository.updateTask(task.id, request.ownerId, { status: 'FAILED', errorCode, completedAt: new Date().toISOString() });
    await repository.appendEvent({ taskId: task.id, ownerId: request.ownerId, eventType: 'AI_FAILED', payload: { errorCode } });
    return updated;
  }
}
