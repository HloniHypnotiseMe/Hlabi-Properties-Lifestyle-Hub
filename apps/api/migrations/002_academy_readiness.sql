CREATE TABLE IF NOT EXISTS academy_courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academy_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES academy_courses(id),
  status TEXT NOT NULL DEFAULT 'ENROLLED',
  progress_percent INTEGER NOT NULL DEFAULT 0,
  completed_modules INTEGER NOT NULL DEFAULT 0,
  refund_eligible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);
CREATE INDEX IF NOT EXISTS academy_enrollments_user_id_idx ON academy_enrollments(user_id);

CREATE TABLE IF NOT EXISTS academy_progress_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  module_index INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS academy_progress_events_enrollment_idx ON academy_progress_events(enrollment_id, created_at);

CREATE TABLE IF NOT EXISTS academy_lesson_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  lesson_id TEXT NOT NULL,
  module_index INTEGER NOT NULL,
  asset_id TEXT NOT NULL,
  asset_kind TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('STARTED','COMPLETED')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(enrollment_id, asset_id, event_type)
);
CREATE INDEX IF NOT EXISTS academy_lesson_activities_enrollment_idx ON academy_lesson_activities(enrollment_id, module_index, occurred_at);

CREATE TABLE IF NOT EXISTS academy_readiness_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  exam_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('IN_PROGRESS','SUBMITTED','NEEDS_REVIEW','PASSED','FAILED')),
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC(6,2),
  max_score INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES users(id),
  feedback TEXT
);
CREATE INDEX IF NOT EXISTS academy_readiness_exam_attempts_enrollment_idx ON academy_readiness_exam_attempts(enrollment_id, started_at DESC);
CREATE INDEX IF NOT EXISTS academy_readiness_exam_attempts_review_idx ON academy_readiness_exam_attempts(status, started_at);

DROP TRIGGER IF EXISTS academy_courses_set_updated_at ON academy_courses;
CREATE TRIGGER academy_courses_set_updated_at BEFORE UPDATE ON academy_courses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS academy_enrollments_set_updated_at ON academy_enrollments;
CREATE TRIGGER academy_enrollments_set_updated_at BEFORE UPDATE ON academy_enrollments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
