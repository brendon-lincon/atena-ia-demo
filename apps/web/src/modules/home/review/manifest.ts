import { ClipboardCheck } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/home/review/i18n';

export const manifest: ModuleManifest = {
  id: 'review',
  area: 'home',
  order: 20,
  label: t('label'),
  description: t('description'),
  icon: ClipboardCheck,
  routes: [{ path: '', load: () => import('@/modules/home/review/pages/review-page') }],
};
