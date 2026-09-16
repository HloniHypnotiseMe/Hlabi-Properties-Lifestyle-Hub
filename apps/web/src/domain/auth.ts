export type UserRole = 'HOMEOWNER' | 'BUYER' | 'SELLER' | 'INVESTOR' | 'AGENT' | 'SUPPLIER' | 'ADMIN';

export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  roles: UserRole[];
  propertyIds: string[];
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: string;
}

export interface AuthProvider {
  getSession(): Promise<AuthSession | null>;
  signOut(): Promise<void>;
}

export const demoSession: AuthSession = {
  user: {
    id: 'demo-homeowner-001',
    displayName: 'Demo Homeowner',
    email: 'homeowner@example.invalid',
    roles: ['HOMEOWNER'],
    propertyIds: ['prop-demo-001'],
  },
  expiresAt: '2099-12-31T23:59:59.000Z',
};

export const demoAuthProvider: AuthProvider = {
  async getSession() {
    return demoSession;
  },
  async signOut() {
    // Production implementation will revoke the server-side session.
  },
};
