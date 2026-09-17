import { MemoryJobRepository } from './jobRepository.js';

describe('MemoryJobRepository', () => {
  it('creates a job only from an owner-owned selectable quote', async () => {
    const repo = new MemoryJobRepository();
    repo.seedQuote({ id: 'q1', ownerId: 'owner-1', propertyId: 'property-1', supplierId: 'supplier-1' });
    const job = await repo.createJobFromQuote({ quoteId: 'q1', ownerId: 'owner-1' });
    expect(job?.quoteId).toBe('q1');
    expect(job?.status).toBe('REQUESTED');
    expect(await repo.createJobFromQuote({ quoteId: 'q1', ownerId: 'owner-2' })).toBeNull();
  });
});
