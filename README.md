# Mobile SERP Intelligence API & Dashboard

Initial repository scaffold for the Mobile SERP Intelligence platform.

## Overview

This repository is organized as a JavaScript workspace monorepo with separate areas for the API, dashboard, and shared modules.

## Project Structure

- `apps/api` - API service package
- `apps/dashboard` - dashboard web app package
- `packages/shared` - shared utilities and types
- `docs` - project documentation

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run workspace checks:
   ```bash
   npm run lint
   npm run test
   ```
3. Read the user onboarding guide:
   - [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)
4. Review deployment automation and rollback runbook:
   - [docs/ci-cd.md](docs/ci-cd.md)

## Testing

- `npm run test` runs the Vitest integration suite in `tests/`.
- `npm run test:watch` runs tests in watch mode for local development.

## Next Steps

- Implement API service endpoints in `apps/api`
- Scaffold dashboard UI in `apps/dashboard`
- Add shared contracts and types in `packages/shared`
