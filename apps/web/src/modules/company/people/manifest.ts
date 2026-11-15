import { Users } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/company/people/i18n';

export const manifest: ModuleManifest = {
  id: 'people',
  area: 'company',
  order: 50,
  label: t('label'),
  description: t('description'),
  icon: Users,
  routes: [
    { path: '', load: () => import('@/modules/company/people/pages/index-page') },
    { path: ':id', load: () => import('@/modules/company/people/pages/employee-page') },
  ],
  records: { employees: '/people/:id' },
};
