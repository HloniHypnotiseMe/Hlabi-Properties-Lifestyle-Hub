export const ACADEMY_LESSON_ACTIVITY_SCHEMA = 'hlabi.academy.lesson-activity.v1' as const;
export const academyLessonActivityEventTypes = ['STARTED','COMPLETED'] as const;
export type AcademyLessonActivityEventType = typeof academyLessonActivityEventTypes[number];

export interface AcademyLessonActivity {
  id:string;
  schema:typeof ACADEMY_LESSON_ACTIVITY_SCHEMA;
  enrollmentId:string;
  userId:string;
  lessonId:string;
  moduleIndex:number;
  assetId:string;
  assetKind:string;
  eventType:AcademyLessonActivityEventType;
  occurredAt:string;
}
