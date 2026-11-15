import { Sparkles } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/system/athena/i18n';

export const manifest: ModuleManifest = {
  id: 'athena',
  area: 'system',
  order: 10,
  label: t('label'),
  description: t('description'),
  icon: Sparkles,
  routes: [{ path: '', load: () => import('@/modules/system/athena/pages/index-page') }],
};
