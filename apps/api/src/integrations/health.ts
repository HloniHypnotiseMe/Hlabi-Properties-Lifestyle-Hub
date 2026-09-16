import { DefaultIntegrationRegistry } from './registry.js';

export interface IntegrationHealth {
  name: string;
  enabled: boolean;
  configured: boolean;
  baseUrl?: string;
}

export function integrationHealth(): IntegrationHealth[] {
  const registry = new DefaultIntegrationRegistry();
  return registry.list().map((item) => ({
    name: item.name,
    enabled: item.enabled,
    configured: Boolean(item.baseUrl || !item.apiKeyEnv),
    baseUrl: item.baseUrl,
  }));
}
