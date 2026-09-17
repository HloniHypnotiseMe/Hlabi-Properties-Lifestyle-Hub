import { randomUUID } from 'node:crypto';
import type { AgentRole, AgentStaffMember, AgentStatus, AgentTask, AgentTaskEvent, AgentTaskStatus } from './agentDomain.js';

export interface AgentRepository {
  listStaff(ownerId: string): Promise<AgentStaffMember[]>;
  getStaffForOwner(agentId: string, ownerId: string): Promise<AgentStaffMember | null>;
  createStaff(input: Omit<AgentStaffMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentStaffMember>;
  updateStaffStatus(agentId: string, ownerId: string, status: AgentStatus): Promise<AgentStaffMember | null>;
  createTask(input: Omit<AgentTask, 'id' | 'createdAt' | 'status'> & { status?: AgentTaskStatus }): Promise<AgentTask>;
  getTaskForOwner(taskId: string, ownerId: string): Promise<AgentTask | null>;
  listTasks(ownerId: string, agentId?: string): Promise<AgentTask[]>;
  updateTask(taskId: string, ownerId: string, patch: Partial<Pick<AgentTask, 'status' | 'output' | 'errorCode' | 'startedAt' | 'completedAt'>>): Promise<AgentTask | null>;
  appendEvent(input: Omit<AgentTaskEvent, 'id' | 'createdAt'>): Promise<AgentTaskEvent>;
  hasApprovalGrant(taskId: string, ownerId: string): Promise<boolean>;
}

export class MemoryAgentRepository implements AgentRepository {
  private staff: AgentStaffMember[] = [];
  private tasks: AgentTask[] = [];
  private events: AgentTaskEvent[] = [];

  async listStaff(ownerId: string) { return this.staff.filter(x => x.ownerId === ownerId); }
  async getStaffForOwner(agentId: string, ownerId: string) { return this.staff.find(x => x.id === agentId && x.ownerId === ownerId) ?? null; }
  async createStaff(input: Omit<AgentStaffMember, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString(); const item = { ...input, id: randomUUID(), createdAt: now, updatedAt: now }; this.staff.push(item); return item;
  }
  async updateStaffStatus(agentId: string, ownerId: string, status: AgentStatus) {
    const item = await this.getStaffForOwner(agentId, ownerId); if (!item) return null; item.status = status; item.updatedAt = new Date().toISOString(); return item;
  }
  async createTask(input: Omit<AgentTask, 'id' | 'createdAt' | 'status'> & { status?: AgentTaskStatus }) {
    const item = { ...input, id: randomUUID(), status: input.status ?? 'QUEUED', createdAt: new Date().toISOString() }; this.tasks.push(item); return item;
  }
  async getTaskForOwner(taskId: string, ownerId: string) { return this.tasks.find(x => x.id === taskId && x.ownerId === ownerId) ?? null; }
  async listTasks(ownerId: string, agentId?: string) { return this.tasks.filter(x => x.ownerId === ownerId && (!agentId || x.agentId === agentId)); }
  async updateTask(taskId: string, ownerId: string, patch: Partial<Pick<AgentTask, 'status' | 'output' | 'errorCode' | 'startedAt' | 'completedAt'>>) {
    const item = await this.getTaskForOwner(taskId, ownerId); if (!item) return null; Object.assign(item, patch); return item;
  }
  async appendEvent(input: Omit<AgentTaskEvent, 'id' | 'createdAt'>) { const item = { ...input, id: randomUUID(), createdAt: new Date().toISOString() }; this.events.push(item); return item; }
  async hasApprovalGrant(taskId: string, ownerId: string) { return this.events.some(e => e.taskId === taskId && e.ownerId === ownerId && e.eventType === 'HUMAN_APPROVAL_GRANTED'); }
}
