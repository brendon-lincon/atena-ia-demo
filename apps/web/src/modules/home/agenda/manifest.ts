import { CalendarDays } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/home/agenda/i18n';

export const manifest: ModuleManifest = {
  id: 'agenda',
  area: 'home',
  order: 40,
  label: t('label'),
  description: t('description'),
  icon: CalendarDays,
  routes: [{ path: '', load: () => import('@/modules/home/agenda/pages/index-page') }],
};
