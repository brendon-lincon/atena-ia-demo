import { Handshake } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/company/commercial/i18n';

export const manifest: ModuleManifest = {
  id: 'commercial',
  area: 'company',
  order: 10,
  label: t('label'),
  description: t('description'),
  icon: Handshake,
  routes: [{ path: '', load: () => import('@/modules/company/commercial/pages/index-page') }],
};
