import { HardHat } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from './i18n';

export const manifest: ModuleManifest = {
  id: 'works',
  area: 'works',
  order: 10,
  label: t('label'),
  description: t('description'),
  icon: HardHat,
  routes: [
    { path: '', load: () => import('./pages/works-page') },
    { path: ':id', load: () => import('./pages/work-page') },
  ],
  records: { obras: '/works/:id' },
};
