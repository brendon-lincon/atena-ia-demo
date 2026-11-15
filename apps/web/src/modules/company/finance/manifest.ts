import { Wallet } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/company/finance/i18n';

export const manifest: ModuleManifest = {
  id: 'finance',
  area: 'company',
  order: 30,
  label: t('label'),
  description: t('description'),
  icon: Wallet,
  routes: [{ path: '', load: () => import('@/modules/company/finance/pages/index-page') }],
  contributes: {
    'work.tabs': [
      {
        id: 'finance.work-tab',
        label: t('workTab'),
        order: 60,
        load: () => import('@/modules/company/finance/components/work-tab'),
      },
    ],
  },
};
