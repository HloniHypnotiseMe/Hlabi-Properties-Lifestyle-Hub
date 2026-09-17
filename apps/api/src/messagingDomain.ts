export const messageChannels = ['EMAIL','WHATSAPP','SMS'] as const;
export type MessageChannel = typeof messageChannels[number];

export type MessageStatus = 'QUEUED' | 'SENT' | 'FAILED';

export interface NotificationMessage {
  id: string;
  ownerId: string;
  propertyId?: string;
  channel: MessageChannel;
  recipient: string;
  template: string;
  payload: Record<string, unknown>;
  status: MessageStatus;
  providerMessageId?: string;
  idempotencyKey: string;
  createdAt: string;
  sentAt?: string;
  failedAt?: string;
  errorCode?: string;
}

export interface MessageProvider {
  readonly channel: MessageChannel;
  send(message: Omit<NotificationMessage, 'id' | 'status' | 'createdAt'>): Promise<{
    providerMessageId?: string;
    status: 'SENT' | 'FAILED';
    errorCode?: string;
  }>;
}
