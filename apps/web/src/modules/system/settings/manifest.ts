import { Settings } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/system/settings/i18n';

export const manifest: ModuleManifest = {
  id: 'settings',
  area: 'system',
  order: 30,
  label: t('label'),
  description: t('description'),
  icon: Settings,
  routes: [{ path: '', load: () => import('@/modules/system/settings/pages/settings-page') }],
};
