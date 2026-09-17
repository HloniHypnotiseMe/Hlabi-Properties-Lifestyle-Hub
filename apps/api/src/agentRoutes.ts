import { z } from 'zod';
import type { Express, RequestHandler } from 'express';
import type { AgentRepository } from './agentRepository.js';
import { agentRoles, agentStatuses } from './agentDomain.js';
import { queueAgentTask, seedDefaultStaff } from './agentService.js';

const createAgentSchema=z.object({role:z.enum(agentRoles),name:z.string().min(2).max(120),description:z.string().max(500).optional(),configuration:z.record(z.unknown()).default({})});
const taskSchema=z.object({agentId:z.string().min(1),propertyId:z.string().min(1).optional(),type:z.string().min(2).max(120),input:z.record(z.unknown()).default({}),requiresApproval:z.boolean().default(true),idempotencyKey:z.string().min(8).max(200).optional()});
const statusSchema=z.object({status:z.enum(agentStatuses)});

export function registerAgentRoutes(app:Express,authenticated:RequestHandler,repository:AgentRepository){
  app.get('/api/v1/agent-staff',authenticated,async(_req,res)=>{const p=res.locals.principal;if(!p||p.role!=='AGENT')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});return res.json(await seedDefaultStaff(repository,p.userId));});
  app.post('/api/v1/agent-staff',authenticated,async(req,res)=>{const p=res.locals.principal;if(!p||p.role!=='AGENT')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});const parsed=createAgentSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'INVALID_AGENT',details:parsed.error.flatten()});const item=await repository.createStaff({ownerId:p.userId,...parsed.data,status:'ACTIVE'});return res.status(201).json(item);});
  app.patch('/api/v1/agent-staff/:agentId/status',authenticated,async(req,res)=>{const p=res.locals.principal;if(!p||p.role!=='AGENT')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});const parsed=statusSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'INVALID_AGENT_STATUS'});const item=await repository.updateStaffStatus(req.params.agentId,p.userId,parsed.data.status);if(!item)return res.status(404).json({error:'AGENT_NOT_FOUND'});return res.json(item);});
  app.post('/api/v1/agent-tasks',authenticated,async(req,res)=>{const p=res.locals.principal;if(!p||p.role!=='AGENT')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});const parsed=taskSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'INVALID_AGENT_TASK',details:parsed.error.flatten()});const task=await queueAgentTask(repository,{ownerId:p.userId,...parsed.data});if(!task)return res.status(404).json({error:'AGENT_NOT_FOUND_OR_INACTIVE'});return res.status(202).json(task);});
  app.get('/api/v1/agent-tasks',authenticated,async(req,res)=>{const p=res.locals.principal;if(!p||p.role!=='AGENT')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});const agentId=typeof req.query.agentId==='string'?req.query.agentId:undefined;return res.json(await repository.listTasks(p.userId,agentId));});
  app.get('/api/v1/agent-tasks/:taskId',authenticated,async(req,res)=>{const p=res.locals.principal;if(!p||p.role!=='AGENT')return res.status(403).json({error:'ROLE_NOT_ALLOWED'});const task=await repository.getTaskForOwner(req.params.taskId,p.userId);if(!task)return res.status(404).json({error:'AGENT_TASK_NOT_FOUND'});return res.json(task);});
}
