# SaaS Account onboarding

Deploy with the backend owner-onboarding change and run its database migration first.

- `isCompanyOwner`, `paidAccessRequired` and `effectivePermissions` come from Django authentication responses.
- After login/password setup the owner lands at `/account`. Staff use their effective workshop permissions.
- The access endpoint remains the live source of navigation and route permissions. Every `/account` route and wallet balance chip is hidden from non-owners, including wildcard staff.
- A newly registered company has no workshop modules or Dashboard until an owner activates paid access. Unpriced modules appear in the catalogue without an activation action.
- Account → Logs contains feature On/Off/resume events and persisted monthly usage statements. Disabled labels retain business records and can resume already-paid access.
- The company slug is shown as the tenant identifier. A configured wildcard address still requires operator-provisioned DNS/TLS/hosting; this frontend does not provision a subdomain.

Production build requires `VITE_API_URL` pointing to the matching Django `/api/v1` deployment. Test coverage for owner landing and effective permissions is in `tests/ownerOnboarding.test.js`.

Account routes now use a dedicated SaaS layout with company identity and sign-out only. The workshop sidebar, global search, breadcrumbs, profile dropdown and mobile workshop menu are not mounted inside this workspace.

When the backend reports paid/label enforcement and no authorized active modules, the owner can open only the overview, credit purchase, feature activation and credit log routes. Other direct URLs, including `/profile`, account storage/templates/security and workshop deep links, return to `/account`. Staff without an authorized active module see a locked-access notice with refresh/sign-out only. Unavailable access verification also renders this notice instead of a workshop shell. After activation, the normal server-derived feature and role checks decide workshop access.

Pair this UI with backend migration `companies.0004_lock_existing_company_modules`, which enables paid-module enforcement for existing companies while preserving purchases. This UI continues to use the authoritative backend policy and entitlements.
