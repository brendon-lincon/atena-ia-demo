import { DraftingCompass } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/engineering/engineering/i18n';

export const manifest: ModuleManifest = {
  id: 'engineering',
  area: 'engineering',
  order: 20,
  label: t('label'),
  description: t('description'),
  icon: DraftingCompass,
  routes: [{ path: '', load: () => import('@/modules/engineering/engineering/pages/index-page') }],
};
