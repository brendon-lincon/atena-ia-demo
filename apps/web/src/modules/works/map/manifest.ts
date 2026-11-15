import { Map } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/works/map/i18n';

export const manifest: ModuleManifest = {
  id: 'map',
  area: 'works',
  order: 50,
  label: t('label'),
  description: t('description'),
  icon: Map,
  routes: [{ path: '', load: () => import('@/modules/works/map/pages/map-page') }],
};
