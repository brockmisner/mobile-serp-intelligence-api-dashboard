# Database Schema and Migration Notes

## Scope

This schema models the MVP flow documented in `docs/GETTING_STARTED.md`:

- create and manage tracked clients
- ingest mobile SERP observations
- process signal jobs
- retrieve intelligence signals
- expose snapshots/features/coverage views

## Primary entities

- `clients`: tenant-level business records
- `client_keywords`: tracked keyword targets per client
- `serp_observations`: normalized ingestion records (`/pipeline/observations/ingest`)
- `serp_observation_competitors`: extracted competitor domains from observations
- `signal_jobs`: async processing jobs (`/pipeline/signals/jobs/*`)
- `intelligence_signals`: generated outputs (`/pipeline/signals`)
- `feature_vectors`: feature payloads backing `/api/v1/features`
- `coverage_snapshots`: aggregate rank/coverage metrics backing `/api/v1/coverage`

## Migration files

- `db/migrations/0001_initial_schema.up.sql`
- `db/migrations/0001_initial_schema.down.sql`

## API scaffold and validation boundary

The API scaffold in `apps/api` defines these initial route groups:

- `GET /health`
- `GET|POST|PATCH|DELETE /api/v1/snapshots`
- `GET /api/v1/features`
- `GET /api/v1/coverage`

Request validation middleware is attached at the route boundary for snapshots:

- `validatePaginationQuery` for `GET /api/v1/snapshots`
- `validateSnapshotIdParam` for snapshot-id routes
- `validateCreateSnapshotBody` for create/update payloads

Validation failures return `422` with field-level `details`.

## Index strategy

Indexes were added for the expected high-frequency read patterns:

- latest observations by client/keyword
- queued/completed jobs by client
- recent signals by severity and type
- feature vectors by generation time
- coverage snapshots by date

## Design notes

- Postgres-specific extensions used: `pgcrypto` and `citext`.
- Ingestion payloads and signal details are stored as `JSONB` for provider-specific evolution.
- `dedupe_key` on `serp_observations` allows idempotent ingestion by caller-provided hash.
