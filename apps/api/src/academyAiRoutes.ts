import { z } from 'zod';
import type { Express, RequestHandler } from 'express';
import { authenticatedPrincipal } from './authentication.js';
import type { AcademyRepository } from './academyRepository.js';
import type { AiProviderAdapter } from './aiProvider.js';
import { generateAcademyTutorResponse } from './academyAiService.js';

export function registerAcademyAiRoutes(app: Express, authenticated: RequestHandler, academyRepository: AcademyRepository, aiProvider: AiProviderAdapter) {
  const tutor = z.object({ enrollmentId: z.string().min(1), moduleIndex: z.number().int().min(0), question: z.string().min(3).max(2000), model: z.string().min(1).max(120).default('llama3.2') });
  app.post('/api/v1/academy/tutor', authenticated, async (req, res) => {
    const parsed = tutor.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'INVALID_TUTOR_REQUEST', details: parsed.error.flatten() });
    const p = authenticatedPrincipal(res);
    try {
      const result = await generateAcademyTutorResponse({ userId: p.userId, ...parsed.data }, academyRepository, aiProvider, parsed.data.model);
      return res.json(result);
    } catch (error) {
      const code = error instanceof Error ? error.message : 'ACADEMY_TUTOR_FAILED';
      if (code === 'ENROLLMENT_NOT_FOUND') return res.status(404).json({ error: code });
      if (code === 'MODULE_NOT_FOUND' || code === 'QUESTION_REQUIRED') return res.status(400).json({ error: code });
      return res.status(503).json({ error: 'ACADEMY_TUTOR_UNAVAILABLE' });
    }
  });
}
