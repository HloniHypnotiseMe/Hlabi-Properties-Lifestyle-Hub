import test from 'node:test';
import assert from 'node:assert/strict';
import {MemoryListingRepository} from '../src/listingRepository.js';

test('listing lifecycle stores a seller draft and publishes it',async()=>{const repo=new MemoryListingRepository();const created=await repo.create({propertyId:'property-1',sellerId:'seller-1',status:'DRAFT',title:'Family home',description:'A well-presented family home with practical living space.',askingPriceCents:250000000,features:[]});assert.equal(created.status,'DRAFT');const ready=await repo.updateForSeller('property-1','seller-1',{status:'READY_TO_LIST'});assert.equal(ready?.status,'READY_TO_LIST');const listed=await repo.updateForSeller('property-1','seller-1',{status:'LISTED'});assert.equal(listed?.status,'LISTED');const publicListings=await repo.listPublic({maxPriceCents:300000000});assert.equal(publicListings.length,1);});

test('listing repository isolates sellers by property ownership key',async()=>{const repo=new MemoryListingRepository();await repo.create({propertyId:'property-1',sellerId:'seller-1',status:'DRAFT',title:'One',description:'A sufficiently descriptive listing body for testing.',features:[]});assert.equal(await repo.getForSeller('property-1','seller-2'),null);});
