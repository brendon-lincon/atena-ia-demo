import { ChartColumn } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/knowledge/reports/i18n';

export const manifest: ModuleManifest = {
  id: 'reports',
  area: 'knowledge',
  order: 40,
  label: t('label'),
  description: t('description'),
  icon: ChartColumn,
  routes: [{ path: '', load: () => import('@/modules/knowledge/reports/pages/index-page') }],
};
