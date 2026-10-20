# CubeGears — Company Panel

Production-oriented React 19 + Vite 6 company/workshop management frontend for
the CubeGears multi-tenant SaaS product. Django provides authentication,
entitlements, payments, invoices, credits, storage and tenant-scoped APIs.

## Development

Node 22 is used in CI.

```sh
npm ci
cp .env.example .env
npm run dev
```

The local backend defaults to `http://127.0.0.1:8000/api/v1`.
For staging/production, configure `VITE_API_URL` to the deployed Django
`/api/v1` endpoint. Never place secrets in `VITE_*` variables.

## Validation

```sh
npm run check
npm test
VITE_API_URL=https://api.example.invalid/api/v1 npm run build
npm run check:bundle
npx playwright install chromium
UI_PRODUCTION=1 npm run test:ui
```

The `example.invalid` build URL is for isolated CI/testing only; replace it
with the real HTTPS backend during deployment. `npm run verify` combines
lint, Node regression tests, build and bundle guardrails (API URL required).

Browser smoke tests intercept API calls using isolated fixtures and block
writes. They cover route layouts across desktop, tablet and phone but cannot
verify real Django data, SMTP, payment capture or Celery workers. Use staging
integration tests before production releases.

See [production readiness and release checklist](docs/production-readiness.md)
and [SaaS owner onboarding](docs-owner-saas-onboarding.md).
