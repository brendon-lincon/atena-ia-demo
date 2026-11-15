import { GanttChart } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/works/planning/i18n';

export const manifest: ModuleManifest = {
  id: 'planning',
  area: 'works',
  order: 20,
  label: t('label'),
  description: t('description'),
  icon: GanttChart,
  routes: [{ path: '', load: () => import('@/modules/works/planning/pages/planning-page') }],
  contributes: {
    'work.tabs': [
      {
        id: 'planning.work-tab',
        label: t('workTab'),
        order: 20,
        load: () => import('@/modules/works/planning/components/work-tab'),
      },
    ],
  },
};
