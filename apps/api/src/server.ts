import express from 'express';
import { Pool } from 'pg';
import { z } from 'zod';
import { auditAreas, conditionGrades } from './domain.js';
import { MemoryHomeownerRepository } from './repository.js';
import { PostgresHomeownerRepository } from './postgresRepository.js';
import { authenticatedPrincipal, DevelopmentAuthenticationProvider, UnconfiguredAuthenticationProvider, requireAuthentication } from './authentication.js';
import { integrationHealth } from './integrations/health.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const usePostgres = Boolean(process.env.DATABASE_URL);
const pool = usePostgres ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
const repository = pool ? new PostgresHomeownerRepository(pool) : new MemoryHomeownerRepository();
const authProvider = process.env.AUTH_MODE === 'development'
  ? new DevelopmentAuthenticationProvider()
  : new UnconfiguredAuthenticationProvider();

app.use(express.json({ limit: '256kb' }));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'hlabi-api', persistence: usePostgres ? 'postgresql' : 'memory' }));
app.get('/health/integrations', (_req, res) => res.json({ ok: true, integrations: integrationHealth() }));

const homeownerAuth = requireAuthentication(authProvider);
const auditSchema = z.object({
  propertyId: z.string().min(1),
  findings: z.array(z.object({
    area: z.enum(auditAreas), grade: z.enum(conditionGrades), description: z.string().max(1000).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'URGENT']), recommendedAction: z.string().max(1000), verified: z.boolean().default(false),
  })).length(auditAreas.length),
});

app.get('/api/v1/homeowner/properties/:propertyId', homeownerAuth, async (req, res) => {
  const principal = authenticatedPrincipal(res);
  if (principal.role !== 'HOMEOWNER') return res.status(403).json({ error: 'ROLE_NOT_ALLOWED' });
  const property = await repository.getPropertyForOwner(req.params.propertyId, principal.userId);
  if (!property) return res.status(404).json({ error: 'PROPERTY_NOT_FOUND' });
  return res.json(property);
});

app.post('/api/v1/homeowner/audits', homeownerAuth, async (req, res) => {
  const parsed = auditSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_AUDIT', details: parsed.error.flatten() });
  const principal = authenticatedPrincipal(res);
  if (principal.role !== 'HOMEOWNER') return res.status(403).json({ error: 'ROLE_NOT_ALLOWED' });
  const property = await repository.getPropertyForOwner(parsed.data.propertyId, principal.userId);
  if (!property) return res.status(404).json({ error: 'PROPERTY_NOT_FOUND' });
  const audit = await repository.createAudit({ propertyId: property.id, ownerId: principal.userId, status: 'COMPLETED', findings: parsed.data.findings });
  return res.status(201).json(audit);
});

app.get('/api/v1/homeowner/properties/:propertyId/audits/latest', homeownerAuth, async (req, res) => {
  const principal = authenticatedPrincipal(res);
  if (principal.role !== 'HOMEOWNER') return res.status(403).json({ error: 'ROLE_NOT_ALLOWED' });
  const property = await repository.getPropertyForOwner(req.params.propertyId, principal.userId);
  if (!property) return res.status(404).json({ error: 'PROPERTY_NOT_FOUND' });
  const audit = await repository.getLatestAuditForProperty(property.id, principal.userId);
  if (!audit) return res.status(404).json({ error: 'AUDIT_NOT_FOUND' });
  return res.json(audit);
});

app.get('/api/v1/homeowner/audits/:auditId', homeownerAuth, async (req, res) => {
  const principal = authenticatedPrincipal(res);
  if (principal.role !== 'HOMEOWNER') return res.status(403).json({ error: 'ROLE_NOT_ALLOWED' });
  const audit = await repository.getAuditForOwner(req.params.auditId, principal.userId);
  if (!audit) return res.status(404).json({ error: 'AUDIT_NOT_FOUND' });
  return res.json(audit);
});

app.listen(port, () => console.log(`Hlabi API listening on ${port}`));
