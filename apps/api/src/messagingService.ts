import type { MessageChannel, NotificationMessage } from './messagingDomain.js';
import type { MessagingRepository } from './messagingRepository.js';
import { messagingProviders } from './messagingProviders.js';

export async function queueNotification(repository: MessagingRepository, input: Omit<NotificationMessage, 'id' | 'createdAt' | 'status'>) {
  const message = await repository.create(input);
  const result = await messagingProviders[input.channel as MessageChannel].send(message);
  return repository.updateStatus(message.id, result.status, result) ?? message;
}
