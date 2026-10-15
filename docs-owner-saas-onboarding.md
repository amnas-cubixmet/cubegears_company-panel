# SaaS Account onboarding

Deploy with the backend owner-onboarding change and run its database migration first.

- `isCompanyOwner`, `paidAccessRequired` and `effectivePermissions` come from Django authentication responses.
- After login/password setup the owner lands at `/account`. Staff use their effective workshop permissions.
- The access endpoint remains the live source of navigation and route permissions. Every `/account` route and wallet balance chip is hidden from non-owners, including wildcard staff.
- A newly registered company has no workshop modules or Dashboard until an owner activates paid access. Unpriced modules appear in the catalogue without an activation action.
- Account → Logs contains feature On/Off/resume events and persisted monthly usage statements. Disabled labels retain business records and can resume already-paid access.
- The company slug is shown as the tenant identifier. A configured wildcard address still requires operator-provisioned DNS/TLS/hosting; this frontend does not provision a subdomain.

Production build requires `VITE_API_URL` pointing to the matching Django `/api/v1` deployment. Test coverage for owner landing and effective permissions is in `tests/ownerOnboarding.test.js`.
