import { describe, expect, it } from 'vitest';
import { MemoryAgentPropertyAccessRepository } from './agentPropertyAccessRepository.js';

describe('MemoryAgentPropertyAccessRepository', () => {
  it('grants idempotently and supports revocation', async () => {
    const repo = new MemoryAgentPropertyAccessRepository();
    const input = { agentId:'agent-1', ownerId:'owner-1', propertyId:'property-1', grantedBy:'owner-1' };
    const first = await repo.grant(input);
    const second = await repo.grant(input);
    expect(second.id).toBe(first.id);
    expect(await repo.getActive('agent-1','owner-1','property-1')).not.toBeNull();
    const revoked = await repo.revoke(first.id,'owner-1');
    expect(revoked?.status).toBe('REVOKED');
    expect(await repo.getActive('agent-1','owner-1','property-1')).toBeNull();
  });
});
