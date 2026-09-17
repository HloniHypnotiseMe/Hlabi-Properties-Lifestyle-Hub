# Academy AI Tutor

The Academy AI Tutor provides contextual teaching assistance for an enrolled learner and module.

## Flow

`Authenticated learner → enrollment ownership check → module validation → Ollama adapter → tutor response`

## Safety boundaries

- Tutor access is scoped to the learner's own enrollment.
- The tutor does not award qualifications, registrations, licences or designations.
- The tutor must not invent South African legislation, regulatory requirements, accreditation, exam results or employment promises.
- Current legal/regulatory questions require verification against authoritative sources.
- AI is advisory/educational; assessment scoring and certification remain separate workflows.
- Ollama is opt-in through `OLLAMA_URL`; no external AI credential is committed.

## Next stage

Persist tutor sessions and audit events, add structured assessments/simulations, introduce human-reviewed learning content, and connect verified qualification-provider pathways.
