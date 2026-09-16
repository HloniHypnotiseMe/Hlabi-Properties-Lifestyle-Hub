import type { AuditRecord, PropertyRecord } from './domain.js';

export interface HomeownerRepository {
  getPropertyForOwner(propertyId: string, ownerId: string): Promise<PropertyRecord | null>;
  createAudit(input: Omit<AuditRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuditRecord>;
  getAuditForOwner(auditId: string, ownerId: string): Promise<AuditRecord | null>;
}

/**
 * Temporary adapter used by the API foundation.
 * Replace this implementation with PostgreSQL/Prisma persistence before production.
 */
export class MemoryHomeownerRepository implements HomeownerRepository {
  private readonly properties = new Map<string, PropertyRecord>();
  private readonly audits = new Map<string, AuditRecord>();

  constructor() {
    this.properties.set('demo-property-1', {
      id: 'demo-property-1',
      ownerId: 'demo-homeowner',
      nickname: 'Demo Family Home',
      address: { suburb: 'Mondeor', city: 'Johannesburg', province: 'Gauteng', postalCode: '2091', country: 'ZA' },
      propertyType: 'HOUSE',
      lifecycle: 'onboarding',
    });
  }

  async getPropertyForOwner(propertyId: string, ownerId: string) {
    const property = this.properties.get(propertyId);
    return property?.ownerId === ownerId ? property : null;
  }

  async createAudit(input: Omit<AuditRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const audit: AuditRecord = { ...input, id: `audit-${crypto.randomUUID()}`, createdAt: now, updatedAt: now };
    this.audits.set(audit.id, audit);
    return audit;
  }

  async getAuditForOwner(auditId: string, ownerId: string) {
    const audit = this.audits.get(auditId);
    return audit?.ownerId === ownerId ? audit : null;
  }
}
