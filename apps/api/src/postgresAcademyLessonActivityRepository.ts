import type { Pool } from 'pg';
import type { AcademyLessonActivity } from './academyRepository.js';

export class PostgresAcademyLessonActivityRepository {
  constructor(private readonly pool: Pool) {}

  async list(enrollmentId: string, userId: string, moduleIndex?: number): Promise<AcademyLessonActivity[]> {
    const params: unknown[] = [enrollmentId, userId];
    let sql = 'SELECT * FROM academy_lesson_activities WHERE enrollment_id=$1 AND user_id=$2';
    if (moduleIndex !== undefined) { params.push(moduleIndex); sql += ' AND module_index=$3'; }
    sql += ' ORDER BY created_at ASC';
    const { rows } = await this.pool.query(sql, params);
    return rows.map((r: any) => ({ id:r.id, enrollmentId:r.enrollment_id, userId:r.user_id, lessonId:r.lesson_id, moduleIndex:r.module_index, assetId:r.asset_id, assetKind:r.asset_kind, eventType:r.event_type, createdAt:r.created_at.toISOString() }));
  }

  async record(input: Omit<AcademyLessonActivity,'id'|'createdAt'>): Promise<AcademyLessonActivity> {
    const { rows } = await this.pool.query('INSERT INTO academy_lesson_activities(enrollment_id,user_id,lesson_id,module_index,asset_id,asset_kind,event_type) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[input.enrollmentId,input.userId,input.lessonId,input.moduleIndex,input.assetId,input.assetKind,input.eventType]);
    const r=rows[0];
    return { id:r.id,enrollmentId:r.enrollment_id,userId:r.user_id,lessonId:r.lesson_id,moduleIndex:r.module_index,assetId:r.asset_id,assetKind:r.asset_kind,eventType:r.event_type,createdAt:r.created_at.toISOString() };
  }
}
