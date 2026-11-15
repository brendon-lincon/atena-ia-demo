import { ShoppingCart } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/company/procurement/i18n';

export const manifest: ModuleManifest = {
  id: 'procurement',
  area: 'company',
  order: 20,
  label: t('label'),
  description: t('description'),
  icon: ShoppingCart,
  routes: [{ path: '', load: () => import('@/modules/company/procurement/pages/index-page') }],
  records: {
    'purchase-requests': '/procurement?tab=requests&open=:id',
    quotes: '/procurement?tab=quotes',
  },
};
