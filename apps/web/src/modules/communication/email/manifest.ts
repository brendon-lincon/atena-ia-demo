import { Mail } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/communication/email/i18n';

export const manifest: ModuleManifest = {
  id: 'email',
  area: 'communication',
  order: 20,
  label: t('label'),
  description: t('description'),
  icon: Mail,
  routes: [{ path: '', load: () => import('@/modules/communication/email/pages/index-page') }],
};
