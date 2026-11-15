import { Receipt } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/company/accounting/i18n';

export const manifest: ModuleManifest = {
  id: 'accounting',
  area: 'company',
  order: 40,
  label: t('label'),
  description: t('description'),
  icon: Receipt,
  routes: [{ path: '', load: () => import('@/modules/company/accounting/pages/index-page') }],
};
