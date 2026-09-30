# CubeGears component system

Use these folders as the canonical source for shared UI:

- `ui/`: primitive controls and visual elements
- `form/`: form composition and messages
- `cards/`: reusable business cards
- `data-display/`: tables, pagination, status and empty states
- `feedback/`: alerts, toast, modal, drawer and confirmation
- `navigation/`: navigation patterns and shell exports
- `layout/`: page containers, headers, sections, grids and panels

The internal reference route is `/components`.

The project uses Tailwind CSS v4 through the official Vite plugin. Design tokens are mapped in `src/index.css`, and reusable semantic component classes are composed with Tailwind in `src/styles/component-system.css`.

Legacy imports under `components/common/` remain as compatibility re-exports. New code should import from the canonical folder. Do not recreate shared controls with page-level inline CSS.
