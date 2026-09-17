import type { MessageChannel, MessageStatus, NotificationMessage } from './messagingDomain.js';

export interface MessagingRepository {
  create(input: Omit<NotificationMessage, 'id' | 'createdAt' | 'status'>): Promise<NotificationMessage>;
  getForOwner(id: string, ownerId: string): Promise<NotificationMessage | null>;
  listForOwner(ownerId: string, propertyId?: string): Promise<NotificationMessage[]>;
  updateStatus(id: string, status: MessageStatus, details?: { providerMessageId?: string; errorCode?: string }): Promise<NotificationMessage | null>;
}

export class MemoryMessagingRepository implements MessagingRepository {
  private readonly messages = new Map<string, NotificationMessage>();

  async create(input: Omit<NotificationMessage, 'id' | 'createdAt' | 'status'>): Promise<NotificationMessage> {
    const existing = [...this.messages.values()].find((m) => m.idempotencyKey === input.idempotencyKey && m.ownerId === input.ownerId);
    if (existing) return existing;
    const message: NotificationMessage = { ...input, id: crypto.randomUUID(), status: 'QUEUED', createdAt: new Date().toISOString() };
    this.messages.set(message.id, message);
    return message;
  }

  async getForOwner(id: string, ownerId: string) { const message = this.messages.get(id); return message?.ownerId === ownerId ? message : null; }
  async listForOwner(ownerId: string, propertyId?: string) { return [...this.messages.values()].filter((m) => m.ownerId === ownerId && (!propertyId || m.propertyId === propertyId)); }
  async updateStatus(id: string, status: MessageStatus, details: { providerMessageId?: string; errorCode?: string } = {}) {
    const message = this.messages.get(id); if (!message) return null;
    const updated = { ...message, status, ...details, ...(status === 'SENT' ? { sentAt: new Date().toISOString() } : {}), ...(status === 'FAILED' ? { failedAt: new Date().toISOString() } : {}) };
    this.messages.set(id, updated); return updated;
  }
}
