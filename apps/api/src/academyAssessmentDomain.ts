export const academyAssessmentKinds=['KNOWLEDGE','SIMULATION'] as const;
export type AcademyAssessmentKind=typeof academyAssessmentKinds[number];
export const academyAttemptStatuses=['SUBMITTED','PASSED','NEEDS_REVIEW','FAILED'] as const;
export type AcademyAttemptStatus=typeof academyAttemptStatuses[number];
export interface AcademyQuestion{id:string;prompt:string;options?:string[];correctAnswer?:string;points:number;kind:'MULTIPLE_CHOICE'|'SHORT_RESPONSE';}
export interface AcademyAssessment{id:string;courseId:string;moduleIndex:number;title:string;kind:AcademyAssessmentKind;passingScore:number;questions:AcademyQuestion[];rubric?:string[];}
export interface AcademyAssessmentAttempt{id:string;assessmentId:string;enrollmentId:string;userId:string;answers:Record<string,string>;score:number|null;maxScore:number;status:AcademyAttemptStatus;reviewerId?:string;feedback?:string;submittedAt:string;reviewedAt?:string;}
