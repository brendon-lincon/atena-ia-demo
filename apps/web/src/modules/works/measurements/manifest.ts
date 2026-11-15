import { Ruler } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/works/measurements/i18n';

export const manifest: ModuleManifest = {
  id: 'measurements',
  area: 'works',
  order: 30,
  label: t('label'),
  description: t('description'),
  icon: Ruler,
  routes: [
    { path: '', load: () => import('@/modules/works/measurements/pages/measurements-page') },
    { path: ':id', load: () => import('@/modules/works/measurements/pages/measurements-page') },
  ],
  records: { measurements: '/measurements/:id' },
  contributes: {
    'work.tabs': [
      {
        id: 'measurements.work-tab',
        label: t('workTab'),
        order: 30,
        load: () => import('@/modules/works/measurements/components/work-tab'),
      },
    ],
  },
};
