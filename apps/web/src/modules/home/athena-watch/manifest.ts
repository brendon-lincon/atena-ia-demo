import { Eye } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/home/athena-watch/i18n';

export const manifest: ModuleManifest = {
  id: 'athena-watch',
  area: 'home',
  order: 30,
  label: t('label'),
  description: t('description'),
  icon: Eye,
  routes: [{ path: '', load: () => import('@/modules/home/athena-watch/pages/athena-watch-page') }],
};
