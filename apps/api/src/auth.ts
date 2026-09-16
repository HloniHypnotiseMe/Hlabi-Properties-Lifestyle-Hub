import type { Request } from 'express';

export interface AuthenticatedPrincipal {
  userId: string;
  role: 'HOMEOWNER';
}

/** Development-only adapter. Replace with verified token/session claims before production. */
export function getPrincipal(req: Request): AuthenticatedPrincipal | null {
  const userId = String(req.headers['x-hlabi-user-id'] ?? '');
  return userId ? { userId, role: 'HOMEOWNER' } : null;
}
