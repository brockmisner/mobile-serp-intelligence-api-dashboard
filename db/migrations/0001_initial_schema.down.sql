BEGIN;

DROP TRIGGER IF EXISTS trg_client_keywords_updated_at ON client_keywords;
DROP TRIGGER IF EXISTS trg_clients_updated_at ON clients;

DROP TABLE IF EXISTS coverage_snapshots;
DROP TABLE IF EXISTS feature_vectors;
DROP TABLE IF EXISTS intelligence_signals;
DROP TABLE IF EXISTS signal_jobs;
DROP TABLE IF EXISTS serp_observation_competitors;
DROP TABLE IF EXISTS serp_observations;
DROP TABLE IF EXISTS client_keywords;
DROP TABLE IF EXISTS clients;

DROP FUNCTION IF EXISTS set_updated_at();

COMMIT;
