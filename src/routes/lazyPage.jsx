import { lazy, Suspense } from 'react';

// Suspend inside the page so the protected layout and navigation stay mounted.
export function lazyPage(load, exportName) {
  const Component = lazy(() => load().then(module => ({ default: module[exportName] })));
  return function RoutePage(props) {
    return (
      <Suspense fallback={<div role="status" aria-live="polite" className="route-loading" style={{ padding: 24 }}>
        Loading page…
      </div>}>
        <Component {...props} />
      </Suspense>
    );
  };
}
