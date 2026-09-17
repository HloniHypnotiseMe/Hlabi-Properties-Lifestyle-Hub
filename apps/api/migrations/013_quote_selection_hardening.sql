-- Quote selection is a one-time commitment: a supplier quote can back at most one service job.
-- Existing duplicate data is preserved; deployments with duplicates must reconcile before
-- this unique index can be created successfully.
CREATE UNIQUE INDEX IF NOT EXISTS service_jobs_quote_id_unique
  ON service_jobs(quote_id)
  WHERE quote_id IS NOT NULL;

-- A selected quote closes the request so the customer journey has a server-side terminal
-- selection state rather than relying on the UI.
CREATE INDEX IF NOT EXISTS supplier_quotes_owner_request_status_idx
  ON supplier_quotes(owner_id, quote_request_id, status);
