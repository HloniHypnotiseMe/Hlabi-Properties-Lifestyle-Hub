import type { AiGenerationRequest, AiGenerationResult } from './aiDomain.js';

export interface AiProviderAdapter {
  generate(request: AiGenerationRequest): Promise<AiGenerationResult>;
}

export class DisabledAiProvider implements AiProviderAdapter {
  async generate(request: AiGenerationRequest): Promise<AiGenerationResult> {
    throw new Error(`AI_PROVIDER_NOT_CONFIGURED:${request.provider}`);
  }
}

export class OllamaAiProvider implements AiProviderAdapter {
  constructor(private readonly baseUrl: string, private readonly fetchImpl: typeof fetch = fetch) {}

  async generate(request: AiGenerationRequest): Promise<AiGenerationResult> {
    const response = await this.fetchImpl(`${this.baseUrl.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        prompt: request.prompt,
        system: request.system,
        stream: false,
        options: {
          temperature: request.temperature,
          num_predict: request.maxTokens,
        },
      }),
    });
    if (!response.ok) throw new Error(`AI_PROVIDER_HTTP_${response.status}`);
    const data = await response.json() as { response?: string } & Record<string, unknown>;
    return { provider: 'OLLAMA', model: request.model, text: data.response ?? '', raw: data };
  }
}
