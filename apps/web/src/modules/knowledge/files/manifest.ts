import { FolderOpen } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/knowledge/files/i18n';

export const manifest: ModuleManifest = {
  id: 'files',
  area: 'knowledge',
  order: 20,
  label: t('label'),
  description: t('description'),
  icon: FolderOpen,
  routes: [
    { path: '', load: () => import('@/modules/knowledge/files/pages/index-page') },
    { path: ':id', load: () => import('@/modules/knowledge/files/pages/file-page') },
  ],
  records: { files: '/files/:id' },
  contributes: {
    'work.tabs': [
      {
        id: 'files.work-tab',
        label: t('workTab'),
        order: 70,
        load: () => import('@/modules/knowledge/files/components/work-tab'),
      },
    ],
  },
};
