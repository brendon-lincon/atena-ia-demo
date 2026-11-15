import { Calculator } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/engineering/budgets/i18n';

export const manifest: ModuleManifest = {
  id: 'budgets',
  area: 'engineering',
  order: 10,
  label: t('label'),
  description: t('description'),
  icon: Calculator,
  routes: [
    { path: '', load: () => import('@/modules/engineering/budgets/pages/budgets-page') },
    { path: 'new', load: () => import('@/modules/engineering/budgets/pages/budget-page') },
    { path: ':id', load: () => import('@/modules/engineering/budgets/pages/budget-page') },
  ],
  commands: [
    {
      id: 'budgets.create',
      label: t('newBudget'),
      group: 'create',
      to: '/budgets/new',
      keywords: ['criar', 'orçamento'],
    },
  ],
  records: { budgets: '/budgets/:id' },
};
