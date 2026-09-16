export type OnboardingStep =
  | 'IDENTITY'
  | 'PROPERTY'
  | 'PROPERTY_DETAILS'
  | 'HOME_AUDIT'
  | 'RENEWAL_PLAN'
  | 'COMPLETE';

export interface HomeownerOnboardingState {
  userId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  propertyId?: string;
  updatedAt: string;
}

export const initialOnboarding = (userId: string): HomeownerOnboardingState => ({
  userId,
  currentStep: 'IDENTITY',
  completedSteps: [],
  updatedAt: new Date().toISOString(),
});

export const advanceOnboarding = (
  state: HomeownerOnboardingState,
  step: OnboardingStep,
  propertyId?: string,
): HomeownerOnboardingState => ({
  ...state,
  currentStep: step,
  completedSteps: state.completedSteps.includes(step)
    ? state.completedSteps
    : [...state.completedSteps, step],
  propertyId: propertyId ?? state.propertyId,
  updatedAt: new Date().toISOString(),
});
