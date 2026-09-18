import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {FileSystemTransactionDocumentStorage} from '../src/transactionDocumentStorage.js';

test('transaction document storage writes and reads transaction-scoped objects',async()=>{
 const root=await mkdtemp(join(tmpdir(),'hlabi-docs-'));try{
  const storage=new FileSystemTransactionDocumentStorage(root);const put=await storage.put({transactionId:'tx-1',documentId:'doc-1',fileName:'identity proof.pdf',contentType:'application/pdf',content:Buffer.from('proof')});
  assert.equal(put.sizeBytes,5);assert.match(put.storageKey,/^transactions\/tx-1\/doc-1-identity_proof\.pdf$/);
  const found=await storage.get({transactionId:'tx-1',storageKey:put.storageKey});assert.equal(found?.content.toString(),'proof');assert.equal(found?.contentType,'application/pdf');
  assert.equal(await storage.get({transactionId:'tx-2',storageKey:put.storageKey}),null);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('transaction document storage rejects traversal and foreign transaction keys',async()=>{
 const root=await mkdtemp(join(tmpdir(),'hlabi-docs-'));try{
  const storage=new FileSystemTransactionDocumentStorage(root);
  await assert.rejects(()=>storage.get({transactionId:'tx-1',storageKey:'transactions/tx-1/../tx-2/doc'}),/INVALID_STORAGE_KEY/);
  await assert.rejects(()=>storage.get({transactionId:'tx-1',storageKey:'transactions/tx-2/doc'}),/TRANSACTION_STORAGE_SCOPE/);
 }finally{await rm(root,{recursive:true,force:true});}
});
