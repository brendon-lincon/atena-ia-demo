import { Palette } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/knowledge/standards/i18n';

export const manifest: ModuleManifest = {
  id: 'standards',
  area: 'knowledge',
  order: 30,
  label: t('label'),
  description: t('description'),
  icon: Palette,
  routes: [{ path: '', load: () => import('@/modules/knowledge/standards/pages/standards-page') }],
};
