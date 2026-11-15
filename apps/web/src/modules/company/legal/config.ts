import type { ConfigTab } from '@/core/module-config/types';
import { t } from '@/modules/company/legal/i18n';

export const tabs: ConfigTab[] = [
  {
    id: 'contracts',
    label: t('tab_contracts'),
    resource: 'contracts',
    columns: [
      { id: 'number', header: t('col_contracts_number'), field: 'number' },
      { id: 'title', header: t('col_contracts_title'), field: 'title' },
      {
        id: 'kind',
        header: t('col_contracts_kind'),
        field: 'kind',
        format: 'badge',
        labels: {
          client: { label: t('lab_contracts_kind_client'), tone: 'info' },
          subcontract: { label: t('lab_contracts_kind_subcontract'), tone: 'info' },
          lease: { label: t('lab_contracts_kind_lease'), tone: 'neutral' },
        },
        hideOnMobile: true,
      },
      {
        id: 'partyId',
        header: t('col_contracts_partyId'),
        field: 'partyId',
        format: 'name',
        hideOnMobile: true,
      },
      {
        id: 'valueCents',
        header: t('col_contracts_valueCents'),
        field: 'valueCents',
        format: 'money',
        align: 'right',
      },
      { id: 'endDate', header: t('col_contracts_endDate'), field: 'endDate', format: 'date' },
      {
        id: 'status',
        header: t('col_contracts_status'),
        field: 'status',
        format: 'badge',
        labels: {
          active: { label: t('lab_contracts_status_active'), tone: 'success' },
          closed: { label: t('lab_contracts_status_closed'), tone: 'neutral' },
        },
      },
    ],
    sort: '-startDate',
  },
  {
    id: 'deadlines',
    label: t('tab_deadlines'),
    resource: 'deadlines',
    columns: [
      { id: 'title', header: t('col_deadlines_title'), field: 'title' },
      { id: 'dueDate', header: t('col_deadlines_dueDate'), field: 'dueDate', format: 'validity' },
      {
        id: 'kind',
        header: t('col_deadlines_kind'),
        field: 'kind',
        format: 'badge',
        labels: {
          aso: { label: t('lab_deadlines_kind_aso'), tone: 'warning' },
          training: { label: t('lab_deadlines_kind_training'), tone: 'info' },
          license: { label: t('lab_deadlines_kind_license'), tone: 'info' },
          certificate: { label: t('lab_deadlines_kind_certificate'), tone: 'neutral' },
          insurance: { label: t('lab_deadlines_kind_insurance'), tone: 'neutral' },
          contract: { label: t('lab_deadlines_kind_contract'), tone: 'neutral' },
          obligation: { label: t('lab_deadlines_kind_obligation'), tone: 'warning' },
          registration: { label: t('lab_deadlines_kind_registration'), tone: 'neutral' },
          ppe: { label: t('lab_deadlines_kind_ppe'), tone: 'neutral' },
        },
      },
    ],
    filter: { kind: 'contract,insurance' },
    sort: 'dueDate',
  },
];
