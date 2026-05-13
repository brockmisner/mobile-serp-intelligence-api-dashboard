# Mobile SERP Intelligence: Getting Started

This guide covers the current MVP onboarding path for the API: run the server, verify health, authenticate, and call a protected SERP endpoint.

## Prerequisites

- Node.js 18+ and npm.
- A terminal with `curl`.
- Project dependencies installed.

## 1) Install Dependencies

```bash
npm install
```

## 2) Start the API

```bash
npm start
```

By default the server listens on `http://localhost:3000`.

## 3) Verify Service Health

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"ok":true}
```

## 4) Authenticate and Get a Token

Request a JWT from the login endpoint:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

Expected fields in the response:

- `accessToken`
- `tokenType` (`Bearer`)
- `expiresIn`

Export the token for subsequent requests:

```bash
export TOKEN="<accessToken>"
```

## 5) Call a Protected SERP Endpoint

Use the token to call the protected route:

```bash
curl http://localhost:3000/serp \
  -H "Authorization: Bearer $TOKEN"
```

Expected response shape:

```json
{
  "data": [
    {
      "keyword": "best pizza brooklyn",
      "rank": 3,
      "source": "google_mobile"
    }
  ],
  "requestedBy": "admin"
}
```

## Configuration

The following environment variables are supported:

- `PORT` (default: `3000`)
- `JWT_SECRET` (default: `dev-secret-change-me`)
- `JWT_EXPIRES_IN` (default: `1h`)
- `AUTH_DEMO_USER` (default: `admin`)
- `AUTH_DEMO_PASSWORD` (default: `password123`)
- `AUTH_DEMO_ROLE` (default: `admin`)

## Common Errors

- `401 unauthenticated`: missing, invalid, or expired bearer token.
- `401 invalid_credentials`: wrong username or password on `/auth/login`.
- `422 validation_error`: non-string or missing `username`/`password` in login payload.
- `404 not_found`: route does not exist.

## Scope Notes

This guide documents the current API baseline flow. As additional endpoints for tracked keywords, SERP runs, and intelligence signals are implemented, expand this document with those workflows.
