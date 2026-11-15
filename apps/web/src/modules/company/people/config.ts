import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/company/people/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'employees',
    label: t('tab_employees'),
    resource: 'employees',
    columns: [
      { id: 'name', header: t('col_employees_name'), field: 'name' },
      { id: 'roleLabel', header: t('col_employees_roleLabel'), field: 'roleLabel' },
      {
        id: 'obraId',
        header: t('col_employees_obraId'),
        field: 'obraId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'admissionDate',
        header: t('col_employees_admissionDate'),
        field: 'admissionDate',
        format: 'date',
        hideOnMobile: true,
      },
      {
        id: 'salaryCents',
        header: t('col_employees_salaryCents'),
        field: 'salaryCents',
        format: 'money',
        align: 'right',
        hideOnMobile: true,
      },
      {
        id: 'status',
        header: t('col_employees_status'),
        field: 'status',
        format: 'badge',
        labels: { active: { label: t('lab_employees_status_active'), tone: 'success' } },
        hideOnMobile: true,
      },
    ],
    sort: 'name',
  },
  {
    id: 'advances',
    label: t('tab_advances'),
    resource: 'advances',
    columns: [
      { id: 'date', header: t('col_advances_date'), field: 'date', format: 'date' },
      {
        id: 'employeeId',
        header: t('col_advances_employeeId'),
        field: 'employeeId',
        format: 'name',
      },
      {
        id: 'kind',
        header: t('col_advances_kind'),
        field: 'kind',
        format: 'badge',
        labels: {
          advance: { label: t('lab_advances_kind_advance'), tone: 'neutral' },
          transport: { label: t('lab_advances_kind_transport'), tone: 'neutral' },
          meal: { label: t('lab_advances_kind_meal'), tone: 'neutral' },
          travel: { label: t('lab_advances_kind_travel'), tone: 'neutral' },
        },
      },
      {
        id: 'amountCents',
        header: t('col_advances_amountCents'),
        field: 'amountCents',
        format: 'money',
        align: 'right',
      },
      {
        id: 'status',
        header: t('col_advances_status'),
        field: 'status',
        format: 'badge',
        labels: {
          requested: { label: t('lab_advances_status_requested'), tone: 'warning' },
          approved: { label: t('lab_advances_status_approved'), tone: 'info' },
          paid: { label: t('lab_advances_status_paid'), tone: 'success' },
        },
      },
    ],
    sort: '-date',
  },
  {
    id: 'allocations',
    label: t('tab_allocations'),
    resource: 'allocations',
    columns: [
      {
        id: 'employeeId',
        header: t('col_allocations_employeeId'),
        field: 'employeeId',
        format: 'name',
      },
      { id: 'obraId', header: t('col_allocations_obraId'), field: 'obraId', format: 'name' },
      {
        id: 'startDate',
        header: t('col_allocations_startDate'),
        field: 'startDate',
        format: 'date',
        hideOnMobile: true,
      },
      {
        id: 'endDate',
        header: t('col_allocations_endDate'),
        field: 'endDate',
        format: 'date',
        hideOnMobile: true,
      },
      {
        id: 'teamName',
        header: t('col_allocations_teamName'),
        field: 'teamName',
        hideOnMobile: true,
      },
    ],
    sort: 'startDate',
  },
];
