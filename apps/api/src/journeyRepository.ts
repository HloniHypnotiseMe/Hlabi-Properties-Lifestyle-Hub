import { randomUUID } from 'node:crypto';
import type { JourneyEvent, JourneyProfile, JourneyStatus, JourneyType } from './journeyDomain.js';

export interface JourneyRepository {
  createJourney(input: { userId: string; type: JourneyType; goals: Record<string, unknown>; preferences: Record<string, unknown> }): Promise<JourneyProfile>;
  getJourney(id: string, userId: string): Promise<JourneyProfile | null>;
  listJourneys(userId: string): Promise<JourneyProfile[]>;
  updateStatus(id: string, userId: string, status: JourneyStatus): Promise<JourneyProfile | null>;
  addEvent(input: { journeyId: string; userId: string; eventType: string; payload: Record<string, unknown> }): Promise<JourneyEvent>;
  listEvents(journeyId: string, userId: string): Promise<JourneyEvent[]>;
}

export class MemoryJourneyRepository implements JourneyRepository {
  private journeys = new Map<string, JourneyProfile>();
  private events: JourneyEvent[] = [];

  async createJourney(input: { userId: string; type: JourneyType; goals: Record<string, unknown>; preferences: Record<string, unknown> }) {
    const now = new Date().toISOString();
    const journey: JourneyProfile = { id: randomUUID(), ...input, status: 'ACTIVE', createdAt: now, updatedAt: now };
    this.journeys.set(journey.id, journey);
    return journey;
  }
  async getJourney(id: string, userId: string) { const j = this.journeys.get(id); return j?.userId === userId ? j : null; }
  async listJourneys(userId: string) { return [...this.journeys.values()].filter(j => j.userId === userId); }
  async updateStatus(id: string, userId: string, status: JourneyStatus) {
    const j = await this.getJourney(id, userId); if (!j) return null;
    const updated = { ...j, status, updatedAt: new Date().toISOString() }; this.journeys.set(id, updated); return updated;
  }
  async addEvent(input: { journeyId: string; userId: string; eventType: string; payload: Record<string, unknown> }) {
    const event: JourneyEvent = { id: randomUUID(), ...input, createdAt: new Date().toISOString() }; this.events.push(event); return event;
  }
  async listEvents(journeyId: string, userId: string) { return this.events.filter(e => e.journeyId === journeyId && e.userId === userId); }
}
