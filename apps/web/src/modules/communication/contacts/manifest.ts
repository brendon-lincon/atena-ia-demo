import { Contact } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/communication/contacts/i18n';

export const manifest: ModuleManifest = {
  id: 'contacts',
  area: 'communication',
  order: 30,
  label: t('label'),
  description: t('description'),
  icon: Contact,
  routes: [
    { path: '', load: () => import('@/modules/communication/contacts/pages/index-page') },
    { path: ':id', load: () => import('@/modules/communication/contacts/pages/contact-page') },
  ],
  records: { contacts: '/contacts/:id' },
  commands: [
    {
      id: 'contacts.create',
      label: t('cmd_create'),
      group: 'create',
      to: '/contacts',
      keywords: ['criar', 'contato'],
    },
  ],
};
