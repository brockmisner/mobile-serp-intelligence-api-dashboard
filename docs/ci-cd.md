# CI/CD Pipeline

## Pipeline Overview

This project uses GitHub Actions for continuous integration and continuous delivery:

- `.github/workflows/ci.yml` validates code on pull requests and pushes to `main`.
- `.github/workflows/cd.yml` deploys after successful `main` CI runs (or manual dispatch) and then runs a smoke test.

## CI Workflow

Runs on: pull requests and pushes to `main`

| Stage | Trigger | What it does |
| --- | --- | --- |
| Install | PR, push to `main` | Installs dependencies with `npm ci --include=dev` |
| Lint | PR, push to `main` | Runs `npm run lint` |
| Build | PR, push to `main` | Runs `npm run build` |
| Test | PR, push to `main` | Runs `npm test` |

## CD Workflow

Runs on: successful CI runs for pushes to `main`, or manual `workflow_dispatch`

| Stage | Trigger | What it does |
| --- | --- | --- |
| Build | successful CI on `main` / manual | Rebuilds artifact with `npm run build` |
| Deploy | successful CI on `main` / manual | Calls deployment webhook via `npm run deploy` |
| Smoke Test | after deploy | Runs `npm run test:smoke:deployment` against deployment URL |

Manual dispatch inputs:

- `deploy_sha` (optional): known-good `main` commit SHA to redeploy.
- `reason` (optional): free-text reason attached to deploy metadata.

Safety checks:

- Resolved deployment SHA must exist in `main` ancestry.
- Deploy runs are serialized via concurrency group `cd-production`.

## Environment Variables and Secrets

Set these in GitHub repository secrets:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DEPLOY_WEBHOOK_URL` | Yes (for real deploys) | Webhook endpoint used by `scripts/deploy.mjs` |
| `DEPLOY_AUTH_TOKEN` | Optional | Bearer token sent to deployment webhook |
| `SMOKE_TEST_URL` | Yes for CD smoke test | Deployment base URL checked after deployment |

Runtime variables passed by workflow:

- `DEPLOY_ENVIRONMENT` (`production`)
- `DEPLOY_SHA`, `DEPLOY_REF`, `DEPLOY_REASON`, `DEPLOY_ACTOR`, `DEPLOY_REPOSITORY`
- `DEPLOYMENT_URL` (resolved from `SMOKE_TEST_URL`)

If `DEPLOY_WEBHOOK_URL` is not set, deployment is skipped with a clear log message.
If `SMOKE_TEST_URL` is not set, the smoke test fails and blocks the deployment workflow.

## Deployment Targets

- **Production**: deployment target behind `DEPLOY_WEBHOOK_URL`
- **Staging**: optional separate environment via a future staging workflow

## Rollback Procedure

1. Identify the failing deployment from the `CD` workflow run.
2. Find the last known-good commit SHA from successful `CD` runs.
3. Open **Actions > CD > Run workflow**.
4. Provide:
   - `deploy_sha=<known-good-sha>`
   - `reason=Rollback after <incident>`
5. Confirm the deployment summary contains the intended SHA.
6. Re-run smoke tests against production.
7. Revert the offending commit in `main` if needed.
8. Fix root cause and deploy again through CI/CD.

## Recommended Repository Settings

- Require pull request reviews before merging to `main`.
- Require status checks: `CI / sanity`.
- Restrict direct pushes to `main`.
