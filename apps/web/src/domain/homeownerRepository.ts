import type { HomeownerDashboardData } from './property';

export interface HomeownerRepository {
  getDashboard(userId: string): Promise<HomeownerDashboardData>;
}

/**
 * Development adapter only. Replace this with the API-backed repository once
 * authentication and the backend are connected. No production user data is
 * stored in the frontend repository.
 */
export const demoHomeownerRepository: HomeownerRepository = {
  async getDashboard(userId) {
    return {
      userId,
      role: 'HOMEOWNER',
      properties: [
        {
          id: 'prop_demo_001',
          ownerId: userId,
          nickname: 'Mondeor Home',
          address: {
            line1: 'Demo property address',
            suburb: 'Mondeor',
            city: 'Johannesburg',
            province: 'Gauteng',
            postalCode: '2091',
            country: 'South Africa',
          },
          propertyType: 'HOUSE',
          lifecycle: 'active-plan',
          conditionGrade: 'AMBER',
          conditionScore: 78,
          nextFiveYearReview: '2027-06-15',
        },
      ],
      audits: [
        {
          id: 'audit_demo_001',
          propertyId: 'prop_demo_001',
          status: 'COMPLETED',
          inspectedAt: '2026-06-15',
          conditionScore: 78,
          grade: 'AMBER',
          findings: [
            {
              id: 'finding_demo_001',
              area: 'roof',
              title: 'Roof maintenance review',
              description: 'Example finding for the portal foundation.',
              grade: 'AMBER',
              priority: 'MEDIUM',
              recommendedAction: 'Obtain a verified supplier inspection and quote.',
              estimatedCostMin: 5000,
              estimatedCostMax: 15000,
              verified: false,
            },
          ],
        },
      ],
      renewalPlans: [
        {
          id: 'plan_demo_001',
          propertyId: 'prop_demo_001',
          status: 'ACTIVE',
          cycleYears: 5,
          startDate: '2026-06-15',
          nextReviewDate: '2027-06-15',
          tasks: [
            {
              id: 'task_demo_001',
              propertyId: 'prop_demo_001',
              title: 'Roof maintenance review',
              area: 'roof',
              priority: 'MEDIUM',
              dueDate: '2026-10-30',
              status: 'OPEN',
            },
            {
              id: 'task_demo_002',
              propertyId: 'prop_demo_001',
              title: 'Electrical safety check',
              area: 'electrical',
              priority: 'LOW',
              dueDate: '2027-02-15',
              status: 'OPEN',
            },
          ],
        },
      ],
      quotes: [],
      activity: [
        { id: 'activity_001', propertyId: 'prop_demo_001', type: 'AUDIT', title: 'Home audit completed', occurredAt: '2026-06-15' },
        { id: 'activity_002', propertyId: 'prop_demo_001', type: 'PLAN', title: 'Five-year renewal plan activated', occurredAt: '2026-06-16' },
      ],
    };
  },
};
