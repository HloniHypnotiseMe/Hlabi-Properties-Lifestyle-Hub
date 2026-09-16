import { Pool } from 'pg';
import type { AuditRecord, PropertyRecord } from './domain.js';
import type { HomeownerRepository } from './repository.js';

export class PostgresHomeownerRepository implements HomeownerRepository {
  constructor(private readonly pool: Pool) {}

  async getPropertyForOwner(propertyId: string, ownerId: string): Promise<PropertyRecord | null> {
    const result = await this.pool.query(
      `SELECT id, owner_id, nickname, address, property_type, lifecycle FROM properties
       WHERE id = $1 AND owner_id = $2 LIMIT 1`, [propertyId, ownerId]);
    const row = result.rows[0];
    if (!row) return null;
    return { id: row.id, ownerId: row.owner_id, nickname: row.nickname, address: row.address,
      propertyType: row.property_type, lifecycle: row.lifecycle };
  }

  async createAudit(input: Omit<AuditRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuditRecord> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const auditResult = await client.query(
        `INSERT INTO audits (property_id, owner_id, status) VALUES ($1, $2, $3)
         RETURNING id, created_at, updated_at`, [input.propertyId, input.ownerId, input.status]);
      const row = auditResult.rows[0];
      for (const finding of input.findings) {
        await client.query(
          `INSERT INTO audit_findings (audit_id, area, grade, description, priority, recommended_action, verified)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [row.id, finding.area, finding.grade, finding.description ?? null, finding.priority,
            finding.recommendedAction, finding.verified]);
      }
      await client.query('COMMIT');
      return { ...input, id: row.id, createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString() };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  async getAuditForOwner(auditId: string, ownerId: string): Promise<AuditRecord | null> {
    const result = await this.pool.query(
      `SELECT a.id, a.property_id, a.owner_id, a.status, a.created_at, a.updated_at,
              f.area, f.grade, f.description, f.priority, f.recommended_action, f.verified
       FROM audits a LEFT JOIN audit_findings f ON f.audit_id = a.id
       WHERE a.id = $1 AND a.owner_id = $2 ORDER BY f.area`, [auditId, ownerId]);
    if (!result.rows.length) return null;
    const first = result.rows[0];
    return { id: first.id, propertyId: first.property_id, ownerId: first.owner_id, status: first.status,
      createdAt: first.created_at.toISOString(), updatedAt: first.updated_at.toISOString(),
      findings: result.rows.filter((row) => row.area).map((row) => ({ area: row.area, grade: row.grade,
        description: row.description ?? undefined, priority: row.priority,
        recommendedAction: row.recommended_action, verified: row.verified })) };
  }
}
