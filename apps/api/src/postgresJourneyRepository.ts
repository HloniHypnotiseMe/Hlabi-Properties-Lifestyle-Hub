import type { Pool } from 'pg';
import type { JourneyEvent, JourneyProfile, JourneyStatus, JourneyType } from './journeyDomain.js';
import type { JourneyRepository } from './journeyRepository.js';

const mapJourney = (r: any): JourneyProfile => ({ id:r.id, userId:r.user_id, type:r.journey_type, status:r.status, goals:r.goals ?? {}, preferences:r.preferences ?? {}, createdAt:r.created_at.toISOString(), updatedAt:r.updated_at.toISOString() });
const mapEvent = (r: any): JourneyEvent => ({ id:r.id, journeyId:r.journey_id, userId:r.user_id, eventType:r.event_type, payload:r.payload ?? {}, createdAt:r.created_at.toISOString() });

export class PostgresJourneyRepository implements JourneyRepository {
  constructor(private readonly pool: Pool) {}
  async createJourney(input: { userId:string; type:JourneyType; goals:Record<string,unknown>; preferences:Record<string,unknown> }) {
    const { rows } = await this.pool.query('INSERT INTO journey_profiles (user_id, journey_type, goals, preferences) VALUES ($1,$2,$3,$4) RETURNING *',[input.userId,input.type,input.goals,input.preferences]); return mapJourney(rows[0]);
  }
  async getJourney(id:string,userId:string) { const {rows}=await this.pool.query('SELECT * FROM journey_profiles WHERE id=$1 AND user_id=$2',[id,userId]); return rows[0]?mapJourney(rows[0]):null; }
  async listJourneys(userId:string) { const {rows}=await this.pool.query('SELECT * FROM journey_profiles WHERE user_id=$1 ORDER BY updated_at DESC',[userId]); return rows.map(mapJourney); }
  async updateStatus(id:string,userId:string,status:JourneyStatus) { const {rows}=await this.pool.query('UPDATE journey_profiles SET status=$3,updated_at=NOW() WHERE id=$1 AND user_id=$2 RETURNING *',[id,userId,status]); return rows[0]?mapJourney(rows[0]):null; }
  async addEvent(input:{journeyId:string;userId:string;eventType:string;payload:Record<string,unknown>}) { const {rows}=await this.pool.query('INSERT INTO journey_events (journey_id,user_id,event_type,payload) VALUES ($1,$2,$3,$4) RETURNING *',[input.journeyId,input.userId,input.eventType,input.payload]); return mapEvent(rows[0]); }
  async listEvents(journeyId:string,userId:string) { const {rows}=await this.pool.query('SELECT * FROM journey_events WHERE journey_id=$1 AND user_id=$2 ORDER BY created_at DESC',[journeyId,userId]); return rows.map(mapEvent); }
}
