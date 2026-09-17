import type { MessageProvider } from './messagingDomain.js';

class DisabledProvider implements MessageProvider {
  constructor(public readonly channel: 'EMAIL' | 'WHATSAPP' | 'SMS') {}
  async send() { return { status: 'FAILED' as const, errorCode: 'PROVIDER_NOT_CONFIGURED' }; }
}

export const messagingProviders: Record<'EMAIL' | 'WHATSAPP' | 'SMS', MessageProvider> = {
  EMAIL: new DisabledProvider('EMAIL'),
  WHATSAPP: new DisabledProvider('WHATSAPP'),
  SMS: new DisabledProvider('SMS'),
};
