export type IntegrationName =
  | 'orchestration'
  | 'multi-agent'
  | 'memory'
  | 'email'
  | 'whatsapp'
  | 'sms'
  | 'scraping'
  | 'voice'
  | 'content'
  | 'payments'
  | 'llm'
  | 'hosting';

export interface IntegrationConfig {
  name: IntegrationName;
  enabled: boolean;
  baseUrl?: string;
  apiKeyEnv?: string;
  notes?: string;
}

export interface MessageRequest {
  recipient: string;
  body: string;
  metadata?: Record<string, string>;
}

export interface MessageResult {
  provider: string;
  accepted: boolean;
  externalId?: string;
}

export interface EmailRequest extends MessageRequest {
  subject: string;
}

export interface PaymentRequest {
  amountMinor: number;
  currency: string;
  reference: string;
  customerId: string;
  returnUrl?: string;
}

export interface PaymentResult {
  provider: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  externalId?: string;
}

export interface AgentWorkflowRequest {
  workflow: string;
  input: Record<string, unknown>;
}

export interface AgentWorkflowResult {
  provider: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  runId?: string;
}

export interface MemoryRecord {
  namespace: string;
  userId: string;
  content: string;
  metadata?: Record<string, string>;
}

export interface MemorySearchResult {
  id: string;
  score: number;
  content: string;
  metadata?: Record<string, string>;
}

export interface IntegrationRegistry {
  list(): IntegrationConfig[];
}
