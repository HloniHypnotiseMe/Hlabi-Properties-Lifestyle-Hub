CREATE TABLE IF NOT EXISTS academy_assessment_attempts (
  id UUID PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER,
  max_score INTEGER NOT NULL CHECK (max_score >= 0),
  status TEXT NOT NULL CHECK (status IN ('SUBMITTED','PASSED','NEEDS_REVIEW','FAILED')),
  reviewer_id TEXT,
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_academy_attempts_enrollment ON academy_assessment_attempts(enrollment_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_academy_attempts_user ON academy_assessment_attempts(user_id, submitted_at DESC);
