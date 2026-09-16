import { useEffect, useState, type ReactNode } from 'react';
import { demoAuthProvider, type AuthSession } from '../domain/auth';

interface ProtectedHomeownerRouteProps {
  children: (session: AuthSession) => ReactNode;
}

export default function ProtectedHomeownerRoute({ children }: ProtectedHomeownerRouteProps) {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    demoAuthProvider.getSession().then(setSession);
  }, []);

  if (!session) {
    return <section className="portal-loading">Loading your Lifestyle Hub…</section>;
  }

  if (!session.user.roles.includes('HOMEOWNER')) {
    return <section className="portal-loading">This area is available to homeowner accounts.</section>;
  }

  return <>{children(session)}</>;
}
