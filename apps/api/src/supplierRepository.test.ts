import { describe, expect, it } from 'vitest';
import { MemorySupplierRepository } from './supplierRepository.js';

describe('MemorySupplierRepository', () => {
  it('returns only active verified suppliers matching a category', async () => {
    const repository = new MemorySupplierRepository();
    const suppliers = await repository.listEligibleSuppliers('plumbing');
    expect(suppliers).toHaveLength(1);
    expect(suppliers[0].verified).toBe(true);
    expect(suppliers[0].categories).toContain('plumbing');
  });

  it('scopes quote requests and quotes to the homeowner', async () => {
    const repository = new MemorySupplierRepository();
    const request = await repository.createQuoteRequest({
      propertyId: 'property-1', ownerId: 'owner-1', title: 'Fix leak', description: 'Repair a leaking pipe',
      priority: 'URGENT', status: 'OPEN', supplierIds: ['demo-supplier-1'],
    });
    await repository.submitQuote({
      quoteRequestId: request.id, supplierId: 'demo-supplier-1', currency: 'ZAR', details: {}, status: 'SUBMITTED',
    });
    expect((await repository.listQuotesForOwnerRequest(request.id, 'owner-1'))).toHaveLength(1);
    expect((await repository.listQuotesForOwnerRequest(request.id, 'owner-2'))).toHaveLength(0);
  });
});
