import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/communication/contacts/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'all',
    label: t('tab_all'),
    resource: 'contacts',
    columns: [
      { id: 'name', header: t('col_all_name'), field: 'name' },
      { id: 'kind', header: t('col_all_kind'), field: 'kind', hideOnMobile: true },
      {
        id: 'roles',
        header: t('col_all_roles'),
        field: 'roles',
        format: 'list',
        hideOnMobile: true,
      },
      { id: 'city', header: t('col_all_city'), field: 'city', hideOnMobile: true },
      { id: 'phone', header: t('col_all_phone'), field: 'phone' },
    ],
    sort: 'name',
  },
  {
    id: 'companies',
    label: t('tab_companies'),
    resource: 'contacts',
    columns: [
      { id: 'name', header: t('col_companies_name'), field: 'name' },
      {
        id: 'roles',
        header: t('col_companies_roles'),
        field: 'roles',
        format: 'list',
        hideOnMobile: true,
      },
      { id: 'city', header: t('col_companies_city'), field: 'city' },
      { id: 'state', header: t('col_companies_state'), field: 'state', hideOnMobile: true },
    ],
    filter: { kind: 'company' },
    sort: 'name',
  },
  {
    id: 'people',
    label: t('tab_people'),
    resource: 'contacts',
    columns: [
      { id: 'name', header: t('col_people_name'), field: 'name' },
      { id: 'title', header: t('col_people_title'), field: 'title', hideOnMobile: true },
      { id: 'phone', header: t('col_people_phone'), field: 'phone' },
      { id: 'email', header: t('col_people_email'), field: 'email', hideOnMobile: true },
    ],
    filter: { kind: 'person' },
    sort: 'name',
  },
];
