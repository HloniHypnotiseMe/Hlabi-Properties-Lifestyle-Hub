import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';

export interface StoredTransactionDocument{storageKey:string;content:Buffer;contentType:string;fileName?:string}
export interface TransactionDocumentStorageProvider{
 put(input:{transactionId:string;documentId:string;fileName:string;contentType:string;content:Buffer}):Promise<{storageKey:string;sizeBytes:number}>;
 get(input:{transactionId:string;storageKey:string}):Promise<StoredTransactionDocument|null>;
}
const safeName=(name:string)=>name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,160)||'document';
const safeKey=(key:string)=>key.split('/').filter(Boolean).every(part=>part!=='.'&&part!=='..'&&/^[a-zA-Z0-9._-]+$/.test(part));
export class FileSystemTransactionDocumentStorage implements TransactionDocumentStorageProvider{
 constructor(private rootDir=process.env.TRANSACTION_DOCUMENT_STORAGE_DIR??'./data/transaction-documents'){}
 private pathFor(key:string){if(!safeKey(key)||!key.startsWith('transactions/'))throw new Error('INVALID_STORAGE_KEY');return join(this.rootDir,key)}
 async put(input:{transactionId:string;documentId:string;fileName:string;contentType:string;content:Buffer}){
  const key=`transactions/${input.transactionId}/${input.documentId}-${safeName(input.fileName)}`;
  const path=this.pathFor(key);await mkdir(dirname(path),{recursive:true});await writeFile(path,input.content,{flag:'w'});return {storageKey:key,sizeBytes:input.content.byteLength};
 }
 async get(input:{transactionId:string;storageKey:string}){
  if(!input.storageKey.startsWith(`transactions/${input.transactionId}/`))throw new Error('TRANSACTION_STORAGE_SCOPE');
  const path=this.pathFor(input.storageKey);
  try{return {storageKey:input.storageKey,content:await readFile(path),contentType:contentTypeFor(input.storageKey),fileName:input.storageKey.split('/').pop()};}catch(error:any){if(error?.code==='ENOENT')return null;throw error;}
 }
}
function contentTypeFor(key:string){const ext=key.toLowerCase().split('.').pop();return ({pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',txt:'text/plain',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})[ext??'']??'application/octet-stream';}
