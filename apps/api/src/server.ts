import express from 'express';
import { z } from 'zod';
import { auditAreas, conditionGrades } from './domain.js';
import { MemoryHomeownerRepository } from './repository.js';
import { integrationHealth } from './integrations/health.js';

const app = express();
const repository = new MemoryHomeownerRepository();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json({ limit: '256kb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'hlabi-api' }));
app.get('/health/integrations', (_req, res) => res.json({ ok: true, integrations: integrationHealth() }));

// Temporary identity adapter. Production must derive ownerId from a verified session/token.
app.use((req, _res, next) => {
  req.headers['x-hlabi-user-id'] ||= 'demo-homeowner';
  next();
});

const auditSchema = z.object({
  propertyId: z.string().min(1),
  findings: z.array(z.object({
    area: z.enum(auditAreas),
    grade: z.enum(conditionGrades),
    description: z.string().max(1000).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'URGENT']),
    recommendedAction: z.string().max(1000),
    verified: z.boolean().default(false),
  })).length(auditAreas.length),
});

function ownerId(req: express.Request) {
  return String(req.headers['x-hlabi-user-id'] ?? '');
}

app.get('/api/v1/homeowner/properties/:propertyId', async (req, res) => {
  const property = await repository.getPropertyForOwner(req.params.propertyId, ownerId(req));
  if (!property) return res.status(404).json({ error: 'PROPERTY_NOT_FOUND' });
  return res.json(property);
});

app.post('/api/v1/homeowner/audits', async (req, res) => {
  const parsed = auditSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_AUDIT', details: parsed.error.flatten() });

  const userId = ownerId(req);
  const property = await repository.getPropertyForOwner(parsed.data.propertyId, userId);
  if (!property) return res.status(404).json({ error: 'PROPERTY_NOT_FOUND' });

  const audit = await repository.createAudit({
    propertyId: property.id,
    ownerId: userId,
    status: 'COMPLETED',
    findings: parsed.data.findings,
  });
  return res.status(201).json(audit);
});

app.get('/api/v1/homeowner/audits/:auditId', async (req, res) => {
  const audit = await repository.getAuditForOwner(req.params.auditId, ownerId(req));
  if (!audit) return res.status(404).json({ error: 'AUDIT_NOT_FOUND' });
  return res.json(audit);
});

app.listen(port, () => console.log(`Hlabi API listening on ${port}`));
