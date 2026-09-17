export const academyEnrollmentStatuses = ['ENROLLED','IN_PROGRESS','COMPLETED','WITHDRAWN'] as const;
export type AcademyEnrollmentStatus = typeof academyEnrollmentStatuses[number];

export interface AcademyCourse { id:string; title:string; description:string; modules:string[]; active:boolean; createdAt:string; updatedAt:string; }
export interface AcademyEnrollment { id:string; userId:string; courseId:string; status:AcademyEnrollmentStatus; progressPercent:number; completedModules:number; refundEligible:boolean; createdAt:string; updatedAt:string; }
export interface AcademyProgressEvent { id:string; enrollmentId:string; userId:string; moduleIndex:number; eventType:string; payload:Record<string,unknown>; createdAt:string; }
