import { randomUUID } from 'node:crypto';
import type { AgentPropertyAccess } from './agentPropertyAccessDomain.js';

export interface AgentPropertyAccessRepository {
  grant(input: Omit<AgentPropertyAccess, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<AgentPropertyAccess>;
  getActive(agentId: string, ownerId: string, propertyId: string): Promise<AgentPropertyAccess | null>;
  listForOwner(ownerId: string, propertyId?: string): Promise<AgentPropertyAccess[]>;
  revoke(id: string, ownerId: string): Promise<AgentPropertyAccess | null>;
}

export class MemoryAgentPropertyAccessRepository implements AgentPropertyAccessRepository {
  private readonly items = new Map<string, AgentPropertyAccess>();
  async grant(input: Omit<AgentPropertyAccess, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    const existing = [...this.items.values()].find((x) => x.agentId === input.agentId && x.ownerId === input.ownerId && x.propertyId === input.propertyId && x.status === 'ACTIVE');
    if (existing) return existing;
    const now = new Date().toISOString();
    const item: AgentPropertyAccess = { ...input, id: randomUUID(), status: 'ACTIVE', createdAt: now, updatedAt: now };
    this.items.set(item.id, item);
    return item;
  }
  async getActive(agentId: string, ownerId: string, propertyId: string) { return [...this.items.values()].find((x) => x.agentId === agentId && x.ownerId === ownerId && x.propertyId === propertyId && x.status === 'ACTIVE') ?? null; }
  async listForOwner(ownerId: string, propertyId?: string) { return [...this.items.values()].filter((x) => x.ownerId === ownerId && (!propertyId || x.propertyId === propertyId)); }
  async revoke(id: string, ownerId: string) { const item = this.items.get(id); if (!item || item.ownerId !== ownerId) return null; const updated = { ...item, status: 'REVOKED' as const, updatedAt: new Date().toISOString() }; this.items.set(id, updated); return updated; }
}
