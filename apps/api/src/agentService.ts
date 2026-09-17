import type { AgentRepository } from './agentRepository.js';
import type { AgentRole, AgentStaffMember, AgentTask } from './agentDomain.js';

export const defaultAgentStaff: Array<Pick<AgentStaffMember,'role'|'name'|'description'>> = [
  { role:'LISTING_MANAGER', name:'Listing Manager', description:'Prepares and maintains listing workflows, property facts and listing readiness.' },
  { role:'LEAD_FOLLOW_UP', name:'Lead Follow-Up', description:'Organises lead follow-ups and next actions without sending messages automatically.' },
  { role:'MARKETING', name:'Marketing Assistant', description:'Creates campaign briefs, content plans and listing promotion tasks.' },
  { role:'CRM_COORDINATOR', name:'CRM Coordinator', description:'Keeps lead and client workflows structured and surfaces overdue actions.' },
  { role:'COMMUNICATIONS', name:'Communications Assistant', description:'Drafts client communications for human approval.' },
  { role:'SCHEDULING', name:'Scheduling Assistant', description:'Coordinates proposed appointments and reminders.' },
  { role:'REPUTATION', name:'Reputation Assistant', description:'Prepares review-response drafts and reputation follow-up tasks.' },
];

export async function seedDefaultStaff(repository:AgentRepository, ownerId:string){
  const existing=await repository.listStaff(ownerId); if(existing.length)return existing;
  const created:AgentStaffMember[]=[];
  for(const definition of defaultAgentStaff) created.push(await repository.createStaff({ownerId,...definition,status:'ACTIVE',configuration:{approvalRequired:true}}));
  return created;
}

export async function queueAgentTask(repository:AgentRepository,input:{ownerId:string;agentId:string;propertyId?:string;type:string;input:Record<string,unknown>;requiresApproval?:boolean;idempotencyKey?:string}){
  const agent=await repository.getStaffForOwner(input.agentId,input.ownerId); if(!agent||agent.status!=='ACTIVE') return null;
  const task=await repository.createTask({...input,requiresApproval:input.requiresApproval??true,status:'QUEUED'});
  await repository.appendEvent({taskId:task.id,ownerId:input.ownerId,eventType:'TASK_QUEUED',payload:{agentRole:agent.role,type:task.type}});
  return task;
}

export async function markTaskForApproval(repository:AgentRepository,task:AgentTask){
  const updated=await repository.updateTask(task.id,task.ownerId,{status:'WAITING_APPROVAL'});
  await repository.appendEvent({taskId:task.id,ownerId:task.ownerId,eventType:'APPROVAL_REQUIRED',payload:{}});
  return updated;
}

export function roleForTaskType(type:string):AgentRole|undefined{
  const key=type.toLowerCase();
  if(key.includes('listing'))return 'LISTING_MANAGER';
  if(key.includes('lead'))return 'LEAD_FOLLOW_UP';
  if(key.includes('market'))return 'MARKETING';
  if(key.includes('crm'))return 'CRM_COORDINATOR';
  if(key.includes('message')||key.includes('communication'))return 'COMMUNICATIONS';
  if(key.includes('schedule'))return 'SCHEDULING';
  if(key.includes('review')||key.includes('reputation'))return 'REPUTATION';
  return undefined;
}
