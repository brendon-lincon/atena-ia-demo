import { Briefcase } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/company/admin/i18n';

export const manifest: ModuleManifest = {
  id: 'admin',
  area: 'company',
  order: 80,
  label: t('label'),
  description: t('description'),
  icon: Briefcase,
  routes: [{ path: '', load: () => import('@/modules/company/admin/pages/index-page') }],
};
