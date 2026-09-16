import type { HomeownerRepository } from './homeownerRepository';

export interface ApiClient {
  getHomeownerRepository(userId: string): Promise<HomeownerRepository>;
}

/**
 * Adapter boundary for the future authenticated backend.
 * The public UI never needs to know whether data comes from demo storage,
 * REST, GraphQL or another persistence layer.
 */
export function createApiClient(repository: HomeownerRepository): ApiClient {
  return {
    async getHomeownerRepository() {
      return repository;
    },
  };
}
