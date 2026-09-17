import { z } from 'zod';
import type { Express, RequestHandler } from 'express';
import type { MessagingRepository } from './messagingRepository.js';
import { messagingProviders } from './messagingProviders.js';
import { messageChannels } from './messagingDomain.js';

const messageSchema = z.object({
  propertyId: z.string().min(1).optional(),
  channel: z.enum(messageChannels),
  recipient: z.string().min(3).max(320),
  template: z.string().min(1).max(120),
  payload: z.record(z.unknown()).default({}),
  idempotencyKey: z.string().min(8).max(200),
});

export function registerMessagingRoutes(app: Express, authenticated: RequestHandler, repository: MessagingRepository) {
  app.post('/api/v1/homeowner/messages', authenticated, async (req, res) => {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'INVALID_MESSAGE', details: parsed.error.flatten() });
    const principal = (res as any).locals?.principal;
    if (!principal || principal.role !== 'HOMEOWNER') return res.status(403).json({ error: 'ROLE_NOT_ALLOWED' });
    const message = await repository.create({ ...parsed.data, ownerId: principal.userId });
    const provider = messagingProviders[message.channel];
    const result = await provider.send(message);
    const updated = await repository.updateStatus(message.id, result.status, result);
    return res.status(result.status === 'SENT' ? 201 : 202).json(updated ?? message);
  });

  app.get('/api/v1/homeowner/messages', authenticated, async (req, res) => {
    const principal = (res as any).locals?.principal;
    if (!principal || principal.role !== 'HOMEOWNER') return res.status(403).json({ error: 'ROLE_NOT_ALLOWED' });
    const propertyId = typeof req.query.propertyId === 'string' ? req.query.propertyId : undefined;
    return res.json(await repository.listForOwner(principal.userId, propertyId));
  });

  app.get('/api/v1/homeowner/messages/:messageId', authenticated, async (req, res) => {
    const principal = (res as any).locals?.principal;
    if (!principal || principal.role !== 'HOMEOWNER') return res.status(403).json({ error: 'ROLE_NOT_ALLOWED' });
    const message = await repository.getForOwner(req.params.messageId, principal.userId);
    if (!message) return res.status(404).json({ error: 'MESSAGE_NOT_FOUND' });
    return res.json(message);
  });
}
