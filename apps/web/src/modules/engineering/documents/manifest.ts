import { FileText } from 'lucide-react';
import type { ModuleManifest } from '@/core/module-registry/types';
import { t } from '@/modules/engineering/documents/i18n';

export const manifest: ModuleManifest = {
  id: 'documents',
  area: 'engineering',
  order: 30,
  label: t('label'),
  description: t('description'),
  icon: FileText,
  routes: [
    { path: '', load: () => import('@/modules/engineering/documents/pages/documents-page') },
    { path: ':id', load: () => import('@/modules/engineering/documents/pages/document-page') },
  ],
  commands: [
    {
      id: 'documents.create',
      label: t('tabs.create'),
      group: 'create',
      to: '/documents?tab=create',
      keywords: ['criar', 'documento', 'memorial', 'contrato'],
    },
  ],
  records: { documents: '/documents/:id' },
};
