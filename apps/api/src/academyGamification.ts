export const ACADEMY_GAMIFICATION_SCHEMA = 'hlabi.academy.gamification.v1';

export type AcademyGamification = {
  schema: string;
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number | null;
  completedModules: number;
  badges: string[];
  milestones: string[];
  streakDays: number;
  disclaimer: string;
};

const LEVELS = [
  { xp: 0, title: 'Explorer' },
  { xp: 100, title: 'Practitioner' },
  { xp: 250, title: 'Operator' },
  { xp: 500, title: 'Property Professional' },
  { xp: 900, title: 'Advanced Practitioner' },
];

export function buildAcademyGamification(input: {
  completedModules: number;
  moduleCount: number;
  passedAssessments: number;
  reviewedAssessments: number;
  streakDays?: number;
}): AcademyGamification {
  const moduleXp = Math.max(0, input.completedModules) * 50;
  const assessmentXp = Math.max(0, input.passedAssessments) * 100;
  const reviewXp = Math.max(0, input.reviewedAssessments) * 25;
  const xp = moduleXp + assessmentXp + reviewXp;
  let level = 1;
  for (let i = 0; i < LEVELS.length; i += 1) if (xp >= LEVELS[i].xp) level = i + 1;
  const current = LEVELS[level - 1];
  const next = LEVELS[level] ?? null;
  const badges: string[] = [];
  const milestones: string[] = [];
  if (input.completedModules > 0) badges.push('FIRST_MODULE');
  if (input.completedModules >= input.moduleCount && input.moduleCount > 0) badges.push('FOUNDATION_COMPLETE');
  if (input.passedAssessments > 0) badges.push('ASSESSMENT_PASSED');
  if (input.passedAssessments >= 3) badges.push('PRACTICAL_PROGRESS');
  if ((input.streakDays ?? 0) >= 7) badges.push('SEVEN_DAY_STREAK');
  if (input.completedModules >= input.moduleCount && input.moduleCount > 0) milestones.push('ACADEMY_FOUNDATION_COMPLETE');
  if (input.reviewedAssessments > 0) milestones.push('FIRST_REVIEWED_EVIDENCE');
  return {
    schema: ACADEMY_GAMIFICATION_SCHEMA,
    xp,
    level,
    levelTitle: current.title,
    nextLevelXp: next?.xp ?? null,
    completedModules: input.completedModules,
    badges,
    milestones,
    streakDays: Math.max(0, input.streakDays ?? 0),
    disclaimer: 'Gamification reflects learning activity and engagement. It does not represent a professional designation, qualification, registration or regulatory approval.',
  };
}
