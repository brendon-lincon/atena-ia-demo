import { LayoutDashboard } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/home/dashboard/i18n';

export const manifest: ModuleManifest = {
  id: 'dashboard',
  area: 'home',
  order: 10,
  label: t('label'),
  description: t('description'),
  icon: LayoutDashboard,
  routes: [{ path: '', load: () => import('@/modules/home/dashboard/pages/dashboard-page') }],
};
