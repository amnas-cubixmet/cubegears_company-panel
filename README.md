# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.


## Project validation

Install with `npm ci`. Use `npm test` for every Node regression test and
`npm run check` for source linting. `VITE_API_URL=https://your-api/api/v1 npm run verify`
runs lint, every unit/source regression, and the production build. A production
build requires an explicit Django API URL.

For browser layout checks, install Chromium once with
`npx playwright install --with-deps chromium`, then run `npm run test:ui`.
The script starts its own local Vite server and discovers every static,
non-redirect route from AppRoutes. It checks desktop (1440px), tablet (768px),
phone (390px) and narrow phone (360px), including light and dark themes.
It catches page/render errors, unexpected access denial, horizontal page
overflow and undersized form text. Failures save screenshots under the system
temporary directory `cubegears-ui-smoke`; CI uploads these when checks fail.

These browser checks intercept API requests with isolated fixtures and reject
writes. They do not validate live Django data, SMTP, payment capture, populated
record detail routes, or every interactive workflow. Django tests run in the
backend repository. For a focused local pass use `UI_QUICK=1 npm run test:ui`
(phone only) or `UI_PATH_FILTER=/settings npm run test:ui`. A managed browser
binary can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

The shared UI uses the existing 16px desktop text scale, 14px phone/tablet
content and actions, 16px editable controls, and 12px compact navigation/status
labels. Document previews and print layouts keep their authored styles.
