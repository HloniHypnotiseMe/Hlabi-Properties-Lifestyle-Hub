import type { Request, Response, NextFunction } from 'express';

export interface AuthenticatedPrincipal {
  userId: string;
  role: 'HOMEOWNER' | 'BUYER' | 'SELLER' | 'INVESTOR' | 'AGENT' | 'SUPPLIER' | 'ADMIN';
}

export interface AuthenticationProvider {
  authenticate(req: Request): Promise<AuthenticatedPrincipal | null>;
}

/** Development-only adapter. Production must replace this with verified OIDC/JWT/session validation. */
export class DevelopmentAuthenticationProvider implements AuthenticationProvider {
  async authenticate(req: Request): Promise<AuthenticatedPrincipal | null> {
    const userId = String(req.headers['x-hlabi-user-id'] ?? '');
    return userId ? { userId, role: 'HOMEOWNER' } : null;
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
