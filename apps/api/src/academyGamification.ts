export const ACADEMY_GAMIFICATION_SCHEMA = 'hlabi.academy.gamification.v1';

export type AcademyMission = {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
};

export type AcademyGamification = {
  schema: string;
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number | null;
  completedModules: number;
  badges: string[];
  milestones: string[];
  missions: AcademyMission[];
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
}): AcademyGamification {
  const completedModules = Math.max(0, input.completedModules);
  const moduleCount = Math.max(0, input.moduleCount);
  const passedAssessments = Math.max(0, input.passedAssessments);
  const reviewedAssessments = Math.max(0, input.reviewedAssessments);
  const moduleXp = completedModules * 50;
  const assessmentXp = passedAssessments * 100;
  const reviewXp = reviewedAssessments * 25;
  const xp = moduleXp + assessmentXp + reviewXp;
  let level = 1;
  for (let i = 0; i < LEVELS.length; i += 1) if (xp >= LEVELS[i].xp) level = i + 1;
  const current = LEVELS[level - 1];
  const next = LEVELS[level] ?? null;
  const foundationTarget = Math.max(moduleCount, 1);
  const missions: AcademyMission[] = [
    { id: 'FOUNDATION_MODULES', title: 'Complete the foundation', description: 'Work through every Academy foundation module.', progress: Math.min(completedModules, foundationTarget), target: foundationTarget, completed: completedModules >= foundationTarget },
    { id: 'FIRST_REVIEWED_EVIDENCE', title: 'Submit practical evidence', description: 'Complete a practical assessment and receive a reviewer outcome.', progress: Math.min(reviewedAssessments, 1), target: 1, completed: reviewedAssessments >= 1 },
    { id: 'THREE_PASSED_ASSESSMENTS', title: 'Build assessment momentum', description: 'Pass three assessments through the Academy assessment system.', progress: Math.min(passedAssessments, 3), target: 3, completed: passedAssessments >= 3 },
  ];
  const badges: string[] = [];
  const milestones: string[] = [];
  if (completedModules > 0) badges.push('FIRST_MODULE');
  if (completedModules >= foundationTarget && moduleCount > 0) badges.push('FOUNDATION_COMPLETE');
  if (passedAssessments > 0) badges.push('ASSESSMENT_PASSED');
  if (passedAssessments >= 3) badges.push('PRACTICAL_PROGRESS');
  if (completedModules >= foundationTarget && moduleCount > 0) milestones.push('ACADEMY_FOUNDATION_COMPLETE');
  if (reviewedAssessments > 0) milestones.push('FIRST_REVIEWED_EVIDENCE');
  return {
    schema: ACADEMY_GAMIFICATION_SCHEMA,
    xp,
    level,
    levelTitle: current.title,
    nextLevelXp: next?.xp ?? null,
    completedModules,
    badges,
    milestones,
    missions,
    streakDays: 0,
    disclaimer: 'Gamification reflects learning activity and engagement. It does not represent a professional designation, qualification, registration or regulatory approval.',
  };
}
