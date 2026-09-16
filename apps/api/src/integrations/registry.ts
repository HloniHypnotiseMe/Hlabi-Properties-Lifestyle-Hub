import type { IntegrationConfig, IntegrationName, IntegrationRegistry } from './types.js';

const definitions: IntegrationConfig[] = [
  { name: 'orchestration', enabled: true, notes: 'Agent casting/workflow boundary; provider selected at deployment.' },
  { name: 'multi-agent', enabled: true, notes: 'crewAI/LangGraph/hermes-agent-compatible workflow boundary.' },
  { name: 'memory', enabled: true, notes: 'mem0/LightRAG/Qdrant-compatible persistent context boundary.' },
  { name: 'email', enabled: false, baseUrl: process.env.BILLIONMAIL_URL, apiKeyEnv: 'BILLIONMAIL_API_KEY' },
  { name: 'whatsapp', enabled: false, baseUrl: process.env.WHATOMATE_URL, apiKeyEnv: 'WHATOMATE_API_KEY' },
  { name: 'sms', enabled: false, baseUrl: process.env.ARKESel_URL, apiKeyEnv: 'ARKESEL_API_KEY' },
  { name: 'scraping', enabled: true, notes: 'Worker-only discovery boundary; respect robots, terms and applicable law.' },
  { name: 'voice', enabled: true, notes: 'Whisper/STT and TTS worker boundary.' },
  { name: 'content', enabled: true, notes: 'ComfyUI/content worker boundary.' },
  { name: 'payments', enabled: false, baseUrl: process.env.REMOTEPAY_URL, apiKeyEnv: 'REMOTEPAY_API_KEY' },
  { name: 'llm', enabled: true, baseUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434' },
  { name: 'hosting', enabled: true, notes: 'Cloudflare Pages + Contabo deployment topology.' },
];

export class DefaultIntegrationRegistry implements IntegrationRegistry {
  list(): IntegrationConfig[] {
    return definitions.map((definition) => ({ ...definition }));
  }

  get(name: IntegrationName): IntegrationConfig | undefined {
    return this.list().find((definition) => definition.name === name);
  }
}
