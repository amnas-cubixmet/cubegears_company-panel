# CubixGear Company Panel — production release gate

## Required frontend environment

Set on Vercel or other production host:

- `VITE_API_URL=https://YOUR-BACKEND-HOST/api/v1`
- `VITE_USE_MOCK_API=false`
- `VITE_API_TIMEOUT=15000`
- `VITE_API_WITH_CREDENTIALS=false`

Use the real public HTTPS backend, not localhost or the CI placeholder `api.example.invalid`. Do not put credentials, `DATABASE_URL`, JWT secrets, or private values in `VITE_*`; those variables are exposed in browser bundles.

## Local checks

```bash
npm ci
npm run check
node --test tests/*.test.js
npm run build:prod
```

## Verify before deployment

1. Django in production mode: `DEBUG=False`, proper `ALLOWED_HOSTS`, CORS/CSRF, HTTPS, database, media backup and recovery.
2. Public signup creates a **company** super admin only. Test setup-password, login, refresh, logout and `GET /auth/me`.
3. Enforce company/branch/role on **all backend endpoints**. Test users from two companies cannot read or mutate each other's records. Frontend route hiding is not an access-control boundary.
4. Test low-privilege staff on direct routes and REST requests, not just visible navigation items.
5. End-to-end job from complaint through delivery; inspect estimate, inventory, outside parts/labour, QC, invoice, payments and stock consistency.
6. Confirm daily-wage payroll only, GST handling for business invoices and individual service bills, e-way-bill status, and report accuracy.
7. Test mobile and desktop, uploads, nested-route refresh, API failures, expired token and password recovery.
8. Confirm real production deployment with monitoring, database backups, rollback and live smoke tests.

This checklist is not a claim of fully completed end-to-end production testing.
