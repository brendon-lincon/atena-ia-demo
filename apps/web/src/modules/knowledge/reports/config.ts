import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/knowledge/reports/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'gallery',
    label: t('tab_gallery'),
    resource: 'reports',
    columns: [
      { id: 'title', header: t('col_gallery_title'), field: 'title' },
      { id: 'category', header: t('col_gallery_category'), field: 'category' },
      {
        id: 'description',
        header: t('col_gallery_description'),
        field: 'description',
        hideOnMobile: true,
      },
      { id: 'schedule', header: t('col_gallery_schedule'), field: 'schedule', hideOnMobile: true },
      {
        id: 'lastRunAt',
        header: t('col_gallery_lastRunAt'),
        field: 'lastRunAt',
        format: 'datetime',
        hideOnMobile: true,
      },
    ],
    sort: 'title',
    views: ['cards', 'table'],
  },
];
