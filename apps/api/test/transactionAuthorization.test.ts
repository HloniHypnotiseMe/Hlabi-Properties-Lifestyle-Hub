import test from 'node:test';
import assert from 'node:assert/strict';
import {canActorAccessTransaction} from '../src/transactionAuthorization.js';

const item={buyerId:'buyer-1',sellerId:'seller-1',agentId:'agent-1'};
test('transaction access is limited to participants or admin',()=>{
 assert.equal(canActorAccessTransaction({role:'BUYER',userId:'buyer-1'},item),true);
 assert.equal(canActorAccessTransaction({role:'SELLER',userId:'seller-1'},item),true);
 assert.equal(canActorAccessTransaction({role:'AGENT',userId:'agent-1'},item),true);
 assert.equal(canActorAccessTransaction({role:'ADMIN',userId:'unrelated'},item),true);
 assert.equal(canActorAccessTransaction({role:'BUYER',userId:'other-buyer'},item),false);
 assert.equal(canActorAccessTransaction({role:'AGENT',userId:'other-agent'},item),false);
});

test('unassigned agents cannot access transaction',()=>{
 assert.equal(canActorAccessTransaction({role:'AGENT',userId:'agent-2'},{buyerId:'buyer-1',sellerId:'seller-1'}),false);
});


test('unassigned agent is not authorized for a transaction even when participant identity matches no role',()=>{
 const transaction={buyerId:'buyer-1',sellerId:'seller-1',agentId:'agent-1'};
 assert.equal(canActorAccessTransaction({role:'AGENT',userId:'agent-2'},transaction),false);
});
