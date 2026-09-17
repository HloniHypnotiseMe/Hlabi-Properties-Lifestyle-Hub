ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES service_jobs(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS payment_transactions_job_id_idx ON payment_transactions(job_id);
CREATE UNIQUE INDEX IF NOT EXISTS payment_transactions_job_success_idx ON payment_transactions(job_id) WHERE job_id IS NOT NULL AND status='SUCCEEDED';

ALTER TABLE payment_events ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES service_jobs(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS payment_events_job_id_idx ON payment_events(job_id);
