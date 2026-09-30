# CubixGear in-app guidance

This folder implements the reusable guidance architecture from the CubixGear Full Guidance & Onboarding UX Document.

- `GuidanceProvider.jsx`: per-user, versioned persistent guidance state.
- `GuidanceWindow.jsx`: responsive tour window, progress, skip/done, spotlight and keyboard support.
- `GuidancePageAction.jsx`: route-level Guide launcher and guidance preferences.
- `EmptyStateGuide.jsx`: reusable guided empty state for blank modules.
- `DemoModeBanner.jsx`: isolated guidance/demo walkthrough state that does not mutate live workshop records.
- `guides/index.js`: data-driven Dashboard, Job Card, Billing, Stock, Storage and Customer guides.

Guide completion is stored per user and guide version under `cubixgear:guidance:<userId>`.
