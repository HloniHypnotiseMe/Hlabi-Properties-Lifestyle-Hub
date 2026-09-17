export const homePassportSections = ['PROPERTY','OWNERSHIP','MAINTENANCE','RENOVATIONS','APPLIANCES','INSURANCE','FINANCE','SERVICES','DOCUMENTS','WARRANTIES','PROJECTS','PREFERENCES'] as const;
export type HomePassportSection = typeof homePassportSections[number];
export const homePassportStatuses = ['ACTIVE','ARCHIVED'] as const;
export type HomePassportStatus = typeof homePassportStatuses[number];

export interface HomePassport {
  id: string;
  propertyId: string;
  ownerId: string;
  status: HomePassportStatus;
  data: Partial<Record<HomePassportSection, Record<string, unknown>>>;
  createdAt: string;
  updatedAt: string;
}

export function emptyHomePassport(propertyId: string, ownerId: string): Omit<HomePassport,'id'|'createdAt'|'updatedAt'> {
  return { propertyId, ownerId, status: 'ACTIVE', data: {} };
}
