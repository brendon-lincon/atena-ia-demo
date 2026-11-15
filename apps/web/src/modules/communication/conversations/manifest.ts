import { MessageCircle } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/communication/conversations/i18n';

export const manifest: ModuleManifest = {
  id: 'conversations',
  area: 'communication',
  order: 10,
  label: t('label'),
  description: t('description'),
  icon: MessageCircle,
  routes: [
    {
      path: '',
      load: () => import('@/modules/communication/conversations/pages/conversations-page'),
    },
  ],
  contributes: {
    'work.tabs': [
      {
        id: 'conversations.work-tab',
        label: t('workTab'),
        order: 80,
        load: () => import('@/modules/communication/conversations/components/work-tab'),
      },
    ],
  },
  commands: [
    {
      id: 'conversations.create',
      label: t('send'),
      group: 'create',
      to: '/conversations',
      keywords: ['mensagem', 'whatsapp'],
    },
  ],
};
