export const ACADEMY_READINESS_SCHEMA = 'hlabi.academy.readiness-blueprint.v1';
export const ACADEMY_READINESS_VERSION = '2026-09-17';

export type AcademyCompetencyDomain =
  | 'LEGISLATIVE_FRAMEWORK'
  | 'ETHICS_AND_PROFESSIONAL_CONDUCT'
  | 'CONSUMER_PROTECTION'
  | 'REGULATORY_COMPLIANCE'
  | 'FIDUCIARY_DUTIES'
  | 'PRACTICAL_APPLICATION'
  | 'PROFESSIONAL_JUDGEMENT';

export interface AcademyCompetency {
  id: string;
  domain: AcademyCompetencyDomain;
  title: string;
  description: string;
  assessmentModes: Array<'KNOWLEDGE' | 'SIMULATION' | 'REVIEWED_EVIDENCE'>;
}

/**
 * Versioned readiness blueprint based on PPRA material publicly available on
 * 17 September 2026. It is a curriculum-design reference, not a qualification
 * and not a claim that completing Hlabi Academy guarantees an external result.
 */
export const ACADEMY_READINESS_BLUEPRINT = {
  schema: ACADEMY_READINESS_SCHEMA,
  version: ACADEMY_READINESS_VERSION,
  jurisdiction: 'ZA',
  regulator: 'Property Practitioners Regulatory Authority',
  externalPathways: ['PDE4', 'PDE5', 'PPRA competency-based PDE4 pathway'],
  competencies: [
    { id: 'LEG-01', domain: 'LEGISLATIVE_FRAMEWORK', title: 'Legislative framework', description: 'Understand the legislative and regulatory framework governing property practice and apply relevant rules to realistic situations.', assessmentModes: ['KNOWLEDGE', 'SIMULATION', 'REVIEWED_EVIDENCE'] },
    { id: 'ETH-01', domain: 'ETHICS_AND_PROFESSIONAL_CONDUCT', title: 'Ethics and professional conduct', description: 'Recognise ethical duties, professional standards, conflicts and conduct obligations and apply them to client and transaction scenarios.', assessmentModes: ['KNOWLEDGE', 'SIMULATION', 'REVIEWED_EVIDENCE'] },
    { id: 'CON-01', domain: 'CONSUMER_PROTECTION', title: 'Consumer protection', description: 'Apply consumer-protection principles when advising, communicating, documenting and progressing property transactions.', assessmentModes: ['KNOWLEDGE', 'SIMULATION', 'REVIEWED_EVIDENCE'] },
    { id: 'COM-01', domain: 'REGULATORY_COMPLIANCE', title: 'Regulatory compliance', description: 'Identify compliance obligations, required records and escalation points and demonstrate traceable professional practice.', assessmentModes: ['KNOWLEDGE', 'SIMULATION', 'REVIEWED_EVIDENCE'] },
    { id: 'FID-01', domain: 'FIDUCIARY_DUTIES', title: 'Fiduciary duties', description: 'Apply duties owed to clients and other stakeholders, including responsible handling of interests, information and transaction decisions.', assessmentModes: ['KNOWLEDGE', 'SIMULATION', 'REVIEWED_EVIDENCE'] },
    { id: 'APP-01', domain: 'PRACTICAL_APPLICATION', title: 'Practical application', description: 'Translate rules and knowledge into defensible actions, documentation, client communication and next-step plans.', assessmentModes: ['SIMULATION', 'REVIEWED_EVIDENCE'] },
    { id: 'JUD-01', domain: 'PROFESSIONAL_JUDGEMENT', title: 'Professional judgement', description: 'Analyse facts, identify risks, distinguish known facts from assumptions and choose an appropriately documented course of action.', assessmentModes: ['SIMULATION', 'REVIEWED_EVIDENCE'] }
  ] satisfies AcademyCompetency[],
  curriculumPrinciples: [
    'Keep the blueprint versioned so regulatory changes do not silently become stale curriculum.',
    'Teach the same kinds of knowledge and applied reasoning identified by the regulator, without reproducing protected examination papers.',
    'Use scenario-based assessment and authorised human review for applied competence.',
    'Require evidence of reasoning, documentation and professional judgement rather than relying only on multiple-choice recall.',
    'Treat the Hlabi readiness result as internal evidence of preparation; it does not confer registration, designation or a statutory qualification.'
  ],
  moduleMapping: [
    { moduleIndex: 0, moduleTitle: 'Property fundamentals', competencies: ['LEG-01', 'CON-01'] },
    { moduleIndex: 1, moduleTitle: 'Buyer and seller journeys', competencies: ['CON-01', 'APP-01', 'JUD-01'] },
    { moduleIndex: 2, moduleTitle: 'Listing and marketing practice', competencies: ['CON-01', 'COM-01', 'ETH-01'] },
    { moduleIndex: 3, moduleTitle: 'Negotiation and client communication', competencies: ['ETH-01', 'FID-01', 'APP-01', 'JUD-01'] },
    { moduleIndex: 4, moduleTitle: 'Ethics, compliance and professional conduct', competencies: ['LEG-01', 'ETH-01', 'COM-01', 'FID-01'] },
    { moduleIndex: 5, moduleTitle: 'AI tools for property work', competencies: ['COM-01', 'ETH-01', 'APP-01', 'JUD-01'] }
  ],
  sourceRegister: [
    { label: 'PPRA PDE page', url: 'https://theppra.org.za/education/pde/' },
    { label: 'PPRA 2026 PDE requirements and rules', url: 'https://theppra.org.za/notice-2026-ppra-professional-designation-examination-pde-requirements-and-rules/' },
    { label: 'PPRA competency-based PDE4 pathway', url: 'https://theppra.org.za/ppra-introduces-an-alternative-competency-based-pathway-to-the-pde-4-while-retaining-existing-nqf-level-4-and-nqf-level-5-qualification-routes/' }
  ],
  disclaimer: 'Hlabi Properties is not the regulator and this blueprint does not confer a professional designation, qualification, registration or statutory exam result.'
} as const;

export function getAcademyReadinessBlueprint() {
  return ACADEMY_READINESS_BLUEPRINT;
}
