import { ListChecks } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/home/tasks/i18n';

export const manifest: ModuleManifest = {
  id: 'tasks',
  area: 'home',
  order: 50,
  label: t('label'),
  description: t('description'),
  icon: ListChecks,
  routes: [{ path: '', load: () => import('@/modules/home/tasks/pages/tasks-page') }],
  commands: [
    {
      id: 'tasks.create',
      label: t('newTask'),
      group: 'create',
      to: '/tasks?new=1',
      keywords: ['criar', 'tarefa'],
    },
  ],
  contributes: {
    'work.tabs': [
      {
        id: 'tasks.work-tab',
        label: t('workTab'),
        order: 10,
        load: () => import('@/modules/home/tasks/components/work-tab'),
      },
    ],
  },
};
