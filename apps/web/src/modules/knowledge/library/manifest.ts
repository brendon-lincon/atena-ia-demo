import { Library } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/knowledge/library/i18n';

export const manifest: ModuleManifest = {
  id: 'library',
  area: 'knowledge',
  order: 10,
  label: t('label'),
  description: t('description'),
  icon: Library,
  routes: [{ path: '', load: () => import('@/modules/knowledge/library/pages/library-page') }],
  records: { 'library-items': '/library?tab=consult' },
};
