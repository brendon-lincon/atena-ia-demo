import { BookOpen } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/system/manual/i18n';

export const manifest: ModuleManifest = {
  id: 'manual',
  area: 'system',
  order: 20,
  label: t('label'),
  description: t('description'),
  icon: BookOpen,
  routes: [{ path: '', load: () => import('@/modules/system/manual/pages/manual-page') }],
};
