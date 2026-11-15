import { Scale } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/company/legal/i18n';

export const manifest: ModuleManifest = {
  id: 'legal',
  area: 'company',
  order: 70,
  label: t('label'),
  description: t('description'),
  icon: Scale,
  routes: [{ path: '', load: () => import('@/modules/company/legal/pages/index-page') }],
};
