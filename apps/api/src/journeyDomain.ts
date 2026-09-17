export const journeyTypes = ['BUYER','SELLER','INVESTOR'] as const;
export type JourneyType = typeof journeyTypes[number];

export const journeyStatuses = ['ACTIVE','PAUSED','COMPLETED','CANCELLED'] as const;
export type JourneyStatus = typeof journeyStatuses[number];

export interface JourneyProfile {
  id: string;
  userId: string;
  type: JourneyType;
  status: JourneyStatus;
  goals: Record<string, unknown>;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface JourneyEvent {
  id: string;
  journeyId: string;
  userId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}
