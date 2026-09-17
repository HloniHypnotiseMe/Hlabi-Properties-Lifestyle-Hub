import type { Request, Response, NextFunction } from 'express';

export const userRoles = ['HOMEOWNER', 'BUYER', 'SELLER', 'INVESTOR', 'AGENT', 'SUPPLIER', 'ADMIN'] as const;
export type AuthenticatedRole = typeof userRoles[number];

export interface AuthenticatedPrincipal {
  userId: string;
  role: AuthenticatedRole;
}

export interface AuthenticationProvider {
  authenticate(req: Request): Promise<AuthenticatedPrincipal | null>;
}

/** Development-only adapter. Production must replace this with verified OIDC/JWT/session validation. */
export class DevelopmentAuthenticationProvider implements AuthenticationProvider {
  async authenticate(req: Request): Promise<AuthenticatedPrincipal | null> {
    const userId = String(req.headers['x-hlabi-user-id'] ?? '');
    const requestedRole = String(req.headers['x-hlabi-role'] ?? 'HOMEOWNER').toUpperCase();
    const role = userRoles.includes(requestedRole as AuthenticatedRole) ? requestedRole as AuthenticatedRole : null;
    return userId && role ? { userId, role } : null;
  }
}

export class UnconfiguredAuthenticationProvider implements AuthenticationProvider {
  async authenticate(_req: Request): Promise<AuthenticatedPrincipal | null> {
    return null;
  }
}

export function requireAuthentication(provider: AuthenticationProvider) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const principal = await provider.authenticate(req);
    if (!principal) return res.status(401).json({ error: 'AUTHENTICATION_REQUIRED' });
    res.locals.principal = principal;
    return next();
  };
}

export function authenticatedPrincipal(res: Response): AuthenticatedPrincipal {
  return res.locals.principal as AuthenticatedPrincipal;
}
