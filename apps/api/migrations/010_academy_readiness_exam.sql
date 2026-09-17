CREATE TABLE IF NOT EXISTS academy_lesson_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  module_index INTEGER NOT NULL CHECK(module_index >= 0),
  asset_id TEXT NOT NULL,
  asset_kind TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('STARTED','COMPLETED')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(enrollment_id, asset_id, event_type)
);
CREATE INDEX IF NOT EXISTS academy_lesson_activity_enrollment_idx ON academy_lesson_activities(enrollment_id, module_index, occurred_at DESC);

CREATE TABLE IF NOT EXISTS academy_readiness_exam_attempts (
  id UUID PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  exam_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('IN_PROGRESS','SUBMITTED','PASSED','FAILED','NEEDS_REVIEW')),
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC,
  max_score INTEGER NOT NULL CHECK(max_score >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewer_id TEXT,
  feedback TEXT
);
CREATE INDEX IF NOT EXISTS academy_readiness_exam_enrollment_idx ON academy_readiness_exam_attempts(enrollment_id, started_at DESC);
CREATE INDEX IF NOT EXISTS academy_readiness_exam_review_idx ON academy_readiness_exam_attempts(status, started_at ASC);
