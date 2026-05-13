BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location_label TEXT NOT NULL,
  primary_domain CITEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, location_label),
  UNIQUE (primary_domain)
);

CREATE TABLE client_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'mobile' CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  locale TEXT NOT NULL DEFAULT 'en-US',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, keyword, device_type, locale)
);

CREATE TABLE serp_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES client_keywords(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('dataforseo', 'manual', 'other')),
  channel TEXT NOT NULL CHECK (channel IN ('mobile_serp', 'desktop_serp', 'local_pack')),
  observed_at TIMESTAMPTZ NOT NULL,
  location_label TEXT,
  rank_position INTEGER CHECK (rank_position > 0),
  raw_payload JSONB NOT NULL,
  dedupe_key TEXT,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dedupe_key)
);

CREATE TABLE serp_observation_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES serp_observations(id) ON DELETE CASCADE,
  domain CITEXT NOT NULL,
  rank_position INTEGER CHECK (rank_position > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (observation_id, domain)
);

CREATE TABLE signal_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  trigger_source TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_source IN ('manual', 'scheduled', 'webhook')),
  enqueued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE intelligence_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  observation_id UUID REFERENCES serp_observations(id) ON DELETE SET NULL,
  signal_job_id UUID REFERENCES signal_jobs(id) ON DELETE SET NULL,
  signal_type TEXT NOT NULL
    CHECK (signal_type IN ('rank_change', 'visibility_change', 'new_competitor', 'lost_competitor', 'anomaly')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  score NUMERIC(6,2),
  headline TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  observed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE feature_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  signal_job_id UUID REFERENCES signal_jobs(id) ON DELETE SET NULL,
  vector_version TEXT NOT NULL,
  features JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coverage_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES client_keywords(id) ON DELETE SET NULL,
  snapshot_date DATE NOT NULL,
  coverage_score NUMERIC(5,2) NOT NULL CHECK (coverage_score >= 0 AND coverage_score <= 100),
  top_3_count INTEGER NOT NULL DEFAULT 0 CHECK (top_3_count >= 0),
  top_10_count INTEGER NOT NULL DEFAULT 0 CHECK (top_10_count >= 0),
  avg_rank NUMERIC(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, keyword_id, snapshot_date)
);

CREATE INDEX idx_keywords_client_active ON client_keywords (client_id, is_active);
CREATE INDEX idx_keywords_client_created_desc ON client_keywords (client_id, created_at DESC);
CREATE INDEX idx_observations_client_observed_desc ON serp_observations (client_id, observed_at DESC);
CREATE INDEX idx_observations_keyword_observed_desc ON serp_observations (keyword_id, observed_at DESC);
CREATE INDEX idx_observations_provider_channel ON serp_observations (provider, channel);
CREATE INDEX idx_competitors_observation_rank ON serp_observation_competitors (observation_id, rank_position);
CREATE INDEX idx_signal_jobs_client_status_enqueued ON signal_jobs (client_id, status, enqueued_at DESC);
CREATE INDEX idx_signals_client_observed_desc ON intelligence_signals (client_id, observed_at DESC);
CREATE INDEX idx_signals_client_severity_created_desc ON intelligence_signals (client_id, severity, created_at DESC);
CREATE INDEX idx_signals_type_created_desc ON intelligence_signals (signal_type, created_at DESC);
CREATE INDEX idx_feature_vectors_client_generated_desc ON feature_vectors (client_id, generated_at DESC);
CREATE INDEX idx_coverage_client_snapshot_desc ON coverage_snapshots (client_id, snapshot_date DESC);

CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_client_keywords_updated_at
BEFORE UPDATE ON client_keywords
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
