export const aiProviders = ['OLLAMA'] as const;
export type AiProvider = typeof aiProviders[number];

export type AgentPermission =
  | 'READ_PROPERTY'
  | 'READ_AUDIT'
  | 'READ_QUOTES'
  | 'READ_JOBS'
  | 'DRAFT_MESSAGE'
  | 'QUEUE_MESSAGE'
  | 'CREATE_TASK'
  | 'CREATE_QUOTE_REQUEST'
  | 'SCHEDULE_JOB';

export interface AiGenerationRequest {
  provider: AiProvider;
  model: string;
  system?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiGenerationResult {
  provider: AiProvider;
  model: string;
  text: string;
  raw?: Record<string, unknown>;
}

export interface AgentToolContext {
  ownerId: string;
  propertyId?: string;
  permissions: AgentPermission[];
}

export interface AgentToolDefinition {
  name: string;
  permission: AgentPermission;
  description: string;
}
