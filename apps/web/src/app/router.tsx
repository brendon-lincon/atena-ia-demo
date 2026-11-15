import { createBrowserRouter, type RouteObject } from 'react-router';
import { registry } from '@/core/module-registry/registry';
import type { ModuleManifest } from '@/core/module-registry/types';
import { SkeletonCard } from '@/design/patterns/skeleton';
import { AuthGate } from './auth-gate';
import { ErrorPage, NotFoundPage } from './error-page';
import { ModuleStub } from './module-stub';
import { Shell } from './shell/shell';

function Loading() {
  return <SkeletonCard className="m-6" />;
}

/** Rotas de um módulo, geradas do manifesto (cada página é carregada sob demanda). */
function moduleRoutes(manifest: ModuleManifest): RouteObject[] {
  const base = manifest.id === 'dashboard' ? '' : manifest.id;
  const defs = manifest.routes ?? [];
  if (defs.length === 0) {
    return [
      manifest.id === 'dashboard'
        ? { index: true, element: <ModuleStub manifest={manifest} /> }
        : { path: base, element: <ModuleStub manifest={manifest} /> },
    ];
  }
  return defs.map((def) => {
    const path = [base, def.path].filter(Boolean).join('/');
    const lazy = async () => ({ Component: (await def.load()).default });
    return path === '' ? { index: true, lazy } : { path, lazy };
  });
}

export const router = createBrowserRouter([
  {
    path: '/login',
    HydrateFallback: Loading,
    lazy: async () => ({ Component: (await import('./login-page')).LoginPage }),
    errorElement: <ErrorPage />,
  },
  {
    path: '/',
    HydrateFallback: Loading,
    element: (
      <AuthGate>
        <Shell />
      </AuthGate>
    ),
    errorElement: <ErrorPage />,
    children: [
      ...registry.all().flatMap(moduleRoutes),
      {
        path: 'design',
        lazy: async () => ({
          Component: (await import('@/design/showcase/design-showcase')).DesignShowcase,
        }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
