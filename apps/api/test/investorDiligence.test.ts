import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateAcquisitionMetrics} from '../src/investorDiligenceDomain.js';
import {MemoryInvestorDiligenceRepository} from '../src/investorDiligenceRepository.js';

test('yield is calculated only from supplied values',()=>{
 const m=calculateAcquisitionMetrics({askingPriceCents:10000000,annualRentCents:1200000});
 assert.equal(m.grossYieldPercent,12); assert.equal(m.netYieldPercent,undefined);
 assert.deepEqual(m.missing,['annual operating expenses']);
});
test('diligence repository is investor and listing scoped',async()=>{
 const r=new MemoryInvestorDiligenceRepository();
 await r.upsert({investorId:'i1',listingId:'l1',kind:'RENTAL_INCOME',status:'VERIFIED',label:'Annual rent',value:'1200000',source:'lease',notes:undefined,verifiedAt:new Date().toISOString()});
 await r.upsert({investorId:'i2',listingId:'l1',kind:'RENTAL_INCOME',status:'CAPTURED',label:'Annual rent',value:'900000',source:'seller',notes:undefined});
 assert.equal((await r.list('i1','l1')).length,1); assert.equal((await r.list('i2','l1')).length,1); assert.equal((await r.list('i1','l2')).length,0);
});
