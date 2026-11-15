import { ShieldCheck } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/works/compliance/i18n';

export const manifest: ModuleManifest = {
  id: 'compliance',
  area: 'works',
  order: 40,
  label: t('label'),
  description: t('description'),
  icon: ShieldCheck,
  routes: [{ path: '', load: () => import('@/modules/works/compliance/pages/compliance-page') }],
  contributes: {
    'work.tabs': [
      {
        id: 'compliance.work-tab',
        label: t('workTab'),
        order: 40,
        load: () => import('@/modules/works/compliance/components/work-tab'),
      },
    ],
  },
};
