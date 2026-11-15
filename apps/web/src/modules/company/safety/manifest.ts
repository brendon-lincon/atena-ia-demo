import { ShieldAlert } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/company/safety/i18n';

export const manifest: ModuleManifest = {
  id: 'safety',
  area: 'company',
  order: 60,
  label: t('label'),
  description: t('description'),
  icon: ShieldAlert,
  routes: [{ path: '', load: () => import('@/modules/company/safety/pages/index-page') }],
};
