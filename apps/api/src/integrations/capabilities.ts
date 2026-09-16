import type {
  AgentWorkflowRequest,
  AgentWorkflowResult,
  EmailRequest,
  IntegrationConfig,
  MemoryRecord,
  MemorySearchResult,
  MessageRequest,
  MessageResult,
  PaymentRequest,
  PaymentResult,
} from './types.js';

export interface IntegrationCapabilities {
  sendEmail(request: EmailRequest): Promise<MessageResult>;
  sendWhatsApp(request: MessageRequest): Promise<MessageResult>;
  sendSms(request: MessageRequest): Promise<MessageResult>;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  runAgentWorkflow(request: AgentWorkflowRequest): Promise<AgentWorkflowResult>;
  remember(record: MemoryRecord): Promise<void>;
  searchMemory(namespace: string, userId: string, query: string): Promise<MemorySearchResult[]>;
}

/**
 * Safe foundation implementation. It deliberately does not call external providers.
 * Provider adapters should be added behind this interface once credentials and contracts
 * are configured in the deployment environment.
 */
export class UnconfiguredIntegrationCapabilities implements IntegrationCapabilities {
  constructor(private readonly config: IntegrationConfig[]) {}

  private unavailable(name: string): never {
    const provider = this.config.find((item) => item.name === name);
    throw new Error(`INTEGRATION_NOT_CONFIGURED:${provider?.name ?? name}`);
  }

  async sendEmail(_request: EmailRequest): Promise<MessageResult> { this.unavailable('email'); }
  async sendWhatsApp(_request: MessageRequest): Promise<MessageResult> { this.unavailable('whatsapp'); }
  async sendSms(_request: MessageRequest): Promise<MessageResult> { this.unavailable('sms'); }
  async createPayment(_request: PaymentRequest): Promise<PaymentResult> { this.unavailable('payments'); }
  async runAgentWorkflow(_request: AgentWorkflowRequest): Promise<AgentWorkflowResult> { this.unavailable('multi-agent'); }
  async remember(_record: MemoryRecord): Promise<void> { this.unavailable('memory'); }
  async searchMemory(_namespace: string, _userId: string, _query: string): Promise<MemorySearchResult[]> { this.unavailable('memory'); }
}
