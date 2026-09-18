export interface TransactionActor { role:string; userId:string; }
export interface TransactionParticipant { buyerId:string; sellerId:string; agentId?:string; }
export function canActorAccessTransaction(actor:TransactionActor,item:TransactionParticipant){
  return actor.role==='ADMIN'||actor.userId===item.buyerId||actor.userId===item.sellerId||actor.userId===item.agentId;
}
