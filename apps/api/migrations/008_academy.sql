CREATE TABLE IF NOT EXISTS academy_courses (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, modules JSONB NOT NULL DEFAULT '[]'::jsonb, active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS academy_enrollments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL, course_id TEXT NOT NULL REFERENCES academy_courses(id),
 status TEXT NOT NULL DEFAULT 'ENROLLED' CHECK(status IN ('ENROLLED','IN_PROGRESS','COMPLETED','WITHDRAWN')),
 progress_percent INTEGER NOT NULL DEFAULT 0 CHECK(progress_percent BETWEEN 0 AND 100), completed_modules INTEGER NOT NULL DEFAULT 0 CHECK(completed_modules >= 0),
 refund_eligible BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(user_id,course_id)
);
CREATE INDEX IF NOT EXISTS academy_enrollments_user_idx ON academy_enrollments(user_id);
CREATE TABLE IF NOT EXISTS academy_progress_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE, user_id TEXT NOT NULL,
 module_index INTEGER NOT NULL CHECK(module_index >= 0), event_type TEXT NOT NULL, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS academy_progress_enrollment_idx ON academy_progress_events(enrollment_id,created_at DESC);
INSERT INTO academy_courses(id,title,description,modules) VALUES
('hlabi-property-professional-foundation','Hlabi Property Professional Foundation','A practical foundation for people preparing for a property career.','["Property fundamentals","Buyer and seller journeys","Listing and marketing practice","Negotiation and client communication","Ethics, compliance and professional conduct","AI tools for property work"]'::jsonb)
ON CONFLICT(id) DO NOTHING;
